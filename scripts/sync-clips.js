// ==========================================
// AUTOMATIC CLIP SYNC SCRIPT (`npm run sync`)
// ==========================================
// Runs before `npm run build` (or manually via `npm run sync` / `npm run sync:force`).
// Fetches clip data from configured sources, enriches watchlist/pinned clips via public oEmbed,
// merges, deduplicates, ranks by view count, orders globally accessible platforms first
// (YouTube / Instagram / X before TikTok), enforces per-platform caps, and writes
// `src/config/clips.generated.json`.
//
// GOLDEN RULE: Never invent data. If a source fails, log a clear warning, preserve previous
// good data for that source from the last run, and never crash the build.

import fs from 'fs';
import path from 'path';
import { clipSources, syncSettings } from '../src/config/sources.js';
import { pinnedClips } from '../src/config/pinned.js';
import { watchlistClips } from '../src/config/watchlist.js';
import { clipsList as fallbackManualClips } from '../src/config/clips.js';
import { fetchYouTubeClips } from './adapters/youtube.js';
import { enrichTikTokClip, extractTikTokVideoId } from './adapters/tiktok.js';
import { enrichInstagramClip, extractInstagramCode } from './adapters/instagram.js';
import { enrichXClip, extractXStatusId } from './adapters/x.js';
import { fetchFromApifyIfConfigured } from './adapters/apify.js';

// Load .env if present (no external dependency required)
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const forceSync = process.argv.includes('--force');
const generatedPath = path.resolve('src/config/clips.generated.json');
const cachePath = path.resolve('scripts/.oembed-cache.json');
const todayIso = '2026-10-31';

function canonicalKey(clip) {
  const url = (clip.url || '').trim();
  if (!url) return '';
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch) return `youtube:${ytMatch[1]}`;
  const ttId = extractTikTokVideoId(url);
  if (ttId) return `tiktok:${ttId}`;
  const igCode = extractInstagramCode(url);
  if (igCode) return `instagram:${igCode}`;
  const xId = extractXStatusId(url);
  if (xId) return `x:${xId}`;
  return url.toLowerCase().replace(/\/+$/, '');
}

async function enrichSingleClip(rawClip, sourceTag, oembedCache) {
  const clip = { ...rawClip, source: sourceTag };
  const p = (clip.platform || '').toLowerCase();
  if (p === 'tiktok') return enrichTikTokClip(clip, oembedCache, { force: forceSync, todayIso });
  if (p === 'instagram') return enrichInstagramClip(clip, oembedCache, { force: forceSync, todayIso });
  if (p === 'x' || p === 'twitter') return enrichXClip(clip, oembedCache, { force: forceSync, todayIso });
  if (p === 'youtube') {
    const ytMatch = clip.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    const vid = ytMatch ? ytMatch[1] : 'unknown';
    return {
      id: `yt-${vid}`,
      platform: 'youtube',
      url: clip.url,
      title: clip.title || 'YouTube Short',
      account: clip.account || '@MCG_live',
      thumbnail: clip.thumbnail || (vid !== 'unknown' ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : null),
      views: typeof clip.views === 'number' ? clip.views : null,
      viewsAsOf: clip.viewsAsOf || todayIso,
      source: sourceTag
    };
  }
  return {
    id: clip.id || `clip-${Date.now()}`,
    platform: p || 'video',
    url: clip.url,
    title: clip.title || 'Clip',
    account: clip.account || '',
    thumbnail: clip.thumbnail || null,
    views: typeof clip.views === 'number' ? clip.views : null,
    viewsAsOf: clip.viewsAsOf || todayIso,
    source: sourceTag
  };
}

