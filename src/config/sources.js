// ==========================================
// CLIP SYNC SOURCES CONFIGURATION
// ==========================================
// This file configures the accounts, platform priority, and per-platform caps
// for the automatic clip sync script (`npm run sync`).

export const syncSettings = {
  // Maximum total clips to include in src/config/clips.generated.json
  maxClips: 8,

  // Platform order priority for the phone carousel:
  // YouTube (plus Instagram & X when watchlist URLs are present) appear FIRST,
  // and TikTok appears LAST (capped at 2 clips) because TikTok is blocked in
  // countries like India unless visitors use a VPN.
  platformOrder: ["youtube", "instagram", "x", "tiktok"],

  // Per-platform caps:
  // - Default: up to 6 YouTube clips first + 2 TikTok clips last (8 total).
  // - If you paste Instagram or X clip URLs into src/config/watchlist.js,
  //   they will automatically slot in after YouTube and before TikTok!
  platformCaps: {
    youtube: 6,
    instagram: 2,
    x: 2,
    tiktok: 2
  },

  // Fallback cap for any other platform
  perPlatformCap: 4,
};

// Source accounts managed/clipped for our clients.
// It is trivial to add or remove a source: just add or remove an object below and run `npm run sync`.
export const clipSources = [
  {
    platform: "youtube",
    handle: "@MCG_live",
    name: "MCG",
    url: "https://www.youtube.com/@MCG_live/videos",
    // Resolved channel ID for @MCG_live so the script doesn't need to re-resolve it every run
    channelId: "UCeVUY-_w7cId3I76-e-amAw"
  },
  {
    platform: "x",
    handle: "@MCGlive",
    name: "MCG",
    url: "https://x.com/MCGlive"
  },
  {
    platform: "instagram",
    handle: "@mcglivestream",
    name: "MCG",
    url: "https://www.instagram.com/mcglivestream/"
  },
  {
    platform: "tiktok",
    handle: "@pumpfunplug",
    name: "Pump Plug",
    url: "https://www.tiktok.com/@pumpfunplug"
  },
  {
    platform: "tiktok",
    handle: "@clipsonchain",
    name: "clips onchain",
    url: "https://www.tiktok.com/@clipsonchain"
  },
  {
    platform: "tiktok",
    handle: "@pump.moments",
    name: "pump.moments",
    url: "https://www.tiktok.com/@pump.moments"
  }
];
