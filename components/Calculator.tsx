"use client";

import { motion } from "framer-motion";
import type { App } from "@/lib/types";
import { computeFootprint, hardwareHint } from "@/lib/calculator";
import { formatRam } from "@/lib/format";
import { ChipIcon } from "@/components/icons";

export function Calculator({ apps }: { apps: App[] }) {
  const fp = computeFootprint(apps);

  if (apps.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-edge2 bg-bg2/40 p-10 text-center">
        <ChipIcon className="h-8 w-8 text-edge2" />
        <p className="mt-3 text-sm font-medium text-ink">
          Add apps to estimate your homelab footprint
        </p>
        <p className="mt-1 max-w-sm text-xs text-mute">
          Pick apps from the directory and we&apos;ll estimate combined RAM, CPU,
          and ARM compatibility.
        </p>
      </div>
    );
  }

  const armLabel = {
    all: { text: "Runs on ARM", sub: "All selected apps likely have ARM images (Pi, Apple Silicon).", color: "text-good" },
    most: { text: "Mostly ARM-ready", sub: `${fp.armUnknownCount} app(s) have unverified ARM support.`, color: "text-good" },
    some: { text: "Partial ARM support", sub: `${fp.armUnknownCount} app(s) may be x86-only — verify before buying a Pi.`, color: "text-warn" },
    none: { text: "x86 recommended", sub: "ARM support is unverified for these — check first.", color: "text-bad" },
  }[fp.armCompatible];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Estimated RAM"
          value={formatRam(fp.totalRamMB)}
          sub={`${formatRam(fp.appsRamMB)} apps + ${formatRam(fp.hostOverheadMB)} host`}
        />
        <Stat
          label="Recommended RAM"
          value={formatRam(fp.recommendedRamMB)}
          sub="includes ~30% headroom"
          accent
        />
        <Stat
          label="CPU"
          value={`~${fp.recommendedCpuCores} core${fp.recommendedCpuCores > 1 ? "s" : ""}`}
          sub={`load weight ${fp.cpuLoad}`}
        />
      </div>

      {/* RAM bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-mute">
          <span>Memory breakdown</span>
          <span className="tabular-nums">{formatRam(fp.totalRamMB)} total</span>
        </div>
        <div className="flex h-7 w-full overflow-hidden rounded-lg border border-edge bg-bg2">
          <Segment
            width={(fp.hostOverheadMB / fp.totalRamMB) * 100}
            className="bg-blueprint/70"
            label="host"
          />
          {apps.map((a, i) => (
            <Segment
              key={a.id}
              width={(a.resources.ramMB / fp.totalRamMB) * 100}
              className={i % 2 === 0 ? "bg-accent/80" : "bg-accent/60"}
              label={a.name}
              tip={`${a.name}: ~${formatRam(a.resources.ramMB)}`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-mute">
            Architecture
          </p>
          <p className={`mt-1 text-sm font-bold ${armLabel.color}`}>{armLabel.text}</p>
          <p className="mt-1 text-xs text-mute">{armLabel.sub}</p>
        </div>
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-mute">
            Hardware suggestion
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {hardwareHint(fp.recommendedRamMB)}
          </p>
          <p className="mt-1 text-xs text-mute">Based on the recommended RAM tier.</p>
        </div>
      </div>

      <p className="rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-[11px] leading-relaxed text-warn">
        <span className="font-semibold">Estimates only.</span> Numbers are derived
        from each app&apos;s category and runtime, not vendor specs. Real usage
        depends on your data volume, users, and config. Treat this as a planning
        ballpark.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${
        accent ? "border-accent/40 bg-accent/5" : "border-edge bg-card"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-mute">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ? "text-accent2" : "text-ink"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-mute">{sub}</p>
    </motion.div>
  );
}

function Segment({
  width,
  className,
  label,
  tip,
}: {
  width: number;
  className: string;
  label: string;
  tip?: string;
}) {
  return (
    <div
      className={`h-full min-w-[2px] border-r border-card/50 transition-all ${className}`}
      style={{ width: `${Math.max(width, 0.5)}%` }}
      title={tip ?? label}
    />
  );
}
