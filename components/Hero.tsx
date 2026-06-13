"use client";

import { motion } from "framer-motion";
import type { Meta } from "@/lib/types";
import { ServerIcon, ChipIcon, CubeIcon, SearchIcon } from "@/components/icons";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero({ meta }: { meta: Meta }) {
  return (
    <section className="relative overflow-hidden border-b border-edge">
      <div className="blueprint-grid absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-bg" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div {...fade(0)} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-edge2 bg-card px-3 py-1 text-xs font-medium text-mute shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {meta.count.toLocaleString()} apps · {meta.active.toLocaleString()} actively maintained
          </span>
        </motion.div>

        <motion.h1
          {...fade(0.08)}
          className="mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl"
        >
          Find self-hosted apps.{" "}
          <span className="text-accent">Plan your homelab.</span>{" "}
          Ship the compose file.
        </motion.h1>

        <motion.p
          {...fade(0.16)}
          className="mt-4 max-w-2xl text-base leading-relaxed text-mute sm:text-lg"
        >
          A real, searchable frontend for the famous{" "}
          <span className="font-medium text-ink">awesome-selfhosted</span> list —
          plus two things the list can&apos;t do: a{" "}
          <span className="font-medium text-accent2">&ldquo;Can I run this?&rdquo;</span>{" "}
          resource calculator and an auto{" "}
          <span className="font-medium text-accent2">docker-compose generator</span>.
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-7 flex flex-wrap gap-3">
          <a
            href="#browse"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent2"
          >
            <SearchIcon className="h-4 w-4" /> Browse apps
          </a>
          <a
            href="#studio"
            className="inline-flex items-center gap-2 rounded-xl border border-edge2 bg-card px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-accent hover:text-accent2"
          >
            <ChipIcon className="h-4 w-4" /> Open the build studio
          </a>
        </motion.div>

        <motion.div
          {...fade(0.32)}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          <Feature
            icon={<SearchIcon className="h-5 w-5" />}
            title="Instant search & filters"
            body="Filter by category, language, license, Docker support, maintenance status, and third-party deps."
          />
          <Feature
            icon={<ChipIcon className="h-5 w-5" />}
            title="Can I run this?"
            body="Select apps, get an honest combined RAM/CPU estimate and an ARM vs x86 compatibility read."
          />
          <Feature
            icon={<CubeIcon className="h-5 w-5" />}
            title="Compose generator"
            body="Turn your selection into a starter docker-compose.yml — copy or download, ready to edit."
          />
        </motion.div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-edge bg-card/70 p-4 backdrop-blur-sm transition hover:border-edge2 hover:shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-lg border border-edge2 bg-bg2 text-accent">
        {icon}
      </div>
      <p className="mt-3 text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-mute">{body}</p>
    </div>
  );
}
