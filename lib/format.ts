import type { App } from "./types";

export function formatStars(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

export function formatRam(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return (Number.isInteger(gb) ? gb : gb.toFixed(1)) + " GB";
  }
  return mb + " MB";
}

export function relativeUpdated(daysSince: number | null): string {
  if (daysSince == null) return "unknown";
  if (daysSince < 1) return "today";
  if (daysSince < 30) return `${daysSince}d ago`;
  if (daysSince < 365) return `${Math.round(daysSince / 30)}mo ago`;
  const y = (daysSince / 365).toFixed(1);
  return `${y}y ago`;
}

export const MAINTENANCE_META: Record<
  App["maintenance"]["status"],
  { label: string; color: string; dot: string }
> = {
  active: { label: "Active", color: "text-good", dot: "bg-good" },
  aging: { label: "Aging", color: "text-warn", dot: "bg-warn" },
  stale: { label: "Stale", color: "text-bad", dot: "bg-bad" },
  archived: { label: "Archived", color: "text-bad", dot: "bg-bad" },
  unknown: { label: "Unknown", color: "text-mute", dot: "bg-mute" },
};

// Short, human category from the first tag (tags are "Cat - Sub" sometimes).
export function shortCategory(app: App): string {
  const t = app.tags[0] || "Uncategorized";
  return t.split(" - ")[0];
}

export function primaryLanguage(app: App): string | null {
  // Filter out packaging platforms to find the actual language/runtime.
  const skip = new Set(["docker", "deb", "nix", "ansible", "k8s", "helm"]);
  const lang = app.platforms.find((p) => !skip.has(p.toLowerCase()));
  return lang ?? app.platforms[0] ?? null;
}
