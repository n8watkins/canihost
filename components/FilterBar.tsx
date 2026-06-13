"use client";

import { useState } from "react";
import { SearchIcon, CloseIcon, ChipIcon } from "@/components/icons";

export type SortKey = "stars" | "updated" | "ram" | "name";

export type Filters = {
  query: string;
  goal: string;
  sort: SortKey;
  // Basics (always visible)
  activeOnly: boolean;
  dockerOnly: boolean;
  armOnly: boolean;
  // Advanced (collapsed)
  category: string;
  platform: string;
  license: string;
  hideThirdParty: boolean;
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  goal: "",
  sort: "stars",
  activeOnly: false,
  dockerOnly: false,
  armOnly: false,
  category: "",
  platform: "",
  license: "",
  hideThirdParty: false,
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "stars", label: "★ Most stars" },
  { value: "updated", label: "↻ Recently updated" },
  { value: "ram", label: "↓ Lightest (RAM)" },
  { value: "name", label: "A–Z" },
];

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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters({ ...filters, [k]: v });

  const advancedActive =
    filters.category || filters.platform || filters.license || filters.hideThirdParty;

  const anyActive =
    filters.query ||
    filters.goal ||
    filters.activeOnly ||
    filters.dockerOnly ||
    filters.armOnly ||
    advancedActive;

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

        {/* Basics: sort + the signals people actually rank on */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value as SortKey)}
              aria-label="Sort apps"
              className={selectCls}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <span className="mx-0.5 hidden h-5 w-px bg-edge2 sm:block" />

          <Toggle
            label="Active only"
            active={filters.activeOnly}
            onClick={() => set("activeOnly", !filters.activeOnly)}
            title="Only apps with a commit in roughly the last 6 months"
          />
          <Toggle
            label="Docker"
            active={filters.dockerOnly}
            onClick={() => set("dockerOnly", !filters.dockerOnly)}
            title="Only apps that ship a Docker image"
          />
          <Toggle
            label="ARM-friendly"
            active={filters.armOnly}
            onClick={() => set("armOnly", !filters.armOnly)}
            title="Likely to run on a Raspberry Pi / Apple Silicon"
          />

          <button
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className={`ml-auto inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition ${
              showAdvanced || advancedActive
                ? "border-accent bg-accent/10 text-accent2"
                : "border-edge2 bg-card text-mute hover:border-mute hover:text-ink"
            }`}
          >
            <ChipIcon className="h-3.5 w-3.5" />
            Advanced
            {advancedActive ? (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">
                !
              </span>
            ) : null}
          </button>
        </div>

        {/* Advanced (category / language / license) — collapsed by default */}
        <div
          className={`${showAdvanced ? "flex" : "hidden"} flex-wrap items-center gap-2`}
        >
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
            label="No 3rd-party"
            active={filters.hideThirdParty}
            onClick={() => set("hideThirdParty", !filters.hideThirdParty)}
            title="Hide apps that depend on an external service"
          />
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2">
          {anyActive && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-mute transition hover:text-bad"
            >
              <CloseIcon className="h-3.5 w-3.5" /> Clear all
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
