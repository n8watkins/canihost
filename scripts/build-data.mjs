#!/usr/bin/env node
// Build-time data pipeline: converts the awesome-selfhosted-data structured
// source (software/*.yml, tags/*.yml, licenses.yml) into a single baked
// data/apps.json that the static site consumes. No runtime network calls.
//
// The upstream YAML already carries maintenance signals (stargazers_count,
// updated_at, current_release, commit_history, archived) scraped from GitHub,
// so we reuse those instead of re-hitting the API. We additionally derive:
//   - a recency badge (active / aging / stale) from updated_at + commit_history
//   - honest, category-based RAM/CPU footprint ESTIMATES (clearly labeled)
//   - docker-compose scaffold hints (image guess, default port, volume needs)
//
// Usage: node scripts/build-data.mjs [--src /path/to/awesome-selfhosted-data]
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const SRC = flag("src", "/tmp/awesome-selfhosted-data");
const ROOT = path.join(import.meta.dirname, "..");
const OUT = path.join(ROOT, "data", "apps.json");
const META_OUT = path.join(ROOT, "data", "meta.json");

if (!fs.existsSync(SRC)) {
  console.error(
    `Source not found at ${SRC}.\n` +
      `Clone it first:\n  git clone --depth 1 https://github.com/awesome-selfhosted/awesome-selfhosted-data ${SRC}`
  );
  process.exit(1);
}

const TODAY = new Date("2026-06-13");

// ---------------------------------------------------------------------------
// licenses + tags lookups
// ---------------------------------------------------------------------------
const licenses = yaml.load(
  fs.readFileSync(path.join(SRC, "licenses.yml"), "utf8")
);
const licenseName = new Map(
  (licenses || []).map((l) => [l.identifier, l.name])
);

const tagsDir = path.join(SRC, "tags");
const tagMeta = new Map();
for (const f of fs.readdirSync(tagsDir)) {
  if (!f.endsWith(".yml")) continue;
  try {
    const t = yaml.load(fs.readFileSync(path.join(tagsDir, f), "utf8"));
    if (t?.name) tagMeta.set(t.name, t);
  } catch {}
}

// ---------------------------------------------------------------------------
// Resource heuristics. These are HONEST ESTIMATES based on the app's primary
// category and language runtime — NOT vendor specs. The site labels them as
// estimates everywhere. Values are "comfortable idle/light-use" guidance for a
// single-user homelab, in MB of RAM. CPU is a coarse 1-3 "core-load" weight.
// ---------------------------------------------------------------------------
// Keyed by substrings that appear in the upstream tag name (case-insensitive).
const CATEGORY_PROFILE = [
  // [tagMatch, ramMB, cpuWeight, note]
  ["media streaming", 1024, 3, "Transcoding can spike CPU/RAM hard"],
  ["media stream", 1024, 3, "Transcoding can spike CPU/RAM hard"],
  ["photo", 768, 2, "Thumbnail/ML jobs add bursts"],
  ["video", 768, 2, "Encoding is CPU-heavy"],
  ["machine learning", 2048, 3, "Models need lots of RAM / a GPU"],
  ["search engine", 1024, 2, "Indexing memory grows with corpus"],
  ["analytics", 512, 2, "Scales with event volume"],
  ["monitoring", 512, 2, "Retention drives storage + RAM"],
  ["groupware", 768, 2, "Bundles mail/cal/contacts"],
  ["email", 768, 2, "Mail stacks are multi-service"],
  ["e-commerce", 768, 2, "PHP/Java stacks are memory-hungry"],
  ["wiki", 384, 1, "Light unless heavily edited"],
  ["document management", 512, 2, "OCR/indexing adds load"],
  ["file transfer", 512, 2, "Sync indexing scales with files"],
  ["file sync", 512, 2, "Sync indexing scales with files"],
  ["cloud storage", 512, 2, "Sync indexing scales with files"],
  ["password manager", 256, 1, "Very light footprint"],
  ["bookmark", 256, 1, "Very light footprint"],
  ["url shortener", 192, 1, "Tiny"],
  ["pastebin", 192, 1, "Tiny"],
  ["feed reader", 256, 1, "Light; polling-bound"],
  ["rss", 256, 1, "Light; polling-bound"],
  ["note-taking", 256, 1, "Light footprint"],
  ["dashboard", 256, 1, "Mostly a thin frontend"],
  ["automation", 512, 2, "Workflow engines hold state"],
  ["home automation", 768, 2, "Many integrations add up"],
  ["communication", 768, 2, "Real-time services need headroom"],
  ["chat", 768, 2, "Real-time services need headroom"],
  ["database", 768, 2, "Memory scales with dataset"],
  ["proxy", 256, 1, "Lightweight gateway"],
  ["dns", 192, 1, "Tiny but always-on"],
  ["vpn", 256, 1, "Light; bandwidth-bound"],
  ["git", 512, 2, "CI/build can spike"],
  ["ci", 1024, 3, "Build agents are heavy"],
  ["blog", 384, 1, "Light CMS"],
  ["cms", 512, 2, "PHP stacks use more RAM"],
  ["gallery", 384, 1, "Light unless transcoding"],
  ["recipe", 256, 1, "Light footprint"],
  ["bookkeeping", 384, 1, "Light footprint"],
  ["money", 384, 1, "Light footprint"],
  ["task", 256, 1, "Light footprint"],
  ["todo", 256, 1, "Light footprint"],
  ["calendar", 384, 1, "Light footprint"],
  ["read", 384, 1, "Light footprint"],
  ["gaming", 1024, 3, "Game servers vary wildly"],
  ["game", 1024, 3, "Game servers vary wildly"],
];

