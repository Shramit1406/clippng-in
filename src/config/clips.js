// ==========================================
// CLIPS PORTFOLIO CONFIGURATION (Manual Fallback & Curated Real Clips)
// ==========================================
// All clips on the site are synced into `src/config/clips.generated.json` when you run `npm run sync` (or `npm run build`).
// This file serves as the clean manual fallback if `clips.generated.json` is not present.
//
// ORDERING:
// First 6 clips are YouTube Shorts from @MCG_live (accessible globally without a VPN),
// followed by 2 top TikTok clips from @pumpfunplug and @pump.moments (since TikTok is banned in India without VPN).
// Any entry with an empty `url: ""` is a TODO slot and is NEVER rendered on the site.

export const clipsSection = {
  header: "Clips that actually hit.",
  eyebrow: "OUR WORK",
  description: "Fast-paced, high-retention vertical edits cut from live streams and shows, formatted natively for YouTube Shorts, Instagram Reels, X, and TikTok."
};

export const clipsList = [
  // ---------------------------------------------------------------------------
  // FIRST 6 CLIPS: YOUTUBE SHORTS (@MCG_live) — Ranked by verified views
  // ---------------------------------------------------------------------------
  {
    id: "yt-evShWOsXzug",
    title: "He retired his parents with million dollars and they are still mad about him dropping out",
    platform: "youtube",
    url: "https://www.youtube.com/shorts/evShWOsXzug",
    account: "@MCG_live",
    thumbnail: "https://i.ytimg.com/vi/evShWOsXzug/hqdefault.jpg",
    views: 1100,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "yt-4oqV5hOho9M",
    title: "YT Short 3",
    platform: "youtube",
    url: "https://www.youtube.com/shorts/4oqV5hOho9M",
    account: "@MCG_live",
    thumbnail: "https://i.ytimg.com/vi/4oqV5hOho9M/hqdefault.jpg",
    views: 901,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "yt-Yar_9CgeJ8Y",
    title: "$STABLE Liquidity For Homeowners, Home Equity Market On-Chain, TAM $35 Trillion!!!",
    platform: "youtube",
    url: "https://www.youtube.com/shorts/Yar_9CgeJ8Y",
    account: "@MCG_live",
    thumbnail: "https://i.ytimg.com/vi/Yar_9CgeJ8Y/hqdefault.jpg",
    views: 890,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "yt-9DWdnNQVMFc",
    title: "$ORGO Computer-Using Agents Have Replaced Workers!!!",
    platform: "youtube",
    url: "https://www.youtube.com/shorts/9DWdnNQVMFc",
    account: "@MCG_live",
    thumbnail: "https://i.ytimg.com/vi/9DWdnNQVMFc/hqdefault.jpg",
    views: 686,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "yt-ES9dG4Hc79s",
    title: "We Called Soulja Boy On Stream.....Or Rather His AI Automated Voice!!!",
    platform: "youtube",
    url: "https://www.youtube.com/shorts/ES9dG4Hc79s",
    account: "@MCG_live",
    thumbnail: "https://i.ytimg.com/vi/ES9dG4Hc79s/hqdefault.jpg",
    views: 659,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "yt-ZLqOIamVyC4",
    title: "this is KIMCHI'S real STORY!",
    platform: "youtube",
    url: "https://www.youtube.com/shorts/ZLqOIamVyC4",
    account: "@MCG_live",
    thumbnail: "https://i.ytimg.com/vi/ZLqOIamVyC4/hqdefault.jpg",
    views: 403,
    viewsAsOf: "2026-10-31"
  },

  // ---------------------------------------------------------------------------
  // NEXT 2 CLIPS: TIKTOK (@pumpfunplug & @pump.moments)
  // ---------------------------------------------------------------------------
  {
    id: "tt-7647968717078367519",
    title: "Is dropping out worth it? #orangie #kimchi #trade #dropout",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pumpfunplug/video/7647968717078367519",
    account: "@pumpfunplug",
    thumbnail: "https://www.tiktok.com/api/img/?itemId=7647968717078367519&location=0&aid=1988",
    views: 256700,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "tt-7584104962372799775",
    title: "Clav speed dating is a different breed #pumpfun #clav #clavicular",
    platform: "tiktok",
    url: "https://www.tiktok.com/@pump.moments/video/7584104962372799775",
    account: "@pump.moments",
    thumbnail: "https://www.tiktok.com/api/img/?itemId=7584104962372799775&location=0&aid=1988",
    views: 17200,
    viewsAsOf: "2026-10-31"
  },

  // Empty TODO slots for platforms/accounts that required login or timed out during sync.
  // Clips with `url: ""` are automatically filtered out and never rendered on the site.
  {
    id: "todo-clipsonchain",
    title: "TODO: paste best clip",
    platform: "tiktok",
    url: "",
    account: "@clipsonchain",
    views: null,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "todo-mcglive-x",
    title: "TODO: paste best clip",
    platform: "x",
    url: "",
    account: "@MCGlive",
    views: null,
    viewsAsOf: "2026-10-31"
  },
  {
    id: "todo-mcglivestream-ig",
    title: "TODO: paste best clip",
    platform: "instagram",
    url: "",
    account: "@mcglivestream",
    views: null,
    viewsAsOf: "2026-10-31"
  }
];
