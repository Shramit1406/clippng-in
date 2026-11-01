// ==========================================
// WATCHLIST CLIPS CONFIGURATION
// ==========================================
// For platforms without a public unauthenticated RSS feed (TikTok, Instagram, X),
// paste individual clip URLs here along with the view count you saw on the page.
//
// (Note: YouTube @MCG_live is synced automatically by `scripts/adapters/youtube.js`,
// so you don't need to paste YouTube clips here unless you want to override one.)
//
// GOLDEN RULE: Never invent view counts. Only enter a number you actually saw on the page,
// or set `views: null` (the UI will cleanly hide the view badge if views is null).
// Any entry with an empty `url: ""` is a TODO placeholder and is automatically skipped.

export const watchlistClips = [
  // ---------------------------------------------------------------------------
  // VERIFIED REAL CLIPS FROM @pumpfunplug (TikTok) - Checked live on 2026-10-31
  // ---------------------------------------------------------------------------
  {
    title: "Is dropping out worth it? #orangie #kimchi #trade #dropout",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pumpfunplug/video/7647968717078367519",
    account: "@pumpfunplug",
    views: 256700,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "Is Kimchi the new goat of trading? #kimchi #orangie #fyp #trader",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pumpfunplug/video/7647679153948331295",
    account: "@pumpfunplug",
    views: 46500,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "Ex-Fortnite Pro Loses His FNCS Earnings In Seconds @Megga #faze #megga",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pumpfunplug/video/7615056080997010702",
    account: "@pumpfunplug",
    views: 1561,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "Streamer loses half of his net worth in under 10 seconds",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pumpfunplug/video/7611346722622541069",
    account: "@pumpfunplug",
    views: 1020,
    viewsAsOf: "2026-10-31"
  },

  // ---------------------------------------------------------------------------
  // VERIFIED REAL CLIPS FROM @pump.moments (TikTok) - Checked live on 2026-10-31
  // ---------------------------------------------------------------------------
  {
    title: "Clav speed dating is a different breed #pumpfun #clav #clavicular",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pump.moments/video/7584104962372799775",
    account: "@pump.moments",
    views: 17200,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "81-year old Grandma is SHOCKED after finding out how much she made during her first stream",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pump.moments/video/7596177180455963934",
    account: "@pump.moments",
    views: 2130,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "Tarek tries to pull Colombian baddie on Omegle",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pump.moments/video/7589881773165694238",
    account: "@pump.moments",
    views: 2047,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "Tarek x Habibi House Core #pumpfun #habibihouse #adamsaleh",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pump.moments/video/7584137325714672927",
    account: "@pump.moments",
    views: 1560,
    viewsAsOf: "2026-10-31"
  },

  // ---------------------------------------------------------------------------
  // TODO SLOTS FOR ACCOUNTS BEHIND LOGIN WALLS / CONNECTION BLOCKS
  // Paste real clip URLs and view counts below, then run `npm run sync`.
  // Empty URLs (`url: ""`) are never rendered on the site.
  // ---------------------------------------------------------------------------
  {
    title: "TODO: paste best clip",
    platform: "tiktok",
    url: "",
    account: "@clipsonchain",
    views: null,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "TODO: paste best clip",
    platform: "x",
    url: "",
    account: "@MCGlive",
    views: null,
    viewsAsOf: "2026-10-31"
  },
  {
    title: "TODO: paste best clip",
    platform: "instagram",
    url: "",
    account: "@mcglivestream",
    views: null,
    viewsAsOf: "2026-10-31"
  }
];
