import type { App } from "@/lib/types";
import { MAINTENANCE_META, formatStars, relativeUpdated, formatRam } from "@/lib/format";
import { StarIcon } from "@/components/icons";

export function MaintenanceBadge({ app }: { app: App }) {
  const meta = MAINTENANCE_META[app.maintenance.status];
  const rel = relativeUpdated(app.maintenance.daysSince);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-bg2/60 px-2 py-0.5 text-[11px] font-medium"
      title={`Last commit ${rel}${app.archived ? " · archived" : ""}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <span className={meta.color}>{meta.label}</span>
      {app.maintenance.daysSince != null && (
        <span className="text-mute">· {rel}</span>
      )}
    </span>
  );
}

export function StarsBadge({ stars }: { stars: number | null }) {
  if (stars == null) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-mute" title={`${stars.toLocaleString()} GitHub stars`}>
      <StarIcon className="h-3.5 w-3.5 text-accent" />
      <span className="tabular-nums">{formatStars(stars)}</span>
    </span>
  );
}

export function ArmBadge({ app }: { app: App }) {
  const ok = app.arch.arm === "likely";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        ok
          ? "border-blueprint/30 bg-blueprint/5 text-blueprint"
          : "border-edge2 bg-bg2 text-mute"
      }`}
      title={ok ? "Likely runs on ARM (Pi, Apple Silicon)" : "ARM support unknown — verify"}
    >
      ARM {ok ? "✓" : "?"}
    </span>
  );
}

export function RamBadge({ app }: { app: App }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-edge2 bg-bg2 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-mute"
      title={`Estimated RAM: ${app.resources.note}`}
    >
      ~{formatRam(app.resources.ramMB)}
    </span>
  );
}

export function ThirdPartyBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-warn/30 bg-warn/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warn"
      title="Depends on a third-party service or account to function"
    >
      3rd-party
    </span>
  );
}
