// ==========================================
// CHANNELS CONFIGURATION (ScrollStack in #brands)
// ==========================================
// Defines the channels/brands shown in the "Channels we've clipped for" ScrollStack.
//
// GOLDEN RULE: Do not enter unverified or invented numbers here.
// By default, each channel's view count and clip count are COMPUTED automatically
// by grouping the real featured clips in `src/config/clips.generated.json` (or `src/config/clips.js`)
// and labeled honestly as "Views on featured clips" and "Featured clips".
//
// OPTIONAL MANUAL OVERRIDES:
// If you have verified lifetime channel totals from your analytics, you can fill in:
//   totalViewsOverride: 305781,   // Verified total views across our clips (or leave null)
//   totalClipsOverride: 4,        // Verified total clips posted (or leave null)
//   overrideAsOf: "2026-10-31"    // Date you verified the override numbers
// When an override is provided, the card labels switch to "Views from our clips"
// and "Clips posted" and display "(as of {overrideAsOf})".
// If a channel has no featured clips yet and no override, the card displays "-" instead of a fake number.
//
// TODO (FOR CLIENT): Confirm that you have permission from each client/channel owner
// to display their official channel banner, avatar/logo, and name publicly on this site.

import { getActiveClips, getSyncMeta } from './clipData';
import { siteConfig } from './siteConfig';

export const channelsList = [
  {
    id: "mcg",
    name: "MCG",
    displayHandle: "@MCG_live · @MCGlive · @mcglivestream",
    // All account handles belonging to this brand/channel across platforms
    accounts: ["@MCG_live", "@MCGlive", "@mcglivestream"],
    platforms: ["youtube", "x", "instagram"],
    platformLabels: ["YouTube", "X", "Instagram"],
    url: "https://www.youtube.com/@MCG_live/videos",
    secondaryUrl: "https://x.com/MCGlive",
    // Official YouTube channel banner & avatar saved locally in /public/channels/
    bannerImage: "/channels/mcg-banner.webp",
    bannerAlt: "MCG official YouTube channel banner",
    avatarImage: "/channels/mcg-avatar.webp",
    avatarAlt: "MCG official channel avatar",
    initials: "MCG",
    // Optional verified manual overrides (leave null to compute from featured clips)
    totalViewsOverride: null,
    totalClipsOverride: null,
    overrideAsOf: null
  },
  {
    id: "pumpfunplug",
    name: "Pump Plug",
    displayHandle: "@pumpfunplug",
    accounts: ["@pumpfunplug"],
    platforms: ["tiktok"],
    platformLabels: ["TikTok"],
    url: "https://www.tiktok.com/@pumpfunplug",
    // TikTok has no channel banner, and TikTok's avatar endpoint is geo-blocked in India (HTTP 403).
    // Uses the branded fallback card unless a local image is placed in /public/channels/.
    bannerImage: "",
    bannerAlt: "",
    avatarImage: "",
    avatarAlt: "Pump Plug (@pumpfunplug) avatar",
    initials: "PP",
    totalViewsOverride: null,
    totalClipsOverride: null,
    overrideAsOf: null
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
    totalViewsOverride: null,
    totalClipsOverride: null,
    overrideAsOf: null
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
    totalViewsOverride: null,
    totalClipsOverride: null,
    overrideAsOf: null
  }
];

/**
 * Computes real per-channel clip and view statistics from `getActiveClips()`,
 * applies optional manual overrides when present, and sorts by total views descending
 * if `siteConfig.effects.scrollStack.sortByViews` is enabled.
 */
export function getChannelsWithStats() {
  const clips = getActiveClips();
  const meta = getSyncMeta();

  const computed = channelsList.map(channel => {
    const handleSet = new Set((channel.accounts || []).map(h => h.toLowerCase()));
    const matchingClips = clips.filter(clip => {
      const acc = (clip.account || '').toLowerCase();
      return handleSet.has(acc);
    });

    const clipsWithViews = matchingClips.filter(c => typeof c.views === 'number' && !isNaN(c.views));
    const computedViews = clipsWithViews.reduce((sum, c) => sum + c.views, 0);
    const computedClipsCount = matchingClips.length;

    const hasViewsOverride =
      typeof channel.totalViewsOverride === 'number' && !isNaN(channel.totalViewsOverride);
    const hasClipsOverride =
      typeof channel.totalClipsOverride === 'number' && !isNaN(channel.totalClipsOverride);

    const totalViews = hasViewsOverride
      ? channel.totalViewsOverride
      : clipsWithViews.length > 0
      ? computedViews
      : null;

    const totalClips = hasClipsOverride
      ? channel.totalClipsOverride
      : computedClipsCount > 0
      ? computedClipsCount
      : null;

    const viewsLabel = hasViewsOverride ? 'Views from our clips' : 'Views on featured clips';
    const clipsLabel = hasClipsOverride ? 'Clips posted' : 'Featured clips';
    const asOfDate =
      (hasViewsOverride || hasClipsOverride) && channel.overrideAsOf
        ? channel.overrideAsOf
        : meta.viewsAsOf;

    return {
      ...channel,
      totalViews,
      totalClips,
      viewsLabel,
      clipsLabel,
      asOfDate,
      hasOverride: hasViewsOverride || hasClipsOverride
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
