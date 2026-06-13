"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { App, Meta } from "@/lib/types";
import { AppCard } from "@/components/AppCard";
import { FilterBar, EMPTY_FILTERS, type Filters } from "@/components/FilterBar";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { USE_CASE_BY_ID, matchUseCase } from "@/lib/usecases";
import { SearchIcon, CloseIcon } from "@/components/icons";

const PAGE = 60;

export function Directory({ apps, meta }: { apps: App[]; meta: Meta }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [visible, setVisible] = useState(PAGE);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Goal narrows the universe first (curated picks ordered first), then the
  // tech filters + search refine within it.
  const base = useMemo(() => {
    if (!filters.goal) return apps;
    const uc = USE_CASE_BY_ID[filters.goal];
    return uc ? matchUseCase(apps, uc) : apps;
  }, [apps, filters.goal]);

  const activeUseCase = filters.goal ? USE_CASE_BY_ID[filters.goal] : null;

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    return base.filter((a) => {
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
  }, [base, filters]);

  const shown = filtered.slice(0, visible);

  const selectGoal = (id: string) => {
    setFilters((f) => ({ ...EMPTY_FILTERS, goal: f.goal === id ? "" : id }));
    setVisible(PAGE);
    // Let the new goal apply, then bring results into view.
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <section id="browse" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <UseCaseGrid apps={apps} current={filters.goal} onSelect={selectGoal} />

      <div ref={resultsRef} className="mt-12 scroll-mt-20">
        {activeUseCase && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-accent/40 bg-accent/[0.06] px-4 py-3"
          >
            <span className="text-lg" aria-hidden>
              {activeUseCase.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">
                {activeUseCase.label}
              </p>
              <p className="text-xs text-mute">
                Replaces {activeUseCase.replaces.join(" · ")}
              </p>
            </div>
            <button
              onClick={() => selectGoal(activeUseCase.id)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-edge2 bg-card px-3 py-1.5 text-xs font-semibold text-mute shadow-sm transition hover:border-accent hover:text-accent2"
            >
              <CloseIcon className="h-3.5 w-3.5" /> Clear goal
            </button>
          </motion.div>
        )}

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
      </div>
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
