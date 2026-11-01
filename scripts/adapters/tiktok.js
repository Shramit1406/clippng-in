// ==========================================
// TIKTOK ADAPTER (Watchlist + Public oEmbed)
// ==========================================
// Enriches TikTok clip URLs from watchlist.js or pinned.js using TikTok's official
// public oEmbed endpoint: https://www.tiktok.com/oembed?url=VIDEO_URL
// Never logs in or scrapes profile grids.

export function extractTikTokVideoId(url) {
  if (!url) return null;
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

export async function enrichTikTokClip(clip, cache = {}, { force = false, todayIso = '2026-10-31' } = {}) {
  const vid = extractTikTokVideoId(clip.url);
  const id = vid ? `tt-${vid}` : `tt-${Buffer.from(clip.url).toString('base64').slice(0, 10)}`;
  const cached = !force ? cache[clip.url] : null;

  let title = clip.title || cached?.title || 'TikTok Clip';
  let account = clip.account || cached?.account || '@tiktok';
  // TikTok's public image endpoint by video itemId works reliably if oEmbed thumbnail expires
  let thumbnail = clip.thumbnail || cached?.thumbnail || (vid ? `https://www.tiktok.com/api/img/?itemId=${vid}&location=0&aid=1988` : null);

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(clip.url)}`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title && !clip.title) title = data.title;
      if (data.author_unique_id && !clip.account) account = `@${data.author_unique_id}`;
      if (data.thumbnail_url) thumbnail = data.thumbnail_url;
    }
  } catch (_) {
    // Graceful fallback: keep watchlist metadata and fallback thumbnail
  }

  return {
    id,
    platform: 'tiktok',
    url: clip.url,
    title,
    account,
    thumbnail,
    views: typeof clip.views === 'number' ? clip.views : null,
    viewsAsOf: clip.viewsAsOf || todayIso,
    source: clip.source || 'watchlist'
  };
}
