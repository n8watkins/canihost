"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { App, Meta } from "@/lib/types";
import { AppCard } from "@/components/AppCard";
import { FilterBar, EMPTY_FILTERS, type Filters } from "@/components/FilterBar";
import { SearchIcon } from "@/components/icons";

const PAGE = 60;

export function Directory({ apps, meta }: { apps: App[]; meta: Meta }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    return apps.filter((a) => {
      if (filters.category && !a.tags.includes(filters.category)) return false;
      if (filters.platform && !a.platforms.includes(filters.platform)) return false;
      if (filters.license && !a.licenses.includes(filters.license)) return false;
      if (filters.dockerOnly && !a.docker) return false;
      if (filters.hideThirdParty && a.dependsThirdParty) return false;
      if (filters.activeOnly && a.maintenance.status !== "active") return false;
      if (terms.length) {
        const hay = (
          a.name +
          " " +
          a.description +
          " " +
          a.tags.join(" ") +
          " " +
          a.platforms.join(" ")
        ).toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [apps, filters]);

  // reset paging when filters change
  const shown = filtered.slice(0, visible);

  return (
    <section id="browse" className="mx-auto max-w-6xl px-4 sm:px-6">
      <FilterBar
        filters={filters}
        setFilters={(f) => {
          setFilters(f);
          setVisible(PAGE);
        }}
        categories={meta.categories}
        platforms={meta.platforms}
        licenses={meta.licenses}
        resultCount={filtered.length}
        total={meta.count}
      />

      {filtered.length === 0 ? (
        <EmptyState onReset={() => setFilters(EMPTY_FILTERS)} />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {shown.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </AnimatePresence>
          </div>

          {visible < filtered.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + PAGE)}
                className="rounded-lg border border-edge2 bg-card px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-accent hover:text-accent2"
              >
                Show more ({(filtered.length - visible).toLocaleString()} left)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-4 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-edge2 bg-card text-mute shadow-sm">
        <SearchIcon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-base font-semibold text-ink">No apps match those filters</p>
        <p className="mt-1 text-sm text-mute">Try a broader search or clear a filter.</p>
      </div>
      <button
        onClick={onReset}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent2"
      >
        Reset filters
      </button>
    </div>
  );
}
