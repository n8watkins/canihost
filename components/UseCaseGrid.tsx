"use client";

import { useMemo } from "react";
import type { App } from "@/lib/types";
import { USE_CASES, useCaseCounts } from "@/lib/usecases";
import { CloseIcon } from "@/components/icons";

export function UseCaseGrid({
  apps,
  current,
  onSelect,
}: {
  apps: App[];
  current: string;
  onSelect: (id: string) => void;
}) {
  const counts = useMemo(() => useCaseCounts(apps), [apps]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
            What do you want to <span className="text-accent">self-host</span>?
          </h2>
          <p className="mt-0.5 text-xs text-mute sm:text-sm">
            Pick a goal — not a tech category. We&apos;ll show the apps that
            replace what you&apos;re paying for.
          </p>
        </div>
        {current && (
          <button
            onClick={() => onSelect(current)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-edge2 bg-card px-3 py-1.5 text-xs font-semibold text-mute shadow-sm transition hover:border-accent hover:text-accent2"
          >
            <CloseIcon className="h-3.5 w-3.5" /> Clear goal
          </button>
        )}
      </div>

      {/* Compact goal pills — these are filter options, not result cards */}
      <div className="mt-3.5 flex flex-wrap gap-2">
        {USE_CASES.map((uc) => {
          const active = current === uc.id;
          return (
            <button
              key={uc.id}
              type="button"
              onClick={() => onSelect(uc.id)}
              aria-pressed={active}
              title={`Replaces ${uc.replaces.join(", ")}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-edge2 bg-card text-ink hover:-translate-y-px hover:border-accent hover:text-accent2"
              }`}
            >
              <span aria-hidden>{uc.icon}</span>
              {uc.label}
              <span
                className={`tabular-nums text-[11px] ${active ? "text-white/70" : "text-mute"}`}
              >
                {counts[uc.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
