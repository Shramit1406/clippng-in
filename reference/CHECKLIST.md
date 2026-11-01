# Pre-Launch & Verification Checklist — Clippng.in

All fake numbers, "SITE_NAME" placeholders, fake "Live" badges, invented growth charts, and React Bits demo placeholders (`"Launch plan"`, `"Maya"`, `"Push to main"`, `"$48.2k"`) have been removed. Every number shown on the site is dynamically computed from `src/config/clips.generated.json` (or `src/config/clips.js`).

Before going live with your friend, review the items below that require human confirmation or optional manual data entry:

---

## 1. Channel Banners, Logos & Optional Verified Totals (`src/config/channels.js`)
- [ ] **Confirm permission to display channel banners and logos publicly (`src/config/channels.js`):** Confirm with your friend that he has permission from each client/channel owner (`MCG`, `Pump Plug`, `pump.moments`, `clips onchain`) to display their channel name, official YouTube banner (`/public/channels/mcg-banner.webp`), and avatar (`/public/channels/mcg-avatar.webp`) publicly in the `<ScrollStack />` section.
- [ ] **Note on TikTok & Instagram channel banners:** TikTok (`@pumpfunplug`, `@pump.moments`, `@clipsonchain`) and Instagram (`@mcglivestream`) do not have wide channel banner images on their profiles, and TikTok's avatar redirect endpoint (`tiktok.com/api/img/...`) is geo-blocked in India (HTTP 403). Therefore:
  - **MCG** uses its official high-resolution YouTube channel banner (`/public/channels/mcg-banner.webp`) and avatar (`/public/channels/mcg-avatar.webp`).
  - **Pump Plug**, **pump.moments**, and **clips onchain** use the opaque dark branded fallback card (soft orange-red radial accent gradient + centered circular initials badge). If your friend has high-resolution avatar or banner files for those channels, drop them into `/public/channels/` as `.webp` files and set `bannerImage` / `avatarImage` in `src/config/channels.js`.
- [ ] **Optional verified lifetime channel totals (`src/config/channels.js`):** Currently, each channel card in `<ScrollStack />` computes its stats strictly from the featured clips in `clips.generated.json` (labeled honestly as *"Views on featured clips"* and *"Featured clips"*, with `-` shown for `clips onchain` since it has no active featured clips yet). If your friend has verified lifetime totals from his analytics for any channel, he can fill in `totalViewsOverride`, `totalClipsOverride`, and `overrideAsOf` in `src/config/channels.js`.

---

## 2. Unverified / Manual Clip Slots to Fill (`src/config/watchlist.js`)
TikTok (`@pumpfunplug` and `@pump.moments`) and YouTube (`@MCG_live`) are already populated with **real, verified clips and exact view counts**. However, three accounts could not be read automatically without logging in or hitting connection timeouts:
- [ ] **`@clipsonchain` (TikTok):** Connection timed out / geo-blocked during automated fetch. Open `https://www.tiktok.com/@clipsonchain` in your browser with VPN, copy the URLs and view counts of the top 2–4 clips, paste them into `src/config/watchlist.js` (replacing the `@clipsonchain` TODO slot), and run `npm run sync`.
- [ ] **`@MCGlive` (X / Twitter):** X blocks unauthenticated profile timeline browsing behind a login wall. Open `https://x.com/MCGlive`, copy 2–4 top short-form video post URLs (`https://x.com/MCGlive/status/...`) and their view counts into `src/config/watchlist.js`, and run `npm run sync`.
- [ ] **`@mcglivestream` (Instagram):** Instagram redirects profile grid browsing to a login wall. Open `https://www.instagram.com/mcglivestream/`, copy 2–4 top Reel URLs (`https://www.instagram.com/reel/...`) and their view counts into `src/config/watchlist.js`, and run `npm run sync`.

*(Note: Until you paste those URLs, the empty `url: ""` TODO slots in `watchlist.js` are automatically skipped and never render broken embeds).*

---

## 3. Business & Rate Confirmations Needed from Owner
- [ ] **Review Earning Estimator benchmark rates (`src/config/earnings.js`):** Have your friend confirm the `ratePer100kViews` platform × region matrix in `src/config/earnings.js` and set `agencySharePercent` if he wants to display an agency revenue-share cut.
- [ ] **Confirm pricing & turnaround answers in FAQ (`src/config/faq.js`):** Questions #4 (pricing/packages) and #5 (turnaround/contracts) currently direct visitors to *"Message us at sahir@clippng.in for a quote"*. Update `src/config/faq.js` if your friend wants specific prices or turnaround times shown publicly.
- [ ] **Optional extra social links (`src/config/siteConfig.js`):** Currently only Instagram (`https://www.instagram.com/clippng.in`) and X (`https://x.com/clippngdotin`) are active; all other socials are empty (`""`) and hidden.
- [ ] **Optional response-time claim (`src/config/siteConfig.js`):** `contact.responseTimeNote` is currently empty (`""`) so no unverified response-time guarantee is made.

---

## 4. Sync & Automation Setup (Optional)
- [ ] **Note on platform sync modes:**
  - **YouTube (`@MCG_live`)** is **fully automatic** out of the box via its public Atom feed and Shorts tab.
  - **TikTok, Instagram, and X** are **watchlist-based** (`src/config/watchlist.js` + official public oEmbed) unless a paid scraper token (`APIFY_TOKEN`) is configured.
- [ ] **Add `YOUTUBE_API_KEY` (Optional):** Add `YOUTUBE_API_KEY` to `.env` locally and to GitHub Actions Secrets if deeper YouTube Data API v3 queries are desired.
- [ ] **Verify GitHub Actions permissions:** Ensure **Settings -> Actions -> General -> Workflow permissions** is set to *"Read and write permissions"* so `.github/workflows/sync-clips.yml` can commit updated `clips.generated.json` files on its daily schedule.
