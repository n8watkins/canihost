"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { App, Meta } from "@/lib/types";
import { useSelection } from "@/components/SelectionContext";
import { Calculator } from "@/components/Calculator";
import { ComposeGenerator } from "@/components/ComposeGenerator";
import { ChipIcon, CubeIcon, CloseIcon } from "@/components/icons";

type Tab = "calculator" | "compose";

export function BuildStudio({ apps }: { apps: App[] }) {
  const { selected, remove, clear } = useSelection();
  const [tab, setTab] = useState<Tab>("calculator");

  const byId = useMemo(() => {
    const m = new Map<string, App>();
    for (const a of apps) m.set(a.id, a);
    return m;
  }, [apps]);

  const chosen = useMemo(
    () => [...selected].map((id) => byId.get(id)).filter(Boolean) as App[],
    [selected, byId]
  );

  return (
    <section
      id="studio"
      className="mx-auto mt-6 max-w-6xl scroll-mt-24 px-4 sm:px-6"
    >
      <div className="overflow-hidden rounded-2xl border border-edge2 bg-card shadow-sm">
        {/* Header / tabs */}
        <div className="flex flex-col gap-3 border-b border-edge bg-bg2/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">Your build</h2>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-accent2">
              {chosen.length} app{chosen.length === 1 ? "" : "s"}
            </span>
            {chosen.length > 0 && (
              <button
                onClick={clear}
                className="text-xs font-medium text-mute underline-offset-2 transition hover:text-bad hover:underline"
              >
                clear all
              </button>
            )}
          </div>

          <div
            id="calculator"
            className="flex gap-1 rounded-lg border border-edge2 bg-bg p-1"
            role="tablist"
          >
            <TabButton
              active={tab === "calculator"}
              onClick={() => setTab("calculator")}
              icon={<ChipIcon className="h-4 w-4" />}
            >
              Can I run this?
            </TabButton>
            <TabButton
              active={tab === "compose"}
              onClick={() => setTab("compose")}
              icon={<CubeIcon className="h-4 w-4" />}
            >
              docker-compose
            </TabButton>
          </div>
        </div>

        {/* Selected chips */}
        <div id="compose" className="scroll-mt-24 border-b border-edge px-4 py-3">
          {chosen.length === 0 ? (
            <p className="py-1 text-xs text-mute">
              Click <span className="font-semibold text-ink">+</span> on any app
              below to add it to your build.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {chosen.map((a) => (
                  <motion.span
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="inline-flex items-center gap-1 rounded-full border border-edge2 bg-bg2 py-1 pl-2.5 pr-1 text-xs font-medium text-ink"
                  >
                    {a.name}
                    <button
                      onClick={() => remove(a.id)}
                      aria-label={`Remove ${a.name}`}
                      className="grid h-4 w-4 place-items-center rounded-full text-mute transition hover:bg-bad/10 hover:text-bad"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Panel */}
        <div className="p-4 sm:p-5">
          {tab === "calculator" ? (
            <Calculator apps={chosen} />
          ) : (
            <ComposeGenerator apps={chosen} />
          )}
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
        active
          ? "bg-card text-ink shadow-sm"
          : "text-mute hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
