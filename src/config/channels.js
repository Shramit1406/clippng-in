// ==========================================
// CHANNELS CONFIGURATION (ScrollStack in #brands)
// ==========================================
// Defines the channels/brands shown in the "Channels we've clipped for" ScrollStack.

import { getSyncMeta } from './clipData';
import { siteConfig } from './siteConfig';

export const channelsList = [
  {
    id: "mcg",
    name: "MCG",
    displayHandle: "@MCG_live · @MCGlive · @mcglivestream",
    accounts: ["@MCG_live", "@MCGlive", "@mcglivestream"],
    platforms: ["youtube", "x", "instagram"],
    platformLabels: ["YouTube", "X", "Instagram"],
    url: "https://www.youtube.com/@MCG_live/videos",
    secondaryUrl: "https://x.com/MCGlive",
    bannerImage: "/channels/mcg-banner.webp",
    bannerAlt: "MCG official YouTube channel banner",
    avatarImage: "/channels/mcg-avatar.webp",
    avatarAlt: "MCG official channel avatar",
    initials: "MCG",
    totalViewsOverride: 36420000,
    totalViewsDisplay: "36.4M+",
    totalClipsOverride: 1680,
    totalClipsDisplay: "1,680+"
  },
  {
    id: "pumpfunplug",
    name: "Pump Plug",
    displayHandle: "@pumpfunplug",
    accounts: ["@pumpfunplug"],
    platforms: ["tiktok"],
    platformLabels: ["TikTok"],
    url: "https://www.tiktok.com/@pumpfunplug",
    bannerImage: "",
    bannerAlt: "",
    avatarImage: "",
    avatarAlt: "Pump Plug (@pumpfunplug) avatar",
    initials: "PP",
    totalViewsOverride: 28850000,
    totalViewsDisplay: "28.9M+",
    totalClipsOverride: 1420,
    totalClipsDisplay: "1,420+"
  },
  {
    id: "pumpmoments",
    name: "pump.moments",
    displayHandle: "@pump.moments",
    accounts: ["@pump.moments"],
    platforms: ["tiktok"],
    platformLabels: ["TikTok"],
    url: "https://www.tiktok.com/@pump.moments",
    bannerImage: "",
    bannerAlt: "",
    avatarImage: "",
    avatarAlt: "pump.moments (@pump.moments) avatar",
    initials: "PM",
    totalViewsOverride: 21740000,
    totalViewsDisplay: "21.7M+",
    totalClipsOverride: 1190,
    totalClipsDisplay: "1,190+"
  },
  {
    id: "clipsonchain",
    name: "clips onchain",
    displayHandle: "@clipsonchain",
    accounts: ["@clipsonchain"],
    platforms: ["tiktok"],
    platformLabels: ["TikTok"],
    url: "https://www.tiktok.com/@clipsonchain",
    bannerImage: "",
    bannerAlt: "",
    avatarImage: "",
    avatarAlt: "clips onchain (@clipsonchain) avatar",
    initials: "CO",
    totalViewsOverride: 17390000,
    totalViewsDisplay: "17.4M+",
    totalClipsOverride: 1060,
    totalClipsDisplay: "1,060+"
  }
];

/**
 * Returns the configured channels with their showcase view and clip totals
 * and dynamic current date, sorted by total views descending when enabled.
 */
export function getChannelsWithStats() {
  const meta = getSyncMeta();

  const computed = channelsList.map(channel => {
    const totalViews = channel.totalViewsOverride;
    const totalClips = channel.totalClipsOverride;

    return {
      ...channel,
      totalViews,
      totalClips,
      viewsDisplay: channel.totalViewsDisplay || (typeof totalViews === 'number' ? totalViews.toLocaleString() : '-'),
      clipsDisplay: channel.totalClipsDisplay || (typeof totalClips === 'number' ? totalClips.toLocaleString() : '-'),
      viewsLabel: 'Total Views on Clips',
      clipsLabel: 'Total Clips',
      asOfDate: meta.viewsAsOf,
      hasOverride: true
    };
  });

  const shouldSort = siteConfig.effects?.scrollStack?.sortByViews !== false;
  if (shouldSort) {
    return [...computed].sort((a, b) => {
      const viewsA = typeof a.totalViews === 'number' ? a.totalViews : -1;
      const viewsB = typeof b.totalViews === 'number' ? b.totalViews : -1;
      return viewsB - viewsA;
    });
  }

  return computed;
}
