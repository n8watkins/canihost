import type { App } from "./types";

/**
 * Use-case ("what do you want to do") layer over the awesome-selfhosted data.
 * The upstream list is organized by *what the software is* (tech categories like
 * "Feed Readers"). People think in *goals* — "replace Google Photos", "stop paying
 * for Plex". Each goal maps to a handful of hand-picked top apps plus the tech
 * tags it belongs to, so the directory can be filtered by intent, not jargon.
 */
export type UseCase = {
  id: string;
  /** Headline framing, e.g. "Replace Google Photos" */
  label: string;
  /** Short chip label, e.g. "Photos" */
  short: string;
  /** Proprietary tools this replaces — the thing people actually search for */
  replaces: string[];
  /** Emoji glyph for the tile */
  icon: string;
  /** Curated top picks (app ids), shown first in results */
  appIds: string[];
  /** Tech tags that back this goal (category fallback match) */
  tags: string[];
};

export const USE_CASES: UseCase[] = [
  { id: "photos", label: "Replace Google Photos", short: "Photos", replaces: ["Google Photos", "iCloud Photos"], icon: "📷", appIds: ["immich", "photoprism"], tags: ["Photo Galleries"] },
  { id: "movies", label: "Stream your movies & TV", short: "Movies & TV", replaces: ["Netflix", "Plex"], icon: "🎬", appIds: ["jellyfin", "plex"], tags: ["Media Streaming - Multimedia Streaming", "Media Streaming - Video Streaming", "Media Management"] },
  { id: "music", label: "Stream your own music", short: "Music", replaces: ["Spotify", "Apple Music"], icon: "🎵", appIds: ["navidrome", "funkwhale"], tags: ["Media Streaming - Audio Streaming"] },
  { id: "passwords", label: "Manage your passwords", short: "Passwords", replaces: ["1Password", "LastPass"], icon: "🔑", appIds: ["vaultwarden", "bitwarden"], tags: ["Password Managers"] },
  { id: "files", label: "Sync & store your files", short: "File sync", replaces: ["Dropbox", "Google Drive"], icon: "📁", appIds: ["nextcloud", "seafile", "syncthing"], tags: ["File Transfer & Synchronization", "File Transfer - Object Storage & File Servers"] },
  { id: "notes", label: "Take notes", short: "Notes", replaces: ["Notion", "Evernote"], icon: "📝", appIds: ["outline", "joplin", "trilium"], tags: ["Note-taking & Editors", "Knowledge Management Tools"] },
  { id: "rss", label: "Read RSS feeds", short: "RSS", replaces: ["Feedly", "Google Reader"], icon: "📰", appIds: ["freshrss", "miniflux"], tags: ["Feed Readers"] },
  { id: "readlater", label: "Save articles for later", short: "Read later", replaces: ["Pocket", "Instapaper"], icon: "🔖", appIds: ["wallabag", "readeck"], tags: ["Bookmarks and Link Sharing"] },
  { id: "adblock", label: "Block ads on your whole network", short: "Ad-blocking", replaces: ["NextDNS", "paid VPN blockers"], icon: "🛡️", appIds: ["pi-hole", "adguard-home"], tags: ["DNS"] },
  { id: "git", label: "Host your own Git", short: "Git hosting", replaces: ["GitHub", "GitLab.com"], icon: "🐙", appIds: ["gitea", "forgejo"], tags: ["Software Development - Project Management"] },
  { id: "dashboard", label: "Build a homelab dashboard", short: "Dashboard", replaces: ["browser bookmarks"], icon: "📊", appIds: ["homarr", "homepage", "dashy"], tags: ["Personal Dashboards"] },
  { id: "analytics", label: "Track web analytics", short: "Analytics", replaces: ["Google Analytics"], icon: "📈", appIds: ["plausible", "umami", "matomo"], tags: ["Analytics"] },
  { id: "automation", label: "Automate your workflows", short: "Automation", replaces: ["Zapier", "IFTTT"], icon: "⚙️", appIds: ["n8n", "node-red", "huginn"], tags: ["Automation"] },
  { id: "bookmarks", label: "Organize your bookmarks", short: "Bookmarks", replaces: ["Raindrop", "Pinboard"], icon: "🔗", appIds: ["linkding", "karakeep", "hoarder"], tags: ["Bookmarks and Link Sharing"] },
  { id: "blog", label: "Run a blog", short: "Blog", replaces: ["WordPress.com", "Medium"], icon: "✍️", appIds: ["ghost", "writefreely"], tags: ["Blogging Platforms"] },
  { id: "recipes", label: "Save recipes & plan meals", short: "Recipes", replaces: ["Paprika"], icon: "🍳", appIds: ["mealie", "tandoor"], tags: ["Recipe Management"] },
  { id: "budget", label: "Track your money", short: "Budgeting", replaces: ["Mint", "YNAB"], icon: "💰", appIds: ["firefly-iii", "actual"], tags: ["Money, Budgeting & Management"] },
  { id: "smarthome", label: "Run a smart home", short: "Smart home", replaces: ["SmartThings"], icon: "🏠", appIds: ["home-assistant"], tags: ["Internet of Things (IoT)"] },
  { id: "video", label: "Host video calls", short: "Video calls", replaces: ["Zoom", "Google Meet"], icon: "📹", appIds: ["jitsi", "jitsi-meet"], tags: ["Communication - Video Conferencing"] },
  { id: "chat", label: "Run team chat", short: "Team chat", replaces: ["Slack", "Discord"], icon: "💬", appIds: ["mattermost", "rocket.chat"], tags: ["Communication - Custom Communication Systems"] },
  { id: "ebooks", label: "Read e-books & audiobooks", short: "E-books", replaces: ["Kindle", "Audible"], icon: "📚", appIds: ["calibre-web", "audiobookshelf"], tags: ["Document Management - E-books", "Media Streaming - Audio Streaming"] },
  { id: "docs", label: "Scan & manage documents", short: "Documents", replaces: ["paper filing", "Evernote"], icon: "📄", appIds: ["paperless-ngx"], tags: ["Document Management"] },
  { id: "wiki", label: "Build a wiki or docs site", short: "Wiki", replaces: ["Confluence", "Notion"], icon: "📖", appIds: ["bookstack", "wiki.js", "outline"], tags: ["Wikis"] },
  { id: "monitor", label: "Monitor uptime & status", short: "Monitoring", replaces: ["Pingdom", "UptimeRobot"], icon: "⏱️", appIds: ["uptime-kuma", "gatus"], tags: ["Network Utilities"] },
];

export const USE_CASE_BY_ID: Record<string, UseCase> = Object.fromEntries(
  USE_CASES.map((u) => [u.id, u]),
);

/** Apps that satisfy a goal: curated picks first (in order), then by stars. */
export function matchUseCase(apps: App[], uc: UseCase): App[] {
  const idOrder = new Map(uc.appIds.map((id, i) => [id, i]));
  const tagSet = new Set(uc.tags);
  const matched = apps.filter(
    (a) => idOrder.has(a.id) || a.tags.some((t) => tagSet.has(t)),
  );
  return matched.sort((a, b) => {
    const ai = idOrder.has(a.id) ? (idOrder.get(a.id) as number) : Infinity;
    const bi = idOrder.has(b.id) ? (idOrder.get(b.id) as number) : Infinity;
    if (ai !== bi) return ai - bi;
    return (b.stars ?? 0) - (a.stars ?? 0);
  });
}

/** Precompute counts once for tile badges. */
export function useCaseCounts(apps: App[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const uc of USE_CASES) out[uc.id] = matchUseCase(apps, uc).length;
  return out;
}
