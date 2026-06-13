"use client";

import { useMemo, useState } from "react";
import type { App } from "@/lib/types";
import { generateCompose } from "@/lib/compose";
import { CopyIcon, DownloadIcon, CheckIcon, CubeIcon } from "@/components/icons";

export function ComposeGenerator({ apps }: { apps: App[] }) {
  const [copied, setCopied] = useState(false);
  const [autoPorts, setAutoPorts] = useState(true);

  const yaml = useMemo(
    () => generateCompose(apps, { autoIncrementPorts: autoPorts }),
    [apps, autoPorts]
  );

  const guessCount = apps.filter((a) => a.scaffold.imageIsGuess).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const download = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (apps.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-edge2 bg-bg2/40 p-10 text-center">
        <CubeIcon className="h-8 w-8 text-edge2" />
        <p className="mt-3 text-sm font-medium text-ink">
          Add apps to generate a docker-compose.yml
        </p>
        <p className="mt-1 max-w-sm text-xs text-mute">
          We&apos;ll scaffold a service block for each — image, ports, volumes,
          and env placeholders you can edit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-bg transition hover:opacity-85"
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={download}
          className="inline-flex items-center gap-1.5 rounded-lg border border-edge2 bg-card px-3.5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-accent hover:text-accent2"
        >
          <DownloadIcon className="h-4 w-4" />
          Download
        </button>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-mute">
          <input
            type="checkbox"
            checked={autoPorts}
            onChange={(e) => setAutoPorts(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-accent)]"
          />
          Auto-resolve port conflicts
        </label>
      </div>

      {guessCount > 0 && (
        <p className="rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-[11px] leading-relaxed text-warn">
          <span className="font-semibold">{guessCount}</span> image
          {guessCount > 1 ? "s are" : " is"} a best-guess (no confirmed Docker
          image in the dataset) — marked with{" "}
          <code className="rounded bg-warn/10 px-1">TODO</code> in the file. Verify
          against each project&apos;s official compose example before running.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-edge2 bg-[#1c1b18] shadow-inner">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-white/50">
              docker-compose.yml
            </span>
          </div>
          <span className="font-mono text-[11px] text-white/40">
            {apps.length} service{apps.length > 1 ? "s" : ""}
          </span>
        </div>
        <pre
          className="scroll-thin max-h-[460px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#e8e6df]"
          style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
        >
          <code>{yaml}</code>
        </pre>
      </div>
    </div>
  );
}
