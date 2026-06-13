import { SITE } from "@/lib/site";
import { GitHubIcon, ServerIcon } from "@/components/icons";

export function Header({ stars }: { stars: number | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-edge2 bg-card text-accent shadow-sm">
              <ServerIcon className="h-5 w-5" />
            </span>
            <span className="text-base sm:text-lg">
              Can<span className="text-accent">I</span>Host
            </span>
          </a>
          <a
            href={SITE.n8builds}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-xs font-medium text-mute transition hover:text-ink sm:block"
          >
            by n8builds.dev
          </a>
        </div>

        <nav className="flex items-center gap-2">
          <a
            href="#calculator"
            className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-mute transition hover:text-ink sm:block sm:text-sm"
          >
            Calculator
          </a>
          <a
            href="#compose"
            className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-mute transition hover:text-ink sm:block sm:text-sm"
          >
            Compose
          </a>
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-edge2 bg-card px-2.5 py-1.5 text-xs font-semibold transition hover:border-mute hover:shadow-sm sm:text-sm"
            title="Star CanIHost on GitHub"
          >
            <GitHubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Star</span>
            {stars !== null && (
              <span className="rounded-full bg-bg2 px-1.5 py-0.5 text-[11px] tabular-nums text-mute">
                {stars.toLocaleString()}
              </span>
            )}
          </a>
          <a
            href={SITE.kofi}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-accent2 sm:text-sm"
          >
            <span aria-hidden>☕</span>
            <span className="hidden sm:inline">Ko-fi</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
