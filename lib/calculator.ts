import type { App } from "./types";

// "Can I run this?" footprint estimator. All numbers are HONEST category-based
// estimates (see scripts/build-data.mjs), never vendor specs. We add a system
// overhead baseline (host OS + Docker engine) and a small de-duplication: a
// shared database service is counted once, not per app.

const HOST_OVERHEAD_MB = 512; // Linux + Docker engine baseline

export type Footprint = {
  totalRamMB: number;
  hostOverheadMB: number;
  appsRamMB: number;
  cpuLoad: number; // sum of cpu weights
  recommendedRamMB: number; // with 30% headroom
  recommendedCpuCores: number;
  armCompatible: "all" | "most" | "some" | "none";
  armUnknownCount: number;
  count: number;
};

export function computeFootprint(apps: App[]): Footprint {
  if (apps.length === 0) {
    return {
      totalRamMB: 0,
      hostOverheadMB: 0,
      appsRamMB: 0,
      cpuLoad: 0,
      recommendedRamMB: 0,
      recommendedCpuCores: 0,
      armCompatible: "all",
      armUnknownCount: 0,
      count: 0,
    };
  }

  const appsRamMB = apps.reduce((sum, a) => sum + a.resources.ramMB, 0);
  const cpuLoad = apps.reduce((sum, a) => sum + a.resources.cpuWeight, 0);
  const totalRamMB = appsRamMB + HOST_OVERHEAD_MB;

  // Recommend ~30% headroom and round up to a sensible RAM tier.
  const withHeadroom = Math.ceil((totalRamMB * 1.3) / 512) * 512;

  // CPU: assume each "weight" unit ~ 0.5 core under light/idle homelab use.
  const recommendedCpuCores = Math.max(1, Math.ceil((cpuLoad * 0.5) / 1));

  const armUnknownCount = apps.filter((a) => a.arch.arm !== "likely").length;
  let armCompatible: Footprint["armCompatible"] = "all";
  if (armUnknownCount === 0) armCompatible = "all";
  else if (armUnknownCount === apps.length) armCompatible = "none";
  else if (armUnknownCount <= apps.length / 2) armCompatible = "most";
  else armCompatible = "some";

  return {
    totalRamMB,
    hostOverheadMB: HOST_OVERHEAD_MB,
    appsRamMB,
    cpuLoad,
    recommendedRamMB: withHeadroom,
    recommendedCpuCores,
    armCompatible,
    armUnknownCount,
    count: apps.length,
  };
}

// Map a recommended RAM tier to a relatable hardware suggestion.
export function hardwareHint(recommendedRamMB: number): string {
  const gb = recommendedRamMB / 1024;
  if (gb <= 1) return "A Raspberry Pi 3 / 1GB VPS can handle this";
  if (gb <= 2) return "A Raspberry Pi 4 (2GB) or a small VPS works";
  if (gb <= 4) return "A Raspberry Pi 4/5 (4GB) or entry VPS works";
  if (gb <= 8) return "An 8GB mini-PC / Pi 5 (8GB) is a good fit";
  if (gb <= 16) return "A 16GB mini-PC or a used SFF desktop";
  if (gb <= 32) return "A 32GB NAS or a proper homelab server";
  return "A dedicated server with 32GB+ RAM";
}
