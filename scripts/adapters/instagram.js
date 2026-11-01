// ==========================================
// INSTAGRAM ADAPTER (Watchlist + Optional oEmbed)
// ==========================================
// Enriches Instagram Reel/Post URLs from watchlist.js or pinned.js.
// Meta's Instagram oEmbed API requires an App Token (`INSTAGRAM_OEMBED_TOKEN` in .env).
// If `INSTAGRAM_OEMBED_TOKEN` is present, it queries graph.facebook.com/v19.0/instagram_oembed.
// Otherwise, it skips the network call gracefully and preserves the watchlist entry.

export function extractInstagramCode(url) {
  if (!url) return null;
  const m = url.match(/\/(?:reel|p|tv)\/([\w-]+)/);
  return m ? m[1] : null;
}

export async function enrichInstagramClip(clip, cache = {}, { force = false, todayIso = '2026-10-31' } = {}) {
  const code = extractInstagramCode(clip.url);
  const id = code ? `ig-${code}` : `ig-${Buffer.from(clip.url).toString('base64').slice(0, 10)}`;
  const cached = !force ? cache[clip.url] : null;

  let title = clip.title || cached?.title || 'Instagram Reel';
  let account = clip.account || cached?.account || '@mcglivestream';
  let thumbnail = clip.thumbnail || cached?.thumbnail || null;

  const token = process.env.INSTAGRAM_OEMBED_TOKEN;
  if (token) {
    try {
      const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(clip.url)}&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (data.title && !clip.title) title = data.title;
        if (data.author_name && !clip.account) account = `@${data.author_name}`;
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch (_) {
      // Keep fallback data if oEmbed fails
    }
  }

  return {
    id,
    platform: 'instagram',
    url: clip.url,
    title,
    account,
    thumbnail,
    views: typeof clip.views === 'number' ? clip.views : null,
    viewsAsOf: clip.viewsAsOf || todayIso,
    source: clip.source || 'watchlist'
  };
}
