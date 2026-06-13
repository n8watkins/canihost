"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { App } from "@/lib/types";
import { useSelection } from "@/components/SelectionContext";
import { computeFootprint } from "@/lib/calculator";
import { ChipIcon, CloseIcon } from "@/components/icons";

const gb = (mb: number) => (mb / 1024).toFixed(mb < 10 * 1024 ? 1 : 0);

export function FloatingBuildBar({ apps }: { apps: App[] }) {
  const { selected, clear } = useSelection();
  const count = selected.size;
  const chosen = apps.filter((a) => selected.has(a.id));
  const fp = computeFootprint(chosen);

  const arm =
    fp.armCompatible === "all"
      ? "ARM ✓"
      : fp.armCompatible === "none"
        ? "x86 only"
        : "ARM partial";

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-accent2/20 bg-ink/95 px-3 py-2 text-bg shadow-2xl backdrop-blur sm:gap-4 sm:px-4 sm:py-2.5"
        >
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <ChipIcon className="h-4 w-4 text-accent" />
            {count}
            <span className="hidden font-medium text-bg/70 sm:inline">
              app{count === 1 ? "" : "s"}
            </span>
          </div>

          <span className="h-6 w-px bg-bg/20" />

          {/* Live footprint — recalculates on every add/remove */}
          <div className="flex items-center gap-3 text-xs tabular-nums sm:gap-4">
            <Stat value={`~${gb(fp.recommendedRamMB)} GB`} label="RAM" accent />
            <Stat value={`~${fp.recommendedCpuCores}`} label="cores" />
            <span className="hidden rounded-md bg-bg/10 px-1.5 py-0.5 font-semibold text-bg/80 sm:inline">
              {arm}
            </span>
          </div>

          <a
            href="#studio"
            className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white transition hover:bg-accent2"
          >
            Build studio →
          </a>
          <button
            onClick={clear}
            aria-label="Clear build"
            title="Clear build"
            className="-mr-1 shrink-0 rounded-full p-1 text-bg/50 transition hover:bg-bg/10 hover:text-bg"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-1">
      <span className={`font-bold ${accent ? "text-accent" : "text-bg"}`}>
        {value}
      </span>
      <span className="text-[11px] text-bg/60">{label}</span>
    </span>
  );
}
