# How CanIHost Works

> This document walks the architecture, data pipeline, and internals for contributors and curious readers. For the project overview and quick-start, see the [README](./README.md).

---

## 1. Overview

CanIHost is a searchable frontend for the [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) list — 1,300+ self-hosted applications that anyone can run on their own hardware. The upstream list is a community-maintained GitHub README sorted A→Z by tech category. CanIHost turns it into a fast, goal-first directory: you start from what you want to do ("Replace Google Photos", "Block ads network-wide") rather than hunting a category like "Photo Galleries". On top of discovery, CanIHost adds two tools the plain list can't offer — a "Can I run this?" resource calculator that gives honest, category-based RAM/CPU estimates for any set of apps, and a docker-compose generator that turns a selection into a working `docker-compose.yml` scaffold.

---

## 2. Architecture at a glance

- **Next.js 15** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4** · **framer-motion**
- **Static-first / fully client-side at runtime.** The single page (`app/page.tsx`) is a Next.js server component that imports `data/apps.json` and `data/meta.json` at build time. Everything below the fold — search, filter, sort, the calculator, the compose generator — runs entirely in the browser. There is no database, no API route, and no server-side rendering of the directory grid.
- **One server touch per deploy:** `app/page.tsx` fetches the CanIHost GitHub star count via `fetch(..., { next: { revalidate: 3600 } })` to keep the header badge fresh. That is the only network call after build time.
- **Hosted on Vercel free tier.** The build output is a static shell + a single revalidating RSC; it fits comfortably within Vercel's free limits.

---

## 3. Data pipeline

**Script:** `scripts/build-data.mjs`
**Run:** `npm run data` (after cloning the upstream source to `/tmp/awesome-selfhosted-data`)

### Upstream source

The script reads from a local clone of [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data) — the machine-readable counterpart to the README. It contains:

- `software/*.yml` — one YAML file per app
- `tags/*.yml` — category/tag definitions
- `licenses.yml` — SPDX license registry

The upstream YAML already carries GitHub signals (`stargazers_count`, `updated_at`, `commit_history`, `archived`) scraped by the awesome-selfhosted maintainers, so CanIHost needs **zero** runtime GitHub API calls.

### Transform steps

1. **Parse YAML** — every `software/*.yml` is loaded with `js-yaml`. The filename (minus `.yml`) becomes the app's `id`.
2. **Resolve repo owner/name** — extracted from `source_code_url` via a GitHub URL regex: `github.com/([^/]+/[^/?#]+)`.
3. **Derive maintenance status** (`maintenance()`) — `updated_at` is compared against a hardcoded `TODAY` date:
   - ≤ 180 days → `"active"`
   - ≤ 540 days → `"aging"`
   - > 540 days → `"stale"`
   - `archived: true` → `"archived"`
   - Recent commit volume is the sum of the last 6 buckets of `commit_history`.
4. **Estimate resources** (`estimateResources()`) — category-based heuristics keyed on `tags`. The `CATEGORY_PROFILE` table maps tag substrings to `(ramMB, cpuWeight, note)` pairs. A separate `RUNTIME_FLOOR` table bumps the RAM floor for heavier language runtimes (Java → 768 MB, PHP → 384 MB, Go → 128 MB, etc.). Apps that `depends_3rdparty` get +256 MB added.
5. **Infer ARM compatibility** (`archCompat()`) — checks the `platforms` array against a known-ARM-friendly list (Go, Rust, Python, Node, PHP, Ruby, Java, and 15+ others). `"likely"` if any friendly runtime is found; `"unknown"` otherwise.
6. **Build compose scaffold** (`dockerScaffold()`) — looks up the app's slug or repo owner/name in a curated `KNOWN_IMAGES` map (jellyfin, nextcloud, gitea, vaultwarden, immich, and ~30 others). Falls back to `owner/name:latest` (flagged `imageIsGuess: true`). Picks a default port from `CATEGORY_PORT`. Sets `needsDatabase: true` for groupware, CMS, wiki, analytics, git, and similar heavy-stack categories.
7. **Sort** — by stars descending (nulls last), then name.

### Output files

| File | Contents |
|---|---|
| `data/apps.json` | Array of `App` records (see shape below) |
| `data/meta.json` | Build metadata: count, category list, platform list, license registry, counts of starred / active apps |

### App record shape

```ts
type App = {
  id: string;               // filename slug, e.g. "jellyfin"
  name: string;
  description: string;
  website: string | null;
  source: string | null;    // source_code_url
  demo: string | null;
  repo: string | null;      // "owner/name" extracted from GitHub URL
  tags: string[];           // upstream category tags
  platforms: string[];      // languages / runtimes
  licenses: string[];       // SPDX identifiers
  licenseNames: string[];   // resolved full names
  dependsThirdParty: boolean;
  docker: boolean;
  stars: number | null;
  updatedAt: string | null;
  archived: boolean;
  release: string | null;
  releaseDate: string | null;
  maintenance: {
    status: "active" | "aging" | "stale" | "archived" | "unknown";
    daysSince: number | null;
    recentCommits: number;   // sum of last 6 commit-history buckets
  };
  resources: {
    ramMB: number;           // honest category-based estimate
    cpuWeight: number;       // coarse 1–3 "core load" weight
    note: string;            // human explanation of the estimate
  };
  arch: {
    arm: "likely" | "unknown";
    x86: "yes";
  };
  scaffold: {
    image: string;
    imageIsGuess: boolean;
    port: number | null;
    needsVolume: boolean;
    needsDatabase: boolean;
  };
};
```

