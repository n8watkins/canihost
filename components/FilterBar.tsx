"use client";

import { SearchIcon, CloseIcon } from "@/components/icons";

export type Filters = {
  query: string;
  category: string;
  platform: string;
  license: string;
  dockerOnly: boolean;
  hideThirdParty: boolean;
  activeOnly: boolean;
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  category: "",
  platform: "",
  license: "",
  dockerOnly: false,
  hideThirdParty: false,
  activeOnly: false,
};

const selectCls =
  "h-9 rounded-lg border border-edge2 bg-card px-2.5 text-sm text-ink shadow-sm transition hover:border-mute focus:border-accent focus:outline-none";

export function FilterBar({
  filters,
  setFilters,
  categories,
  platforms,
  licenses,
  resultCount,
  total,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  categories: string[];
  platforms: string[];
  licenses: { id: string; name: string }[];
  resultCount: number;
  total: number;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters({ ...filters, [k]: v });

  const anyActive =
    filters.query ||
    filters.category ||
    filters.platform ||
    filters.license ||
    filters.dockerOnly ||
    filters.hideThirdParty ||
    filters.activeOnly;

  return (
    <div className="sticky top-[57px] z-20 -mx-4 border-b border-edge bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search 1,300+ self-hosted apps — name, description, or category…"
            aria-label="Search self-hosted apps"
            className="h-11 w-full rounded-xl border border-edge2 bg-card pl-10 pr-4 text-sm shadow-sm transition placeholder:text-mute/70 hover:border-mute focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.category}
            onChange={(e) => set("category", e.target.value)}
            aria-label="Filter by category"
            className={selectCls}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filters.platform}
            onChange={(e) => set("platform", e.target.value)}
            aria-label="Filter by language or platform"
            className={selectCls}
          >
            <option value="">All languages</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={filters.license}
            onChange={(e) => set("license", e.target.value)}
            aria-label="Filter by license"
            className={selectCls}
          >
            <option value="">All licenses</option>
            {licenses.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id}
              </option>
            ))}
          </select>

          <Toggle
            label="Docker"
            active={filters.dockerOnly}
            onClick={() => set("dockerOnly", !filters.dockerOnly)}
            title="Only apps with a Docker platform"
          />
          <Toggle
            label="Active only"
            active={filters.activeOnly}
            onClick={() => set("activeOnly", !filters.activeOnly)}
            title="Only apps with a commit in the last ~6 months"
          />
          <Toggle
            label="No 3rd-party"
            active={filters.hideThirdParty}
            onClick={() => set("hideThirdParty", !filters.hideThirdParty)}
            title="Hide apps that depend on an external service"
          />

          {anyActive && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-mute transition hover:text-bad"
            >
              <CloseIcon className="h-3.5 w-3.5" /> Clear
            </button>
          )}

          <span className="ml-auto text-xs tabular-nums text-mute">
            <span className="font-semibold text-ink">{resultCount.toLocaleString()}</span>{" "}
            / {total.toLocaleString()} apps
          </span>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  active,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`h-9 rounded-lg border px-3 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent/10 text-accent2"
          : "border-edge2 bg-card text-mute hover:border-mute hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