async function main() {
  console.log(`\n🔄 Starting Clippng.in clip sync ${forceSync ? '(FORCE MODE - ignoring cache)' : ''}...`);
  const warnings = [];

  // Load previous generated file if available (for fallback when a source fails)
  let previousData = null;
  if (!forceSync && fs.existsSync(generatedPath)) {
    try {
      previousData = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
    } catch (_) {
      previousData = null;
    }
  }

  // Load oEmbed cache
  let oembedCache = {};
  if (!forceSync && fs.existsSync(cachePath)) {
    try {
      oembedCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (_) {
      oembedCache = {};
    }
  }

  // 1. Pinned clips (always shown first, in exact order given)
  const validPinnedInput = (pinnedClips || []).filter(c => c && c.url && c.url.trim() !== '');
  const resolvedPinned = [];
  for (const item of validPinnedInput) {
    const enriched = await enrichSingleClip(item, 'pinned', oembedCache);
    oembedCache[enriched.url] = enriched;
    resolvedPinned.push(enriched);
  }

  // 2. Watchlist clips (skip empty TODO slots)
  const allWatchlistInput = watchlistClips || [];
  const emptyTodoSlots = allWatchlistInput.filter(c => !c || !c.url || c.url.trim() === '');
  if (emptyTodoSlots.length > 0) {
    for (const slot of emptyTodoSlots) {
      const msg = `Skipped empty watchlist TODO slot for ${slot.account || slot.platform}: "${slot.title}"`;
      warnings.push(msg);
      console.log(`  ℹ️  ${msg}`);
    }
  }

  const validWatchlistInput = allWatchlistInput.filter(c => c && c.url && c.url.trim() !== '');
  const resolvedWatchlist = [];
  for (const item of validWatchlistInput) {
    const enriched = await enrichSingleClip(item, 'watchlist', oembedCache);
    oembedCache[enriched.url] = enriched;
    resolvedWatchlist.push(enriched);
  }

  // 3. Auto-fetched clips from sources.js
  const resolvedAuto = [];
  for (const src of clipSources) {
    if (src.platform === 'youtube') {
      try {
        console.log(`  📡 Fetching YouTube clips for ${src.handle}...`);
        const ytClips = await fetchYouTubeClips(src, { todayIso });
        console.log(`  ✅ Found ${ytClips.length} short-form YouTube clips from ${src.handle}`);
        resolvedAuto.push(...ytClips);
      } catch (err) {
        const warnMsg = `YouTube sync failed for ${src.handle}: ${err.message}. Using previous/fallback data.`;
        warnings.push(warnMsg);
        console.warn(`  ⚠️  ${warnMsg}`);
        if (previousData?.clips) {
          const prevForSource = previousData.clips.filter(
            c => c.source === 'auto' && c.platform === 'youtube' && c.account === src.handle
          );
          resolvedAuto.push(...prevForSource);
        }
      }
    } else {
      // TikTok, Instagram, X: check optional Apify stub if APIFY_TOKEN is set; otherwise log watchlist notice
      try {
        const apifyRes = await fetchFromApifyIfConfigured(src, { todayIso });
        if (apifyRes.enabled && apifyRes.clips.length > 0) {
          console.log(`  ✅ Fetched ${apifyRes.clips.length} clips for ${src.handle} via Apify`);
          resolvedAuto.push(...apifyRes.clips);
        } else {
          const matchingWatchlistCount = resolvedWatchlist.filter(
            w => w.account?.toLowerCase() === src.handle.toLowerCase()
          ).length;
          const infoMsg = `${src.platform.toUpperCase()} (${src.handle}): using watchlist + public oEmbed (${matchingWatchlistCount} active clip(s) in watchlist).`;
          console.log(`  ℹ️  ${infoMsg}`);
          if (matchingWatchlistCount === 0) {
            warnings.push(`No active watchlist URLs found for ${src.handle} (${src.platform}). Paste clip URLs in src/config/watchlist.js.`);
          }
        }
      } catch (err) {
        const warnMsg = `Optional adapter failed for ${src.handle} (${src.platform}): ${err.message}`;
        warnings.push(warnMsg);
        console.warn(`  ⚠️  ${warnMsg}`);
      }
    }
  }

  // Save updated oEmbed cache
  try {
    fs.writeFileSync(cachePath, JSON.stringify(oembedCache, null, 2), 'utf8');
  } catch (_) {}

  // 4. Merge & Deduplicate:
  // Priority: pinned > watchlist > auto
  const seenKeys = new Map();

  for (const clip of resolvedPinned) {
    const key = canonicalKey(clip);
    if (!key) continue;
    seenKeys.set(key, clip);
  }

  const nonPinnedMap = new Map();
  for (const clip of [...resolvedWatchlist, ...resolvedAuto]) {
    const key = canonicalKey(clip);
    if (!key || seenKeys.has(key)) continue;
    if (!nonPinnedMap.has(key)) {
      nonPinnedMap.set(key, clip);
    } else {
      const existing = nonPinnedMap.get(key);
      if (typeof clip.views === 'number' && (existing.views === null || clip.views > existing.views)) {
        existing.views = clip.views;
        existing.viewsAsOf = clip.viewsAsOf;
      }
      if (!existing.thumbnail && clip.thumbnail) {
        existing.thumbnail = clip.thumbnail;
      }
    }
  }

  // 5. Sort non-pinned clips:
  // First by `platformOrder` (so YouTube, Instagram, and X come before TikTok),
  // and within each platform, by verified `views` descending (null views last).
  const platformOrder = syncSettings.platformOrder || ['youtube', 'instagram', 'x', 'tiktok'];
  const getPlatformRank = (p) => {
    const idx = platformOrder.indexOf((p || '').toLowerCase());
    return idx === -1 ? 99 : idx;
  };

  // Also check if Instagram or X clips exist in nonPinnedMap; if so, dynamically adjust YouTube cap
  // so 4 YouTube + 2 Insta/X + 2 TikTok fit cleanly into maxClips (8), or 6 YouTube + 2 TikTok when IG/X have 0 active clips.
  const allNonPinned = Array.from(nonPinnedMap.values());
  const activeIgOrXCount = allNonPinned.filter(c => ['instagram', 'x'].includes((c.platform || '').toLowerCase())).length;

  const maxClips = syncSettings.maxClips || 8;
  const defaultCap = syncSettings.perPlatformCap || 4;
  const platformCaps = { ...(syncSettings.platformCaps || {}) };
  if (activeIgOrXCount > 0 && platformCaps.youtube > 4) {
    platformCaps.youtube = Math.max(2, 6 - Math.min(4, activeIgOrXCount));
  }

  // Group and pick top clips per platform, ensuring diversity across accounts within a platform (e.g. @pumpfunplug + @pump.moments)
  const byPlatform = {};
  for (const clip of allNonPinned) {
    const p = (clip.platform || '').toLowerCase();
    if (!byPlatform[p]) byPlatform[p] = [];
    byPlatform[p].push(clip);
  }

  for (const p of Object.keys(byPlatform)) {
    byPlatform[p].sort((a, b) => {
      const aHas = typeof a.views === 'number';
      const bHas = typeof b.views === 'number';
      if (aHas && bHas) return b.views - a.views;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });
  }

  const orderedPlatforms = Object.keys(byPlatform).sort((a, b) => getPlatformRank(a) - getPlatformRank(b));
  const selectedNonPinned = [];

  for (const p of orderedPlatforms) {
    const cap = platformCaps[p] ?? defaultCap;
    const pool = byPlatform[p];
    if (p === 'tiktok' && cap >= 2) {
      // Pick the highest-viewed clip from each distinct TikTok account first so both @pumpfunplug and @pump.moments are represented
      const picked = [];
      const usedAccounts = new Set();
      for (const clip of pool) {
        if (picked.length >= cap) break;
        if (!usedAccounts.has(clip.account)) {
          usedAccounts.add(clip.account);
          picked.push(clip);
        }
      }
      for (const clip of pool) {
        if (picked.length >= cap) break;
        if (!picked.includes(clip)) picked.push(clip);
      }
      selectedNonPinned.push(...picked);
    } else {
      selectedNonPinned.push(...pool.slice(0, cap));
    }
  }

  const finalClips = [...Array.from(seenKeys.values()), ...selectedNonPinned].slice(0, maxClips);

  // Fallback if everything failed and finalClips is empty
  if (finalClips.length === 0) {
    if (previousData?.clips?.length > 0) {
      warnings.push('All sources returned 0 clips; preserved previous clips.generated.json.');
      finalClips.push(...previousData.clips);
    } else {
      warnings.push('All sources returned 0 clips and no previous generated file existed; falling back to src/config/clips.js.');
      for (const fallback of (fallbackManualClips || []).filter(c => c && c.url && c.url.trim() !== '')) {
        finalClips.push(await enrichSingleClip(fallback, 'watchlist', oembedCache));
      }
    }
  }

  // Compute source counts and platform counts for meta block
  const countsBySource = { pinned: 0, watchlist: 0, auto: 0 };
  const countsByPlatform = {};
  for (const c of finalClips) {
    countsBySource[c.source] = (countsBySource[c.source] || 0) + 1;
    countsByPlatform[c.platform] = (countsByPlatform[c.platform] || 0) + 1;
  }

  const output = {
    meta: {
      generatedAt: new Date().toISOString().split('T')[0],
      viewsAsOf: todayIso,
      totalClips: finalClips.length,
      countsBySource,
      countsByPlatform,
      warnings
    },
    clips: finalClips
  };

  fs.writeFileSync(generatedPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n✨ Sync complete! Wrote ${finalClips.length} verified clips to src/config/clips.generated.json`);
  console.log(`   Order: First ${countsByPlatform.youtube || 0} YouTube, then ${countsByPlatform.tiktok || 0} TikTok`);
  console.log(`   Breakdown by platform:`, countsByPlatform);
  console.log(`   Breakdown by source:`, countsBySource);
}

main().catch(err => {
  console.error('⚠️ Sync script encountered an unexpected error, continuing build safely:', err.message);
  process.exit(0);
});