---

## 4. The use-case layer — `lib/usecases.ts`

The upstream list organizes apps by what they *are* (tech categories). People think in *goals* — "I want to replace Google Photos." `lib/usecases.ts` defines 24 plain-language goals that map over the tech taxonomy.

```ts
type UseCase = {
  id: string;           // e.g. "photos"
  label: string;        // "Replace Google Photos"
  short: string;        // "Photos" (chip label)
  replaces: string[];   // ["Google Photos", "iCloud Photos"]
  icon: string;         // emoji
  appIds: string[];     // curated top picks, shown first in results
  tags: string[];       // upstream tag names used as a fallback match
};
```

**Matcher — `matchUseCase(apps, uc)`:**
1. Builds an `idOrder` map from `uc.appIds` (position → priority).
2. Filters apps to those whose `id` is in `idOrder` OR whose `tags` overlap `uc.tags`.
3. Sorts: curated picks (by `idOrder` position) first, then the rest by star count.

**Usage in the UI:** `Directory.tsx` calls `matchUseCase` inside a `useMemo` whenever `filters.goal` changes. The result becomes the `base` array that all other filters (search query, category, license, etc.) then refine.

`useCaseCounts(apps)` precomputes the per-goal result count so `UseCaseGrid.tsx` can show a badge on each tile without re-running the matcher on every render.

---

## 5. Key components and data flow

```
app/page.tsx (RSC)
  └─ imports apps.json + meta.json at build time
  └─ wraps everything in <SelectionProvider>
       ├─ <Header>          — logo, star count, nav
       ├─ <Hero>            — stats, tagline
       ├─ <BuildStudio>     — "Your build" panel (calculator + compose tabs)
       ├─ <Directory>       — search/filter/goal grid
       ├─ <Footer>
       └─ <FloatingBuildBar> — live bottom bar
```

### State: `SelectionContext` / `useSelection`

`components/SelectionContext.tsx` is a React context that holds the set of selected app IDs. It hydrates from `localStorage` (`canihost:selection`) after mount to survive page refreshes. Any component can call `useSelection()` to get `{ selected, toggle, remove, clear, has }`.

### `Directory` component

1. Maintains `filters: Filters` state (query, goal, sort, activeOnly, dockerOnly, armOnly, category, platform, license, hideThirdParty).
2. `base` = `matchUseCase(apps, uc)` if a goal is active, else all apps.
3. `filtered` = `base` run through text search (splitting on whitespace, matching against name + description + tags + platforms) then each active boolean/select filter.
4. Sort is applied inside the same `useMemo`: stars, recently updated (by `daysSince`), lightest RAM, or A–Z.
5. Renders in pages of 60 with a "Show more" button.
6. `FilterBar` is sticky (top 57 px, backdrop-blur) — it stays on screen while you scroll.

### `AppCard`

Pure CSS card — no JS state of its own. Reads `useSelection()` for the selected ring style. Displays `RamBadge`, `ArmBadge`, `MaintenanceBadge`, `StarsBadge` from `components/Badges.tsx`. The `+` / check button calls `toggle(app.id)`.

### `UseCaseGrid`

Renders a responsive tile grid. Each tile shows the goal icon, label, a chip listing what it replaces, and a count badge from `useCaseCounts`. Clicking a tile calls `onSelect(id)` back in `Directory`, which sets `filters.goal` and smooth-scrolls to the results.

---

## 6. The differentiator features

### "Can I run this?" calculator — `lib/calculator.ts`

`computeFootprint(apps: App[]): Footprint`:

- Sums `resources.ramMB` across all selected apps → `appsRamMB`.
- Adds `HOST_OVERHEAD_MB = 512` (Linux + Docker engine baseline) → `totalRamMB`.
- Rounds `totalRamMB * 1.3` up to the nearest 512 MB tier → `recommendedRamMB` (the ~30% headroom).
- `cpuLoad` = sum of `resources.cpuWeight` values; `recommendedCpuCores` = `ceil(cpuLoad * 0.5)`.
- `armCompatible`: `"all"` if 0 apps are unknown-ARM, `"none"` if all are, `"most"` if ≤ half, else `"some"`.

`hardwareHint(recommendedRamMB)` maps the result to a human suggestion ("A Raspberry Pi 4 (2GB) or a small VPS works", "An 8GB mini-PC / Pi 5 (8GB) is a good fit", etc.).

These numbers are **honest category-based heuristics** — the code comments and the UI labels say so explicitly. They are not vendor specs.

### docker-compose generator — `lib/compose.ts`

`generateCompose(apps, opts)`:

