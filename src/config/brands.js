// ==========================================
// BRANDS & CHANNELS CONFIGURATION
// ==========================================
// All KPI numbers, chart bars, and top-performing clips in the #brands section
// are computed dynamically from the real synced clips in `src/config/clips.generated.json`
// (falling back to `src/config/clips.js`). No hardcoded view counts or fake metrics live here.
// Channel definitions and optional manual stat overrides live in `src/config/channels.js`.

import { channelsList } from './channels';

export const brandsSection = {
  eyebrow: "FOR BRANDS & STREAMERS · MULTI-PLATFORM DISTRIBUTION",
  headline: "Turn your content into a wall of clips.",
  description: "We capture live streams and shows, cut the highest-retention moments, add native captions and pacing, and distribute across YouTube Shorts, Instagram Reels, X, and TikTok.",
  channelsHeading: "Channels we've clipped for",
  channelsSubnote: "Independent clipping & distribution — channel names and marks belong to their respective owners."
};

export const clippedChannels = channelsList;