// Runtime adjustment: some language runtimes carry a heavier baseline.
const RUNTIME_FLOOR = [
  ["Java", 768],
  ["PHP", 384],
  ["Ruby", 384],
  ["Python", 256],
  ["C#", 384],
  [".NET", 384],
  ["Elixir", 384],
  ["Erlang", 384],
  ["Node", 256],
  ["Go", 128],
  ["Rust", 96],
  ["C", 96],
  ["C++", 128],
];

function estimateResources(app) {
  let ram = 384; // default homelab baseline
  let cpu = 1;
  let note = "Generic estimate; check the project's own docs";
  const hay = (app.tags || []).join(" | ").toLowerCase();
  for (const [match, r, c, n] of CATEGORY_PROFILE) {
    if (hay.includes(match)) {
      ram = r;
      cpu = c;
      note = n;
      break;
    }
  }
  // Runtime floor: bump RAM up if the language baseline is higher.
  for (const [lang, floor] of RUNTIME_FLOOR) {
    if ((app.platforms || []).some((p) => p.toLowerCase() === lang.toLowerCase())) {
      if (floor > ram) ram = floor;
      break;
    }
  }
  // Apps that explicitly bundle a database / 3rd-party service: +256MB.
  if (app.dependsThirdParty) ram += 256;
  return { ramMB: ram, cpuWeight: cpu, note };
}

// ---------------------------------------------------------------------------
// ARM compatibility heuristic. Docker multi-arch is common now; we infer from
// the language runtime. Compiled-native languages and interpreted runtimes are
// almost universally ARM-friendly; we only flag "likely x86-only" for runtimes
// historically tied to x86 (rare). Honest default: "likely" with a caveat.
// ---------------------------------------------------------------------------
function archCompat(app) {
  const langs = (app.platforms || []).map((p) => p.toLowerCase());
  // Things that nearly always ship ARM images / run on ARM.
  const armFriendly = [
    "go", "rust", "python", "node", "nodejs", "php", "ruby", "java",
    "deno", "elixir", "erlang", "c", "c++", "c#", ".net", "dart", "kotlin",
    "docker", "deb", "shell", "perl", "lua", "crystal", "haskell", "scala",
    "nim", "zig", "swift", "typescript", "javascript",
  ];
  const hasFriendly = langs.some((l) => armFriendly.includes(l));
  return {
    arm: hasFriendly ? "likely" : "unknown",
    x86: "yes",
  };
}

// ---------------------------------------------------------------------------
// Maintenance recency from updated_at + recent commit_history.
// ---------------------------------------------------------------------------
function maintenance(app) {
  const updated = app.updated_at ? new Date(app.updated_at) : null;
  let status = "unknown";
  let daysSince = null;
  if (updated && !isNaN(updated)) {
    daysSince = Math.round((TODAY - updated) / 86400000);
    if (daysSince <= 180) status = "active";
    else if (daysSince <= 540) status = "aging";
    else status = "stale";
  }
  if (app.archived) status = "archived";
  // recent commit volume (last 6 buckets of commit_history)
  let recentCommits = 0;
  if (app.commit_history && typeof app.commit_history === "object") {
    const vals = Object.values(app.commit_history);
    recentCommits = vals.slice(-6).reduce((a, b) => a + (Number(b) || 0), 0);
  }
  return { status, daysSince, recentCommits };
}