- Derives the Docker image from `app.scaffold.image` (pre-computed in the data pipeline). If `imageIsGuess` is true, the output includes `# TODO: verify image`.
- Auto-increments host ports to avoid collisions: each app's preferred port is bumped by 1 if already used in this compose file.
- Every service gets `restart: unless-stopped`, `TZ`, `PUID`, `PGID` environment defaults.
- Apps with `needsDatabase` get commented-out `DB_*` env vars and a `# depends_on` hint.
- Apps with `needsVolume` get a named volume (`{svc}-data`).
- If any app needs a database, a commented-out Postgres 16-alpine service template is appended.
- The header comment is prominent: **"THIS IS A STARTER SCAFFOLD, NOT A PRODUCTION CONFIG."**

### Maintenance and ARM signals

Both signals are computed at build time and baked into each `App` record. The `MaintenanceBadge` component reads `app.maintenance.status` and renders a color-coded pill (green / amber / red). `ArmBadge` reads `app.arch.arm`. No runtime lookups are needed.

### Floating Build Bar — `components/FloatingBuildBar.tsx`

A framer-motion `AnimatePresence` spring-animates the bar in from the bottom whenever `selected.size > 0`. It calls `computeFootprint` live on every render, showing `~N GB RAM`, `~N cores`, and the ARM compatibility string. A "Build studio →" anchor-link jumps to the `#studio` section; the ✕ button calls `clear()`.

---

## 7. SEO and rendering

| Feature | Implementation |
|---|---|
| Title / description | `app/layout.tsx` — Next.js `Metadata` object |
| Open Graph | Same `Metadata` object — `openGraph` + `twitter` fields |
| JSON-LD | `app/page.tsx` — `WebApplication` schema injected as `<script type="application/ld+json">` |
| Sitemap | `app/sitemap.ts` — single URL entry, `changeFrequency: "weekly"` |
| robots.txt | `app/robots.ts` — allow all, points to `/sitemap.xml` |
| OG image | Uses the static `assets/hero.png` screenshot referenced in the README (no generated image route) |
| Font | Inter (sans) + JetBrains Mono loaded via `next/font/google` |

---

## 8. Run it locally

```bash
# 1. Install dependencies
npm install

# 2. (Re)generate data — clone the upstream source first
git clone --depth 1 https://github.com/awesome-selfhosted/awesome-selfhosted-data /tmp/awesome-selfhosted-data
npm run data          # writes data/apps.json + data/meta.json

# 3. Dev server
npm run dev           # → http://localhost:7681

# 4. Production build
npm run build

# 5. Capture README screenshots (requires a running dev or prod server)
npm run shot
```

The `--src` flag on `build-data.mjs` lets you point at a custom clone path:
```bash
node scripts/build-data.mjs --src /path/to/awesome-selfhosted-data
```

---

## 9. Project structure

```
canihost/
├── app/
│   ├── layout.tsx          # global metadata, fonts, body wrapper
│   ├── page.tsx            # RSC: imports JSON, emits JSON-LD, fetches star count
│   ├── globals.css         # Tailwind v4 base + custom CSS variables / utilities
│   ├── robots.ts           # robots.txt route
│   ├── sitemap.ts          # sitemap.xml route
│   └── icon.svg            # favicon
│
├── components/
│   ├── SelectionContext.tsx # global app-selection state (localStorage-backed)
│   ├── Directory.tsx        # search/filter/sort grid (client component)
│   ├── FilterBar.tsx        # sticky filter toolbar + Filters type
│   ├── AppCard.tsx          # individual app card (CSS-only, no local state)
│   ├── UseCaseGrid.tsx      # 24-goal tile grid
│   ├── BuildStudio.tsx      # "Your build" panel with calculator/compose tabs
│   ├── FloatingBuildBar.tsx # live bottom bar — footprint summary + build studio link
│   ├── Calculator.tsx       # renders Footprint output from lib/calculator.ts
│   ├── ComposeGenerator.tsx # renders compose YAML from lib/compose.ts
│   ├── Badges.tsx           # MaintenanceBadge, StarsBadge, ArmBadge, RamBadge, …
│   ├── Logo.tsx             # app logo with fallback monogram
│   ├── Header.tsx / Footer.tsx / Hero.tsx
│   └── icons.tsx            # inline SVG icon components
│
├── lib/
│   ├── types.ts            # App, Meta, MaintenanceStatus type definitions
│   ├── usecases.ts         # 24 UseCase definitions + matchUseCase() + useCaseCounts()
│   ├── calculator.ts       # computeFootprint() + hardwareHint()
│   ├── compose.ts          # generateCompose()
│   ├── format.ts           # shortCategory(), primaryLanguage(), formatting helpers
│   └── site.ts             # SITE constant (URLs, repo name)
│
├── scripts/
│   ├── build-data.mjs      # data pipeline: YAML → apps.json + meta.json
│   └── screenshot.mjs      # Playwright script to capture README screenshots
│
├── data/
│   ├── apps.json           # committed, baked app records (generated)
│   └── meta.json           # build metadata (generated)
│
└── assets/                 # README screenshots
```
