# How To Edit & Refresh — Clippng.in

All content, clips, channels, visual effects, rates, and contact details live inside `src/config/`. You never need to edit React component code in `src/components/` for routine updates.

---

## 1. Changing the Background (`Lightfall`) Colors, Speed, Intensity, or Turning It Off

Open `src/config/siteConfig.js`:

1. **Change the site-wide accent color** (recolors buttons, highlights, `Lightfall` streaks, `WakeSlider` bars, and `MagicBento` glow all at once):
   ```javascript
   accentColor: "#ff4d1f", // Change this hex code to recolor the entire site
   ```
2. **Tweak `Lightfall` speed, brightness, or scope** under `siteConfig.effects.lightfall`:
   ```javascript
   lightfall: {
     enabled: true,          // Set to false to turn off WebGL streaks and show the static dark glow
     scope: "page",          // "page" (behind entire site) or "hero" (only behind #home)
     speed: 0.25,            // Lower = slower, calmer fall; higher = faster
     streakCount: 2,         // Desktop streak layers (1 to 16)
     streakCountMobile: 1,   // Mobile streak layers
     glow: 0.85,             // Overall streak brightness
     backgroundGlow: 0.12,   // Top ambient glow intensity (0 turns it off)
     vignetteOpacity: 0.45   // Increase (up to 1) if you want an even darker backdrop behind text
   }
   ```
   *(Note: Keep `holdToWarp: false` so dragging sliders or swiping the phone carousel never triggers warp trails).*

---

## 2. Changing the Slider (`WakeSlider`) Look

Both sliders in `#earnings` (*"Average Views per Clip"* and *"Clips Posted per Month"*) are controlled by `siteConfig.effects.wakeSlider` in `src/config/siteConfig.js`:

```javascript
wakeSlider: {
  barsDesktop: 32,       // Number of vertical wave bars on desktop
  barsMobile: 24,        // Number of vertical wave bars on mobile (<640px)
  height: 52,            // Full height in px when dragging (keep >= 44px for mobile touch)
  restHeight: 12,        // Idle bar height in px
  gap: 4,                // Gap between bars in px
  trackColor: "#27272a", // Unlit bar color (lit bars automatically use `accentColor`)
  crestColor: "",        // Optional wave peak color (leave "" to match accentColor)
  sensitivity: 1,        // How strongly drag speed lifts the wave
  reach: 6               // How many neighboring bars rise in the wake
}
```

To change the discrete step options on the *"Average Views per Clip"* slider (`50K`, `100K`, `250K`, `500K`, `1M`, `2M`, `5M`), edit `viewsSliderOptions` in `src/config/earnings.js`. `Earnings.jsx` automatically maps the slider's step index (`0` to `viewsSliderOptions.length - 1`) to the label and numeric value.

---

## 3. Customizing `MagicBento` Cards in `#brands`

1. **Grid layout & glow effects (`src/config/siteConfig.js` -> `siteConfig.effects.magicBento`):**
   ```javascript
   magicBento: {
     columns: 4,              // Desktop columns (auto-drops to 2 on tablet and 1 on mobile)
     rowHeight: 150,          // Base height of a 1-row card in px
     gap: 12,                 // Space between cards in px
     radius: 20,              // Card corner radius in px
     enableBorderGlow: true,  // Cursor border glow
     enableSpotlight: true,   // Cursor radial spotlight
     clickEffect: true,       // Click ripple wave
     intro: true              // Staggered scroll-in animation
   }
   ```
2. **Adding or removing a Bento card (`src/components/Brands.jsx` -> `bentoItems`):**
   - The cards in `MagicBento` are built dynamically inside `useMemo` (`bentoItems`) in `src/components/Brands.jsx` from real synced clip data:
     - **Row 1**: 3 KPI cards (`colSpan: 2`, `1`, `1`) showing *Total views on featured clips*, *Clips featured*, and *Platforms*.
     - **Row 2**: 1 wide chart card (`colSpan: 4, rowSpan: 2`) rendering the real log-scale `BarChart`.
     - **Row 3**: 4 vertical cards (`colSpan: 1, rowSpan: 2`) for the Top 4 highest-viewed clips.
   - To add a new real-data card, push an object `{ id, colSpan, rowSpan, content: (<YourJSX />) }` (or `{ image, label, title, description, href }`) to the `items` array inside `bentoItems`.

---

## 4. Adding or Editing a Channel Card in `ScrollStack` (`src/config/channels.js`)

The stacked channel cards under **"Channels we've clipped for"** are configured in **`src/config/channels.js`**.

