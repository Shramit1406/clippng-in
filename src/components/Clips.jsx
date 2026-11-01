import React, { useState } from 'react';
import { clipsSection } from '../config/clips';
import { getActiveClips, getSyncMeta, formatViewCount } from '../config/clipData';
import { ExternalLink, ChevronLeft, ChevronRight, Volume2, Play } from 'lucide-react';
import { FaTiktok, FaYoutube, FaInstagram, FaTwitter } from 'react-icons/fa';

// Auto-detect platform from URL or fallback to clip.platform
export function detectPlatform(clip) {
  const url = (clip?.url || '').toLowerCase();
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('x.com') || url.includes('twitter.com')) return 'x';
  if (url.includes('threads.net') || url.includes('threads.com')) return 'threads';
  return (clip?.platform || 'video').toLowerCase();
}

export function PlatformIcon({ platform, size = 16 }) {
  switch ((platform || '').toLowerCase()) {
    case 'tiktok':
      return <FaTiktok size={size} />;
    case 'youtube':
      return <FaYoutube size={size} />;
    case 'instagram':
      return <FaInstagram size={size} />;
    case 'x':
    case 'twitter':
      return <FaTwitter size={size} />;
    default:
      return <Play size={size} />;
  }
}

const Clips = () => {
  const clips = getActiveClips();
  const meta = getSyncMeta();
  const [activeIndex, setActiveIndex] = useState(0);

  if (clips.length === 0) return null;

  const safeIndex = activeIndex >= clips.length ? 0 : activeIndex;
  const activeClip = clips[safeIndex];
  const prevClip = clips[(safeIndex - 1 + clips.length) % clips.length];
  const nextClip = clips[(safeIndex + 1) % clips.length];

  const handlePrev = () => {
    setActiveIndex((safeIndex - 1 + clips.length) % clips.length);
  };

  const handleNext = () => {
    setActiveIndex((safeIndex + 1) % clips.length);
  };

  // Browser autoplay/loop note:
  // Browsers only autoplay muted media, and TikTok/Instagram/X/Threads embeds cannot be
  // force-looped reliably from outside their cross-origin iframe.
  // Only the active clip's iframe is mounted (lazy-loaded) for performance.
  const renderClipEmbed = (clip) => {
    const platform = detectPlatform(clip);

    if (platform === 'video') {
      return (
        <video
          key={clip.url}
          src={clip.url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          controls
        />
      );
    }

    if (platform === 'youtube') {
      const match = clip.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      const videoId = match ? match[1] : '';
      if (videoId) {
        return (
          <iframe
            key={clip.url}
            className="w-full h-full object-cover"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={clip.title}
          />
        );
      }
    }

    if (platform === 'tiktok') {
      const match = clip.url.match(/\/video\/(\d+)/);
      const videoId = match ? match[1] : '';
      if (videoId) {
        return (
          <iframe
            key={clip.url}
            className="w-full h-full bg-black"
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={clip.title}
          />
        );
      }
    }

    if (platform === 'instagram') {
      const match = clip.url.match(/\/(?:reel|p|tv)\/([\w-]+)/);
      const code = match ? match[1] : '';
      if (code) {
        return (
          <iframe
            key={clip.url}
            className="w-full h-full bg-black"
            src={`https://www.instagram.com/reel/${code}/embed`}
            frameBorder="0"
            allowFullScreen
            loading="lazy"
            title={clip.title}
          />
        );
      }
    }

    if (platform === 'x') {
      const match = clip.url.match(/\/status\/(\d+)/);
      const statusId = match ? match[1] : '';
      if (statusId) {
        return (
          <iframe
            key={clip.url}
            className="w-full h-full bg-black"
            src={`https://platform.twitter.com/embed/Tweet.html?id=${statusId}&theme=dark&dnt=true`}
            frameBorder="0"
            allowFullScreen
            loading="lazy"
            title={clip.title}
          />
        );
      }
    }

    // Graceful fallback if an embed cannot be constructed
    return (
      <div className="w-full h-full bg-surface-light flex flex-col items-center justify-center p-6 text-center">
        {clip.thumbnail && (
          <img
            src={clip.thumbnail}
            alt={clip.title}
            className="w-32 h-48 object-cover rounded-xl mb-4 border border-white/10"
            loading="lazy"
          />
        )}
        <p className="text-sm text-white font-semibold mb-2 line-clamp-2">{clip.title}</p>
        <p className="text-xs text-gray-400 mb-6">{clip.account}</p>
        <a
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-accent text-bg px-5 py-2.5 rounded-full font-bold text-sm hover:brightness-110 transition-all"
        >
          Open on {platform} <ExternalLink size={15} />
        </a>
      </div>
    );
  };

  return (
    <section id="clips" className="py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left Side: Copy, CTA, and Real Computed Stats */}
        <div className="w-full lg:w-5/12 flex flex-col items-start">
          <span className="font-mono text-accent text-sm tracking-widest uppercase mb-4">
            {clipsSection.eyebrow}
          </span>
          <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl uppercase leading-tight mb-6">
            {clipsSection.header}
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-md leading-relaxed">
            {clipsSection.description}
          </p>

          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-accent text-bg px-8 py-4 rounded-full font-bold hover:brightness-110 transition-all mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Hire us to clip
          </button>

          {/* Real Computed Stat Strip (No hardcoded numbers) */}
          <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 w-full">
            <div className="flex flex-col">
              <span className="font-headline text-2xl md:text-3xl">{meta.totalClips}</span>
              <span className="text-xs text-gray-500 uppercase font-mono">Featured Clips</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-2xl md:text-3xl">{formatViewCount(meta.totalViews)}</span>
              <span className="text-xs text-gray-500 uppercase font-mono">Combined Views</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-2xl md:text-3xl">{meta.uniquePlatforms.length}</span>
              <span className="text-xs text-gray-500 uppercase font-mono">Platforms</span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-gray-500 mt-3">
            Verified clip views as of {meta.viewsAsOf}
          </p>
        </div>

        {/* Right Side: Stacked Phone Frame Carousel */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center relative">
          <div className="relative flex items-center justify-center w-full py-4">
            {/* Left Tilted Preview Phone (Desktop) */}
            {clips.length > 1 && (
              <button
                onClick={handlePrev}
                aria-label="Previous clip"
                className="hidden sm:flex flex-col justify-end relative w-[210px] h-[420px] bg-surface rounded-[2.5rem] border-4 border-white/10 overflow-hidden -mr-12 -rotate-6 scale-90 opacity-40 hover:opacity-65 transition-all blur-[1px] hover:blur-0 focus:outline-none"
              >
                {prevClip.thumbnail && (
                  <img
                    src={prevClip.thumbnail}
                    alt={prevClip.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 p-4 text-left">
                  <span className="text-[10px] font-mono uppercase text-accent block">{prevClip.account}</span>
                  <span className="text-xs font-bold text-white line-clamp-2">{prevClip.title}</span>
                </div>
              </button>
            )}

            {/* Center Active Phone Frame */}
            <div className="relative w-[300px] sm:w-[320px] h-[590px] sm:h-[620px] bg-black rounded-[3rem] border-[8px] border-surface shadow-2xl overflow-hidden z-20 flex-shrink-0 flex flex-col">
              {/* Phone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-surface rounded-b-xl w-32 mx-auto z-30 pointer-events-none" />

              {/* Top Overlay: Tap for sound / Platform & Views badge */}
              <div className="absolute top-7 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-white">
                  <PlatformIcon platform={detectPlatform(activeClip)} size={12} />
                  <span>{activeClip.account}</span>
                  {typeof activeClip.views === 'number' && (
                    <span className="text-accent font-bold ml-1">• {formatViewCount(activeClip.views)} views</span>
                  )}
                </div>
                <div
                  className="bg-black/75 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-mono text-gray-300 flex items-center gap-1 border border-white/10"
                  title="Tap inside video player for sound or controls"
                >
                  <Volume2 size={12} /> Tap for sound
                </div>
              </div>

              {/* Active Clip Embed (Lazy-loaded: only active clip iframe is mounted) */}
              <div className="w-full flex-1 relative bg-surface-light pt-6">
                {renderClipEmbed(activeClip)}
              </div>

              {/* Bottom bar inside phone with direct external link fallback */}
              <div className="bg-surface px-4 py-3 border-t border-white/10 flex items-center justify-between gap-2 z-30">
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-bold text-white truncate" title={activeClip.title}>
                    {activeClip.title}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400">
                    {typeof activeClip.views === 'number'
                      ? `${activeClip.views.toLocaleString()} views (as of ${activeClip.viewsAsOf})`
                      : activeClip.account}
                  </p>
                </div>
                <a
                  href={activeClip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-mono uppercase text-accent hover:underline px-2 py-1 rounded"
                  aria-label={`Open ${activeClip.title} on ${detectPlatform(activeClip)}`}
                >
                  Open <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Right Tilted Preview Phone (Desktop) */}
            {clips.length > 1 && (
              <button
                onClick={handleNext}
                aria-label="Next clip"
                className="hidden sm:flex flex-col justify-end relative w-[210px] h-[420px] bg-surface rounded-[2.5rem] border-4 border-white/10 overflow-hidden -ml-12 rotate-6 scale-90 opacity-40 hover:opacity-65 transition-all blur-[1px] hover:blur-0 focus:outline-none"
              >
                {nextClip.thumbnail && (
                  <img
                    src={nextClip.thumbnail}
                    alt={nextClip.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 p-4 text-left">
                  <span className="text-[10px] font-mono uppercase text-accent block">{nextClip.account}</span>
                  <span className="text-xs font-bold text-white line-clamp-2">{nextClip.title}</span>
                </div>
              </button>
            )}
          </div>

          {/* Prev / Next Arrows + Platform Icon Switcher Buttons */}
          <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
            <button
              onClick={handlePrev}
              aria-label="Previous clip"
              className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white hover:border-accent hover:text-accent transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex flex-wrap justify-center gap-2.5">
              {clips.map((clip, index) => {
                const p = detectPlatform(clip);
                const isActive = index === safeIndex;
                return (
                  <button
                    key={clip.id || index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                      isActive
                        ? 'bg-accent text-bg border-accent scale-110 shadow-lg'
                        : 'bg-surface text-gray-400 border-white/10 hover:text-white hover:border-white/30'
                    }`}
                    aria-label={`Play clip ${index + 1}: ${clip.title} (${p})`}
                    title={`${clip.account}: ${clip.title}`}
                  >
                    <PlatformIcon platform={p} size={15} />
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next clip"
              className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white hover:border-accent hover:text-accent transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clips;