// ---------------------------------------------------------------------------
// Docker-compose scaffold hints. We derive a plausible service block: a guessed
// image (from source repo owner/name or a known map), a default port from the
// category, and whether persistent volumes / a database are likely needed.
// Everything uncertain is clearly marked as a placeholder in the UI/output.
// ---------------------------------------------------------------------------
const KNOWN_IMAGES = {
  jellyfin: "jellyfin/jellyfin:latest",
  nextcloud: "nextcloud:latest",
  "nextcloud/server": "nextcloud:latest",
  gitea: "gitea/gitea:latest",
  forgejo: "codeberg.org/forgejo/forgejo:latest",
  vaultwarden: "vaultwarden/server:latest",
  bitwarden: "vaultwarden/server:latest",
  "home-assistant": "ghcr.io/home-assistant/home-assistant:stable",
  homeassistant: "ghcr.io/home-assistant/home-assistant:stable",
  immich: "ghcr.io/immich-app/immich-server:release",
  paperless: "ghcr.io/paperless-ngx/paperless-ngx:latest",
  "paperless-ngx": "ghcr.io/paperless-ngx/paperless-ngx:latest",
  grafana: "grafana/grafana:latest",
  prometheus: "prom/prometheus:latest",
  uptimekuma: "louislam/uptime-kuma:1",
  "uptime-kuma": "louislam/uptime-kuma:1",
  pihole: "pihole/pihole:latest",
  "pi-hole": "pihole/pihole:latest",
  adguardhome: "adguard/adguardhome:latest",
  navidrome: "deluan/navidrome:latest",
  syncthing: "syncthing/syncthing:latest",
  wireguard: "linuxserver/wireguard:latest",
  jellyseerr: "fallenbagel/jellyseerr:latest",
  freshrss: "freshrss/freshrss:latest",
  miniflux: "miniflux/miniflux:latest",
  linkding: "sissbruecker/linkding:latest",
  mealie: "ghcr.io/mealie-recipes/mealie:latest",
  bookstack: "lscr.io/linuxserver/bookstack:latest",
  wikijs: "ghcr.io/requarks/wiki:2",
  "wiki.js": "ghcr.io/requarks/wiki:2",
  n8n: "docker.n8n.io/n8nio/n8n:latest",
  "audiobookshelf": "ghcr.io/advplyr/audiobookshelf:latest",
  calibreweb: "lscr.io/linuxserver/calibre-web:latest",
  "calibre-web": "lscr.io/linuxserver/calibre-web:latest",
};

const CATEGORY_PORT = [
  ["media streaming", 8096],
  ["photo", 2283],
  ["dashboard", 3000],
  ["monitoring", 3000],
  ["analytics", 8000],
  ["wiki", 3000],
  ["git", 3000],
  ["password manager", 8080],
  ["bookmark", 9090],
  ["feed reader", 8080],
  ["rss", 8080],
  ["note", 8080],
  ["file", 8080],
  ["cloud storage", 8080],
  ["automation", 5678],
  ["home automation", 8123],
  ["dns", 53],
  ["proxy", 8080],
  ["recipe", 9000],
  ["blog", 2368],
  ["cms", 80],
];

function dockerScaffold(app) {
  const slug = app.id;
  let image = null;
  // try known map by slug or repo owner/name
  if (KNOWN_IMAGES[slug]) image = KNOWN_IMAGES[slug];
  if (!image && app.repo) {
    const key = app.repo.toLowerCase();
    if (KNOWN_IMAGES[key]) image = KNOWN_IMAGES[key];
  }
  let imageIsGuess = false;
  if (!image && app.repo) {
    // Guess a Docker Hub style image from owner/name; mark as placeholder.
    image = `${app.repo.toLowerCase()}:latest`;
    imageIsGuess = true;
  }
  if (!image) {
    image = `${slug}:latest`;
    imageIsGuess = true;
  }

  let port = null;
  const hay = (app.tags || []).join(" | ").toLowerCase();
  for (const [match, p] of CATEGORY_PORT) {
    if (hay.includes(match)) {
      port = p;
      break;
    }
  }

  // Apps that likely need a persistent data dir (almost all).
  const needsVolume = true;
  // Apps that likely need an external database.
  const dbHeavyTags = [
    "groupware", "e-commerce", "cms", "wiki", "analytics", "git",
    "document management", "communication",
  ];
  const needsDatabase = dbHeavyTags.some((t) => hay.includes(t));

  return { image, imageIsGuess, port, needsVolume, needsDatabase };
}

