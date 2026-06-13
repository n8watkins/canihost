"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSelection } from "@/components/SelectionContext";
import { ChipIcon } from "@/components/icons";

export function FloatingBuildBar() {
  const { selected } = useSelection();
  const count = selected.size;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.a
          href="#studio"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-accent2/20 bg-ink px-5 py-3 text-sm font-semibold text-bg shadow-xl transition hover:opacity-90"
        >
          <ChipIcon className="h-4 w-4 text-accent" />
          <span>
            {count} app{count === 1 ? "" : "s"} in your build
          </span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">
            View →
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
