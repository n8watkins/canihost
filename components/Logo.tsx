"use client";

import { useState } from "react";

/** Derive a bare hostname from a URL, or null. */
function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * App logo with graceful degradation: tries icon.horse (scrapes the site's own
 * icon), falls back to Google's favicon service, then to a tinted monogram.
 * Never blocks render.
 */
export function Logo({
  website,
  source,
  name,
  size = 36,
}: {
  website?: string | null;
  source?: string | null;
  name: string;
  size?: number;
}) {
  const domain = domainOf(website) ?? domainOf(source);
  const [stage, setStage] = useState<0 | 1 | 2>(domain ? 0 : 2);

  const src =
    stage === 0
      ? `https://icon.horse/icon/${domain}`
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const monogram =
    name.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "?";

  if (stage === 2 || !domain) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-bg2 font-bold text-accent2 ring-1 ring-edge2"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden
      >
        {monogram}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
      className="shrink-0 rounded-lg bg-card object-contain ring-1 ring-edge2"
      style={{ width: size, height: size }}
    />
  );
}
