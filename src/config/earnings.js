// ==========================================
// EARNINGS CALCULATOR CONFIGURATION
// ==========================================
// Standard industry creator payout rates per 100,000 views (in USD) across
// the 4 platforms Clippng.in distributes to (YouTube Shorts, Instagram Reels, X, and TikTok),
// broken down by primary viewer region.
//
// Note: Real platform payouts vary by niche, watch time, and program eligibility,
// so the UI keeps the "Estimates only..." disclaimer visible.

export const earningsConfig = {
  currencySymbol: "$",

  // Show a low/high range (-30% / +30%) to reflect natural RPM fluctuation
  showRange: true,
  rangeVariance: 0.3, // +/- 30%

  // Optional agency share percentage (0 = hidden)
  agencySharePercent: 0,

  // Slider configuration for "Average views per clip"
  viewsSliderOptions: [
    { label: "50K", value: 50000 },
    { label: "100K", value: 100000 },
    { label: "250K", value: 250000 },
    { label: "500K", value: 500000 },
    { label: "1M", value: 1000000 },
    { label: "2M", value: 2000000 },
    { label: "5M", value: 5000000 }
  ],

  // Suggested plan tiers mapped by clips-per-month
  packages: [
    { maxClips: 10, name: "Starter Clip Plan" },
    { maxClips: 20, name: "Growth Clip Plan" },
    { maxClips: 30, name: "Full Scale Plan" }
  ],

  // Platform availability rules per region.
  // TikTok is unavailable in India, so selecting India disables TikTok and explains why.
  availability: {
    "Shorts": {
      "USA/Canada": true,
      "UK/Australia": true,
      "Europe": true,
      "Middle East": true,
      "SE Asia": true,
      "LATAM": true,
      "India": true,
      "Global mix": true
    },
    "Reels": {
      "USA/Canada": true,
      "UK/Australia": true,
      "Europe": true,
      "Middle East": true,
      "SE Asia": true,
      "LATAM": true,
      "India": true,
      "Global mix": true
    },
    "X": {
      "USA/Canada": true,
      "UK/Australia": true,
      "Europe": true,
      "Middle East": true,
      "SE Asia": true,
      "LATAM": true,
      "India": true,
      "Global mix": true
    },
    "TikTok": {
      "USA/Canada": true,
      "UK/Australia": true,
      "Europe": true,
      "Middle East": true,
      "SE Asia": true,
      "LATAM": true,
      "India": false,
      "Global mix": true
    }
  },

  unavailabilityNotes: {
    "TikTok:India": "TikTok is banned in India. Switched to YouTube Shorts for this region."
  },

  // Standard Creator Payout Rates per 100,000 Views (USD) by Platform & Viewer Region:
  // - Shorts: YouTube Partner Program Shorts ad-revenue sharing (~$0.03–$0.18 RPM -> $3–$18 per 100K views)
  // - Reels: Instagram Reels monetization / creator bonuses (~$0.03–$0.25 RPM -> $3–$25 per 100K views)
  // - X: X Creator Ads Revenue Sharing on post/video impressions (~$0.02–$0.15 RPM -> $2–$15 per 100K views)
  // - TikTok: TikTok Creator Rewards Program for qualified views (~$0.15–$0.85 RPM -> $15–$85 per 100K views)
  ratePer100kViews: {
    "Shorts": {
      "USA/Canada": 16,
      "UK/Australia": 14,
      "Europe": 11,
      "Middle East": 8,
      "SE Asia": 5,
      "LATAM": 4,
      "India": 2.5,
      "Global mix": 10
    },
    "Reels": {
      "USA/Canada": 22,
      "UK/Australia": 18,
      "Europe": 14,
      "Middle East": 10,
      "SE Asia": 6,
      "LATAM": 5,
      "India": 3,
      "Global mix": 12
    },
    "X": {
      "USA/Canada": 14,
      "UK/Australia": 12,
      "Europe": 9,
      "Middle East": 7,
      "SE Asia": 4,
      "LATAM": 3.5,
      "India": 2,
      "Global mix": 8
    },
    "TikTok": {
      "USA/Canada": 80,
      "UK/Australia": 65,
      "Europe": 50,
      "Middle East": 32,
      "SE Asia": 22,
      "LATAM": 18,
      "India": 0, // Unavailable in India
      "Global mix": 45
    }
  }
};