// ---------------------------------------------------------------------------
// Main: read every software/*.yml, transform, emit apps.json.
// ---------------------------------------------------------------------------
const softwareDir = path.join(SRC, "software");
const files = fs.readdirSync(softwareDir).filter((f) => f.endsWith(".yml"));

const apps = [];
const categorySet = new Set();
const platformSet = new Set();
const licenseSet = new Set();

for (const f of files) {
  let raw;
  try {
    raw = yaml.load(fs.readFileSync(path.join(softwareDir, f), "utf8"));
  } catch (e) {
    console.warn(`skip ${f}: ${e.message}`);
    continue;
  }
  if (!raw?.name) continue;

  const id = f.replace(/\.yml$/, "").toLowerCase();

  // derive repo owner/name from a github source_code_url
  let repo = null;
  if (raw.source_code_url) {
    const m = raw.source_code_url.match(
      /github\.com\/([^/]+\/[^/?#]+)/i
    );
    if (m) repo = m[1].replace(/\.git$/, "");
  }

  const tags = (raw.tags || []).filter(Boolean);
  const platforms = (raw.platforms || []).filter(Boolean);
  const lics = (raw.licenses || []).filter(Boolean);

  tags.forEach((t) => categorySet.add(t));
  platforms.forEach((p) => platformSet.add(p));
  lics.forEach((l) => licenseSet.add(l));

  const base = {
    id,
    name: raw.name,
    description: (raw.description || "").trim(),
    website: raw.website_url || null,
    source: raw.source_code_url || null,
    demo: raw.demo_url || null,
    repo,
    tags,
    platforms,
    licenses: lics,
    dependsThirdParty: raw.depends_3rdparty === true,
    docker: platforms.some((p) => p.toLowerCase() === "docker"),
    stars: typeof raw.stargazers_count === "number" ? raw.stargazers_count : null,
    updated_at: raw.updated_at || null,
    archived: raw.archived === true,
    release: raw.current_release?.tag || null,
    releaseDate: raw.current_release?.published_at || null,
    commit_history: raw.commit_history || null,
  };

  const m = maintenance(base);
  const res = estimateResources(base);
  const arch = archCompat(base);
  const dock = dockerScaffold(base);

  apps.push({
    id: base.id,
    name: base.name,
    description: base.description,
    website: base.website,
    source: base.source,
    demo: base.demo,
    repo: base.repo,
    tags: base.tags,
    platforms: base.platforms,
    licenses: base.licenses,
    licenseNames: base.licenses.map((l) => licenseName.get(l) || l),
    dependsThirdParty: base.dependsThirdParty,
    docker: base.docker,
    stars: base.stars,
    updatedAt: base.updated_at,
    archived: base.archived,
    release: base.release,
    releaseDate: base.releaseDate,
    maintenance: m,
    resources: res,
    arch,
    scaffold: dock,
  });
}

// Sort by stars desc (nulls last), then name.
apps.sort((a, b) => {
  const sa = a.stars ?? -1;
  const sb = b.stars ?? -1;
  if (sb !== sa) return sb - sa;
  return a.name.localeCompare(b.name);
});

const meta = {
  generatedAt: TODAY.toISOString().slice(0, 10),
  count: apps.length,
  categories: [...categorySet].sort(),
  platforms: [...platformSet].sort(),
  licenses: [...licenseSet]
    .map((id) => ({ id, name: licenseName.get(id) || id }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  withStars: apps.filter((a) => a.stars != null).length,
  active: apps.filter((a) => a.maintenance.status === "active").length,
};

fs.writeFileSync(OUT, JSON.stringify(apps));
fs.writeFileSync(META_OUT, JSON.stringify(meta, null, 2));

console.log(
  `Wrote ${apps.length} apps -> data/apps.json\n` +
    `  categories: ${meta.categories.length}\n` +
    `  platforms:  ${meta.platforms.length}\n` +
    `  licenses:   ${meta.licenses.length}\n` +
    `  with stars: ${meta.withStars}\n` +
    `  active:     ${meta.active}`
);
