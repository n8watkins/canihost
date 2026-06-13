"use client";

import { motion } from "framer-motion";
import type { Meta } from "@/lib/types";
import { USE_CASES } from "@/lib/usecases";
import { ChipIcon, CubeIcon } from "@/components/icons";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// A few marquee goals previewed in the hero; clicking jumps to the goal grid.
const PREVIEW = ["photos", "movies", "passwords", "adblock", "git", "automation"];

export function Hero({ meta }: { meta: Meta }) {
  const preview = PREVIEW.map((id) => USE_CASES.find((u) => u.id === id)!);

  return (
    <section className="relative overflow-hidden border-b border-edge">
      <div className="blueprint-grid absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-bg" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div {...fade(0)} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-edge2 bg-card px-3 py-1 text-xs font-medium text-mute shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {meta.count.toLocaleString()} apps · {meta.active.toLocaleString()} actively maintained · {meta.categories.length} categories
          </span>
        </motion.div>

        <motion.h1
          {...fade(0.08)}
          className="mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.04] tracking-tight text-ink sm:text-6xl"
        >
          Stop paying for it.{" "}
          <span className="text-accent">Self-host it.</span>
        </motion.h1>

        <motion.p
          {...fade(0.16)}
          className="mt-4 max-w-2xl text-base leading-relaxed text-mute sm:text-lg"
        >
          Other directories make you browse by tech category. CanIHost lets you
          start with <span className="font-medium text-ink">what you want to do</span> —
          &ldquo;replace Google Photos&rdquo;, &ldquo;run my own Netflix&rdquo; — then
          tells you{" "}
          <span className="font-medium text-accent2">if your box can run it</span> and{" "}
          <span className="font-medium text-accent2">ships the docker-compose</span>.
        </motion.p>

        {/* Differentiator pills */}
        <motion.div {...fade(0.22)} className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-edge2 bg-card px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
            <ChipIcon className="h-3.5 w-3.5 text-accent" /> &ldquo;Can I run this?&rdquo; calculator
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-edge2 bg-card px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
            <CubeIcon className="h-3.5 w-3.5 text-accent" /> docker-compose generator
          </span>
        </motion.div>

        {/* Goal preview chips → scroll to the goal grid */}
        <motion.div {...fade(0.3)} className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-mute">
            Popular goals
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {preview.map((uc) => (
              <a
                key={uc.id}
                href="#browse"
                className="group inline-flex items-center gap-1.5 rounded-full border border-edge2 bg-card px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent2"
              >
                <span aria-hidden>{uc.icon}</span>
                {uc.label}
              </a>
            ))}
            <a
              href="#browse"
              className="inline-flex items-center rounded-full border border-dashed border-edge2 px-3.5 py-2 text-sm font-medium text-mute transition hover:border-accent hover:text-accent2"
            >
              + {USE_CASES.length - preview.length} more →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
