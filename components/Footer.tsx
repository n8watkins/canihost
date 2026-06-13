import { SITE } from "@/lib/site";
import { GitHubIcon } from "@/components/icons";

const link =
  "underline decoration-edge2 underline-offset-4 transition hover:text-accent2 hover:decoration-accent";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-edge bg-bg2">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Appturnity CTA */}
        <div className="mb-10 flex flex-col items-center gap-3 rounded-2xl border border-edge2 bg-card p-6 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-base font-semibold text-ink">
              Need something like this built?
            </p>
            <p className="mt-1 text-sm text-mute">
              Appturnity ships polished web apps, tools, and internal software.
            </p>
          </div>
          <a
            href={SITE.appturnity}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition hover:opacity-85"
          >
            Let&apos;s talk →
          </a>
        </div>

        <div className="grid gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-ink">CanIHost</p>
            <p className="mt-2 max-w-xs text-mute">
              A real, searchable frontend for the awesome-selfhosted list — with
              a resource calculator and docker-compose generator.
            </p>
          </div>
          <div>
            <p className="font-semibold text-ink">Open source</p>
            <ul className="mt-2 space-y-1.5 text-mute">
              <li>
                <a href={SITE.github} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 ${link}`}>
                  <GitHubIcon className="h-3.5 w-3.5" /> Star on GitHub
                </a>
              </li>
              <li>
                <a href={SITE.kofi} target="_blank" rel="noopener noreferrer" className={link}>
                  ☕ Support on Ko-fi
                </a>
              </li>
              <li>
                <a href={SITE.appturnity} target="_blank" rel="noopener noreferrer" className={link}>
                  Appturnity
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Data &amp; credit</p>
            <p className="mt-2 text-mute">
              App data from{" "}
              <a href={SITE.awesome} target="_blank" rel="noopener noreferrer" className={link}>
                awesome-selfhosted
              </a>{" "}
              — an incredible community list. Go star it. Maintenance signals
              come from the{" "}
              <a href={SITE.awesomeData} target="_blank" rel="noopener noreferrer" className={link}>
                structured dataset
              </a>
              .
            </p>
          </div>
        </div>

        <div className="tech-rule mt-10 pt-6 text-center text-xs text-mute">
          <p>
            Resource numbers and ARM compatibility are{" "}
            <span className="font-medium text-ink">honest estimates</span>, not
            vendor specs. Always verify against each project&apos;s own docs.
          </p>
          <p className="mt-3">
            Built by{" "}
            <a href={SITE.n8builds} target="_blank" rel="noopener noreferrer" className={`font-medium ${link}`}>
              Nate · n8builds.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
