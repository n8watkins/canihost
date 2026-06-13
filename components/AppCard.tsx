"use client";

import type { App } from "@/lib/types";
import { shortCategory, primaryLanguage } from "@/lib/format";
import { useSelection } from "@/components/SelectionContext";
import { Logo } from "@/components/Logo";
import {
  MaintenanceBadge,
  StarsBadge,
  ArmBadge,
  RamBadge,
  ThirdPartyBadge,
} from "@/components/Badges";
import { CheckIcon, PlusIcon, ExternalIcon } from "@/components/icons";

export function AppCard({ app }: { app: App }) {
  const { has, toggle } = useSelection();
  const selected = has(app.id);
  const lang = primaryLanguage(app);

  return (
    <article
      className={`fade-up group relative flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 ease-out will-change-transform hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(43,42,38,0.28)] ${
        selected
          ? "border-accent ring-1 ring-accent/40"
          : "border-edge hover:border-accent/60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <Logo website={app.website} source={app.source} name={app.name} size={36} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold tracking-tight text-ink">
              {app.name}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-mute">
              {shortCategory(app)}
              {lang && <span className="text-edge2"> · </span>}
              {lang && <span className="normal-case text-blueprint">{lang}</span>}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggle(app.id)}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${app.name} from build` : `Add ${app.name} to build`}
          className={`shrink-0 grid h-7 w-7 place-items-center rounded-lg border text-xs font-semibold transition ${
            selected
              ? "border-accent bg-accent text-white"
              : "border-edge2 bg-bg2 text-mute hover:border-accent hover:text-accent"
          }`}
          title={selected ? "In your build" : "Add to build"}
        >
          {selected ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
        </button>
      </div>

      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-mute">
        {stripMarkdown(app.description)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <RamBadge app={app} />
        <ArmBadge app={app} />
        {app.docker && (
          <span className="inline-flex items-center gap-1 rounded border border-blueprint/30 bg-blueprint/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blueprint">
            Docker
          </span>
        )}
        {app.dependsThirdParty && <ThirdPartyBadge />}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <div className="flex items-center gap-2.5">
          <MaintenanceBadge app={app} />
          <StarsBadge stars={app.stars} />
        </div>
        <div className="flex items-center gap-2 text-mute opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          {app.website && (
            <a
              href={app.website}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-accent2"
              title="Website"
              aria-label={`${app.name} website`}
            >
              <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// The upstream descriptions contain markdown links like [text](url). Strip to
// readable text for the card body.
function stripMarkdown(s: string): string {
  return s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}
