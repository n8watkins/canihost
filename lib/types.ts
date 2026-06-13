export type MaintenanceStatus = "active" | "aging" | "stale" | "archived" | "unknown";

export type App = {
  id: string;
  name: string;
  description: string;
  website: string | null;
  source: string | null;
  demo: string | null;
  repo: string | null;
  tags: string[];
  platforms: string[];
  licenses: string[];
  licenseNames: string[];
  dependsThirdParty: boolean;
  docker: boolean;
  stars: number | null;
  updatedAt: string | null;
  archived: boolean;
  release: string | null;
  releaseDate: string | null;
  maintenance: {
    status: MaintenanceStatus;
    daysSince: number | null;
    recentCommits: number;
  };
  resources: {
    ramMB: number;
    cpuWeight: number;
    note: string;
  };
  arch: {
    arm: "likely" | "unknown";
    x86: "yes";
  };
  scaffold: {
    image: string;
    imageIsGuess: boolean;
    port: number | null;
    needsVolume: boolean;
    needsDatabase: boolean;
  };
};

export type Meta = {
  generatedAt: string;
  count: number;
  categories: string[];
  platforms: string[];
  licenses: { id: string; name: string }[];
  withStars: number;
  active: number;
};