### How Channel Totals Are Computed Automatically:
- By default, `getChannelsWithStats()` in `src/config/channels.js` groups all active clips from `src/config/clips.generated.json` (or `src/config/clips.js`) whose `account` matches any handle in the channel's `accounts` array (for example, `MCG` groups `["@MCG_live", "@MCGlive", "@mcglivestream"]`).
- It sums their verified `views` (ignoring `null` views) and counts the clips, labeling them honestly as **"Views on featured clips"** and **"Featured clips"**.
- If a channel has no featured clips with data yet (e.g. `@clipsonchain`), it displays **`-`** instead of a fake number.

### Adding a New Channel Card or Updating an Existing One:
1. Save the channel's official banner image (around `1200px` wide `.webp`) and/or avatar image in **`/public/channels/`** (e.g. `/public/channels/newchannel-banner.webp`).
   - *Note:* If a platform has no channel banner (like TikTok or Instagram) or only a low-resolution avatar, leave `bannerImage: ""` and set `avatarImage: "/channels/newchannel-avatar.webp"` (or leave both `""`). The card will automatically render the opaque dark branded fallback card with a soft orange accent gradient and centered circular avatar/initials instead of stretching a low-res image.
2. Add or edit the entry in `channelsList` in `src/config/channels.js`:
   ```javascript
   {
     id: "channel-slug",
     name: "Channel Display Name",
     displayHandle: "@channelhandle",
     accounts: ["@channelhandle"], // Handles used to match clips in clips.generated.json
     platforms: ["youtube", "tiktok"],
     platformLabels: ["YouTube", "TikTok"],
     url: "https://www.youtube.com/@channelhandle",
     bannerImage: "/channels/newchannel-banner.webp", // Or "" to use branded fallback
     bannerAlt: "Channel Display Name official banner",
     avatarImage: "/channels/newchannel-avatar.webp", // Or "" to show initials
     avatarAlt: "Channel Display Name avatar",
     initials: "CD",
     // Optional verified manual overrides (leave null to compute from featured clips)
     totalViewsOverride: null,
     totalClipsOverride: null,
     overrideAsOf: null
   }
   ```
3. **Using Optional Verified Manual Overrides:**
   - If you have verified total views or total clips posted for a channel from your analytics, fill in `totalViewsOverride: 305781`, `totalClipsOverride: 18`, and `overrideAsOf: "2026-11-01"`.
   - When an override is set, the card automatically updates its label to **"Views from our clips"** / **"Clips posted"** and shows **`as of 2026-11-01`**.
4. **Sorting Order:**
   - By default, `siteConfig.effects.scrollStack.sortByViews` is `true` (cards sort by total views descending). Set `sortByViews: false` in `src/config/siteConfig.js` to keep the exact manual order in `src/config/channels.js`.

---

## 5. Running the Clip Sync (`npm run sync`)

Whenever you add or edit clips in `watchlist.js`, `pinned.js`, or `sources.js`, run:

```bash
npm run sync
```

- This fetches the latest short-form videos from YouTube (`@MCG_live`), enriches your watchlist URLs via public oEmbed, and writes `src/config/clips.generated.json`.
- To ignore the local oEmbed cache and force re-fetching every URL:
  ```bash
  npm run sync:force
  ```

---

## 6. Adding or Replacing a Clip in the Watchlist (`src/config/watchlist.js`)

Open `src/config/watchlist.js` and add or update an entry:

```javascript
{
  title: "Optional title (oEmbed will fill this if omitted)",
  platform: "tiktok", // "tiktok" | "instagram" | "x" | "youtube"
  url: "https://www.tiktok.com/@pumpfunplug/video/7647968717078367519",
  account: "@pumpfunplug",
  views: 256700,          // Exact view count seen on the page, or null
  viewsAsOf: "2026-10-31" // Date you checked the view count (YYYY-MM-DD)
}
```

Then run `npm run sync`.

---

## 7. Swapping the Logo and Regenerating the Favicon Set

1. Replace `/public/CLIPNNGDOTIN_LOGO.jpg` with your new logo image (white mark on a black background).
2. Run:
   ```bash
   npm run logo
   ```

---

## 8. Editing Contact Info, Socials, FAQ, and Earnings Estimator Rates

- **Email & Socials (`src/config/siteConfig.js`):** Edit `contact.email`, `defaultSubject`, `defaultBody`, and `contact.socials`. Any social key left as `""` is automatically hidden.
- **Earning Estimator Rates (`src/config/earnings.js`):** Edit `ratePer100kViews[platform][region]`.
- **FAQ (`src/config/faq.js`):** Edit the `faqItems` array of `{ question, answer }` objects.
