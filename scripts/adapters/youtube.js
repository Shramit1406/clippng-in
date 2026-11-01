// ==========================================
// YOUTUBE ADAPTER (Fully Automatic)
// ==========================================
// 1. Resolves channelId from the channel page if not already cached in sources.js.
// 2. Fetches the channel's public Atom feed: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
//    and also checks the public /shorts tab metadata to prefer short-form vertical clips (< 3 min) over live streams.
// 3. Optional upgrade: if YOUTUBE_API_KEY is present in env, uses the YouTube Data API v3
//    to fetch video statistics/durations for more videos and rank by view count.

import fs from 'fs';
import path from 'path';

function parseViewText(text) {
  if (!text) return null;
  const clean = String(text).replace(/,/g, '').replace(/views?/i, '').trim();
  const match = clean.match(/^([\d.]+)\s*([KMB])?$/i);
  if (!match) {
    const num = parseInt(clean, 10);
    return isNaN(num) ? null : num;
  }
  const val = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();
  if (unit === 'K') return Math.round(val * 1000);
  if (unit === 'M') return Math.round(val * 1000000);
  if (unit === 'B') return Math.round(val * 1000000000);
  return Math.round(val);
}

function parseIsoDurationSeconds(iso) {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + min * 60 + s;
}

export async function resolveChannelId(source) {
  if (source.channelId) return source.channelId;
  const res = await fetch(source.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} resolving YouTube channel ${source.handle}`);
  const html = await res.text();
  const match = html.match(/"channelId":"(UC[\w-]+)"/) || html.match(/"externalId":"(UC[\w-]+)"/);
  if (!match) throw new Error(`Could not find channelId on page for ${source.handle}`);
  const channelId = match[1];

  // Save resolved channelId back to src/config/sources.js so it isn't resolved every time
  try {
    const sourcesPath = path.resolve('src/config/sources.js');
    if (fs.existsSync(sourcesPath)) {
      const content = fs.readFileSync(sourcesPath, 'utf8');
      if (!content.includes(channelId)) {
        const updated = content.replace(
          `url: "${source.url}"`,
          `url: "${source.url}",\n    channelId: "${channelId}"`
        );
        fs.writeFileSync(sourcesPath, updated, 'utf8');
      }
    }
  } catch (_) {
    // Non-fatal if file write fails
  }
  return channelId;
}

export async function fetchYouTubeClips(source, { todayIso = '2026-10-31' } = {}) {
  const channelId = await resolveChannelId(source);
  const apiKey = process.env.YOUTUBE_API_KEY;
  const clipsMap = new Map();

  // Optional upgrade: YouTube Data API v3 when YOUTUBE_API_KEY is supplied
  if (apiKey) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=25&order=viewCount&type=video&key=${apiKey}`;
    const sRes = await fetch(searchUrl);
    if (sRes.ok) {
      const sData = await sRes.json();
      const ids = (sData.items || []).map(i => i.id?.videoId).filter(Boolean);
      if (ids.length > 0) {
        const vUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,liveStreamingDetails&id=${ids.join(',')}&key=${apiKey}`;
        const vRes = await fetch(vUrl);
        if (vRes.ok) {
          const vData = await vRes.json();
          for (const item of vData.items || []) {
            const durSec = parseIsoDurationSeconds(item.contentDetails?.duration);
            const isLive = Boolean(item.liveStreamingDetails);
            const title = item.snippet?.title || '';
            // Skip live streams and full-length uploads (> 180 seconds)
            if (isLive || /🔴\s*LIVE/i.test(title) || (durSec !== null && durSec > 180)) continue;
            const views = item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : null;
            const vid = item.id;
            clipsMap.set(vid, {
              id: `yt-${vid}`,
              platform: 'youtube',
              url: `https://www.youtube.com/shorts/${vid}`,
              title,
              account: source.handle,
              thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
              views,
              viewsAsOf: todayIso,
              source: 'auto'
            });
          }
        }
      }
    }
  }

  // Primary 1: Public Atom feed (https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID)
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const feedRes = await fetch(feedUrl);
  if (!feedRes.ok) {
    throw new Error(`YouTube Atom feed returned HTTP ${feedRes.status}`);
  }
  const xml = await feedRes.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

  for (const match of entries) {
    const entryXml = match[1];
    const vid = entryXml.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const rawTitle = entryXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
    const title = rawTitle.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const link = entryXml.match(/<link rel="alternate" href="(.*?)"/)?.[1] || '';
    const viewsStr = entryXml.match(/views="(\d+)"/)?.[1];
    const desc = entryXml.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || '';

    if (!vid) continue;

    // Prefer Shorts / short-form vertical clips. Skip obvious live streams and full episodes with timestamps
    const isShortLink = link.includes('/shorts/');
    const isLiveStream = /🔴\s*LIVE/i.test(title) || /live Monday-Friday/i.test(desc) || /Highlights include:\s*00:00/i.test(desc);
    if (!isShortLink && isLiveStream) continue;

    const views = viewsStr ? parseInt(viewsStr, 10) : null;
    if (!clipsMap.has(vid)) {
      clipsMap.set(vid, {
        id: `yt-${vid}`,
        platform: 'youtube',
        url: isShortLink ? link : `https://www.youtube.com/shorts/${vid}`,
        title,
        account: source.handle,
        thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        views,
        viewsAsOf: todayIso,
        source: 'auto'
      });
    }
  }

  // Primary 2: Also check the public /shorts tab initial data so all Shorts on the channel are discovered
  try {
    const shortsUrl = `https://www.youtube.com/${source.handle}/shorts`;
    const shortsRes = await fetch(shortsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
    });
    if (shortsRes.ok) {
      const html = await shortsRes.text();
      const ytMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
      if (ytMatch) {
        const data = JSON.parse(ytMatch[1]);
        function extractShorts(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.shortsLockupViewModel) {
            const m = obj.shortsLockupViewModel;
            const vid = m.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
            const title = m.overlayMetadata?.primaryText?.content;
            const viewsText = m.overlayMetadata?.secondaryText?.content;
            if (vid && title && !clipsMap.has(vid)) {
              clipsMap.set(vid, {
                id: `yt-${vid}`,
                platform: 'youtube',
                url: `https://www.youtube.com/shorts/${vid}`,
                title,
                account: source.handle,
                thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
                views: parseViewText(viewsText),
                viewsAsOf: todayIso,
                source: 'auto'
              });
            }
          }
          for (const k of Object.keys(obj)) extractShorts(obj[k]);
        }
        extractShorts(data);
      }
    }
  } catch (_) {
    // Atom feed already succeeded; ignore if /shorts tab fails
  }

  return Array.from(clipsMap.values());
}
