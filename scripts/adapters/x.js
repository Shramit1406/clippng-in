// ==========================================
// X (TWITTER) ADAPTER (Watchlist + Public oEmbed)
// ==========================================
// Enriches X/Twitter video post URLs from watchlist.js or pinned.js using X's official
// public oEmbed endpoint: https://publish.twitter.com/oembed?url=POST_URL
// Never logs in or scrapes timelines.

export function extractXStatusId(url) {
  if (!url) return null;
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : null;
}

export async function enrichXClip(clip, cache = {}, { force = false, todayIso = '2026-10-31' } = {}) {
  const statusId = extractXStatusId(clip.url);
  const id = statusId ? `x-${statusId}` : `x-${Buffer.from(clip.url).toString('base64').slice(0, 10)}`;
  const cached = !force ? cache[clip.url] : null;

  let title = clip.title || cached?.title || 'X Clip';
  let account = clip.account || cached?.account || '@MCGlive';
  let thumbnail = clip.thumbnail || cached?.thumbnail || null;

  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(clip.url)}&omit_script=true`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data.author_name && !clip.account) account = `@${data.author_name}`;
      if (data.html && !clip.title) {
        // Extract plain text from blockquote paragraph
        const pMatch = data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        if (pMatch) {
          const textOnly = pMatch[1].replace(/<[^>]+>/g, '').trim();
          if (textOnly) title = textOnly.slice(0, 100);
        }
      }
    }
  } catch (_) {
    // Keep watchlist fallback data
  }

  return {
    id,
    platform: 'x',
    url: clip.url,
    title,
    account,
    thumbnail,
    views: typeof clip.views === 'number' ? clip.views : null,
    viewsAsOf: clip.viewsAsOf || todayIso,
    source: clip.source || 'watchlist'
  };
}
