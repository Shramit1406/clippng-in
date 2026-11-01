// ==========================================
// OPTIONAL PAID SCRAPER ADAPTER STUB (Apify)
// ==========================================
// DISABLED BY DEFAULT.
// This stub only activates if you explicitly set `APIFY_TOKEN` in your `.env` file
// AND configure actor dataset/task IDs.
//
// IMPORTANT NOTE:
// - Paid third-party scraper services (like Apify) cost money per run/compute unit.
// - Always ensure usage complies with platform terms of service and that you have
//   permission from the account owners before syncing their public profile metadata.
// - Without `APIFY_TOKEN`, TikTok, Instagram, and X rely on `src/config/watchlist.js`.

export async function fetchFromApifyIfConfigured(source, { todayIso = '2026-10-31' } = {}) {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return { enabled: false, clips: [] };
  }

  // Optional: If the user configures an Apify dataset ID for a source (e.g. source.apifyDatasetId),
  // fetch the items and map them to the standard clip shape.
  if (!source.apifyDatasetId) {
    return {
      enabled: true,
      clips: [],
      note: `APIFY_TOKEN is set, but no apifyDatasetId is configured on source ${source.handle} in src/config/sources.js.`
    };
  }

  const url = `https://api.apify.com/v2/datasets/${source.apifyDatasetId}/items?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    throw new Error(`Apify dataset fetch failed with HTTP ${res.status}`);
  }
  const items = await res.json();
  const clips = (Array.isArray(items) ? items : []).map((item, idx) => ({
    id: `${source.platform}-apify-${item.id || idx}`,
    platform: source.platform,
    url: item.webVideoUrl || item.url || '',
    title: item.text || item.title || `${source.handle} clip`,
    account: source.handle,
    thumbnail: item.videoMeta?.coverUrl || item.displayUrl || null,
    views: typeof item.playCount === 'number' ? item.playCount : (typeof item.videoViewCount === 'number' ? item.videoViewCount : null),
    viewsAsOf: todayIso,
    source: 'auto'
  })).filter(c => Boolean(c.url));

  return { enabled: true, clips };
}
