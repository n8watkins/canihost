"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            What do you want to{" "}
            <span className="text-accent">self-host</span>?
          </h2>
          <p className="mt-1.5 text-sm text-mute">
            Pick a goal — not a tech category. We&apos;ll show the apps that
            replace the service you&apos;re paying for.
          </p>
        </div>
        {current && (
          <button
            onClick={() => onSelect(current)}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-edge2 bg-card px-3 py-1.5 text-xs font-semibold text-mute shadow-sm transition hover:border-accent hover:text-accent2 sm:inline-flex"
          >
            <CloseIcon className="h-3.5 w-3.5" /> Clear goal
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {USE_CASES.map((uc, i) => {
          const active = current === uc.id;
          return (
            <motion.button
              key={uc.id}
              type="button"
              onClick={() => onSelect(uc.id)}
              aria-pressed={active}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.3) }}
              whileHover={{ y: -3 }}
              className={`group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border p-3.5 text-left shadow-sm transition-colors ${
                active
                  ? "border-accent bg-accent/[0.06] ring-1 ring-accent"
                  : "border-edge bg-card hover:border-accent2/50"
              }`}
            >
              <span
                className="pointer-events-none absolute -right-3 -top-3 text-4xl opacity-10 transition group-hover:opacity-20"
                aria-hidden
              >
                {uc.icon}
              </span>
              <span className="text-xl" aria-hidden>
                {uc.icon}
              </span>
              <span className="text-sm font-bold leading-tight text-ink">
                {uc.label}
              </span>
              <span className="line-clamp-1 text-[11px] leading-tight text-mute">
                Replaces {uc.replaces.join(" · ")}
              </span>
              <span
                className={`mt-1 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  active
                    ? "bg-accent/15 text-accent2"
                    : "bg-bg2 text-mute group-hover:text-ink"
                }`}
              >
                {counts[uc.id]} apps
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
