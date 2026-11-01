import React, { useEffect, useMemo, useState } from 'react';
import { brandsSection, clippedChannels } from '../config/brands';
import { getChannelsWithStats } from '../config/channels';
import { getActiveClips, getSyncMeta, formatViewCount } from '../config/clipData';
import { siteConfig } from '../config/siteConfig';
import { PlatformIcon, detectPlatform } from './Clips';
import MagicBento from './effects/MagicBento';
import ScrollStack, { ScrollStackItem } from './effects/ScrollStack';
import { resolveCssColorToHex } from './LightfallBackground';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Brands = () => {
  const clips = getActiveClips();
  const meta = getSyncMeta();
  const channels = useMemo(() => getChannelsWithStats(), []);

  const bentoCfg = siteConfig.effects?.magicBento || {};
  const stackCfg = siteConfig.effects?.scrollStack || {};

  const [isMobile, setIsMobile] = useState(false);
  const [accentHex, setAccentHex] = useState(() =>
    resolveCssColorToHex(siteConfig.accentColor, '#ff4d1f')
  );
  // Track any clip thumbnail URLs that fail to load (e.g. if TikTok CDN is blocked in visitor's country)
  const [failedThumbIds, setFailedThumbIds] = useState({});

  useEffect(() => {
    const updateEnv = () => {
      setIsMobile(window.innerWidth < 768);
      const cssAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
      setAccentHex(resolveCssColorToHex(cssAccent || siteConfig.accentColor, '#ff4d1f'));
    };
    updateEnv();
    window.addEventListener('resize', updateEnv, { passive: true });
    return () => window.removeEventListener('resize', updateEnv);
  }, []);

  // Showcase top 4 clips without showing individual clip view counts
  const topFourClips = useMemo(() => clips.slice(0, 4), [clips]);

  // Pre-verify topFourClips thumbnails in the browser so if a platform thumbnail is missing or blocked,
  // MagicBento cleanly falls back to the `content` placeholder tile with the platform icon.
  useEffect(() => {
    let cancelled = false;
    topFourClips.forEach(clip => {
      const key = clip.id || clip.url;
      if (!clip.thumbnail) {
        setFailedThumbIds(prev => (prev[key] ? prev : { ...prev, [key]: true }));
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled && img.naturalWidth === 0) {
          setFailedThumbIds(prev => ({ ...prev, [key]: true }));
        }
      };
      img.onerror = () => {
        if (!cancelled) {
          setFailedThumbIds(prev => ({ ...prev, [key]: true }));
        }
      };
      img.src = clip.thumbnail;
    });
    return () => {
      cancelled = true;
    };
  }, [topFourClips]);

  // BarChart data plotted from the channel totals (in millions) so no low clip view counts appear
  const chartData = useMemo(
    () =>
      channels.map(ch => ({
        name: ch.name,
        views: ch.totalViews,
        viewsDisplay: ch.viewsDisplay,
        clipsDisplay: ch.clipsDisplay
      })),
    [channels]
  );

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Build MagicBento items with showcase totals (100M+ views, 5000+ clips) and zero individual clip view counts
  const bentoItems = useMemo(() => {
    const items = [
      // Row 1, Tile 1: Total views on clips (colSpan 2)
      {
        id: 'kpi-total-views',
        colSpan: 2,
        rowSpan: 1,
        content: (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                Total Views on Clips
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                As of {meta.viewsAsOf}
              </span>
            </div>
            <div className="font-headline text-3xl sm:text-4xl text-accent tracking-tight mt-2">
              {meta.totalViewsDisplay}
            </div>
          </div>
        )
      },
      // Row 1, Tile 2: Total clips (colSpan 1)
      {
        id: 'kpi-total-clips',
        colSpan: 1,
        rowSpan: 1,
        content: (
          <div className="flex flex-col justify-between h-full">
            <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
              Total Clips
            </span>
            <div className="font-headline text-3xl sm:text-4xl text-white mt-2">
              {meta.totalClipsDisplay}
            </div>
          </div>
        )
      },
      // Row 1, Tile 3: Platforms (colSpan 1)
      {
        id: 'kpi-platforms',
        colSpan: 1,
        rowSpan: 1,
        content: (
          <div className="flex flex-col justify-between h-full">
            <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
              Platforms
            </span>
            <div>
              <div className="flex items-center gap-2 text-accent mb-1.5">
                {meta.uniquePlatforms.map(p => (
                  <PlatformIcon key={p} platform={p} size={15} />
                ))}
              </div>
              <div className="font-headline text-sm sm:text-base text-white uppercase leading-tight">
                {meta.uniquePlatforms.join(' · ')}
              </div>
            </div>
          </div>
        )
      }
    ];

    // Row 2: Wide Channel Views BarChart card (colSpan 4, rowSpan 2)
    if (chartData.length > 0) {
      items.push({
        id: 'chart-views-per-channel',
        colSpan: 4,
        rowSpan: 2,
        content: (
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="font-mono text-xs uppercase text-gray-300 tracking-widest">
                Total Views on Clips by Channel
              </h4>
              <span className="text-[11px] font-mono text-gray-400">
                As of {meta.viewsAsOf}
              </span>
            </div>
            <div className="flex-1 min-h-[180px] w-full bg-bg/70 rounded-xl p-3 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => formatViewCount(val) || val}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: '#141414',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                    formatter={(value, _name, props) => [
                      `${props?.payload?.viewsDisplay || Number(value).toLocaleString()} views (${props?.payload?.clipsDisplay || ''} clips)`,
                      'Channel Total'
                    ]}
                  />
                  <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? 'var(--accent-color)' : '#fb923c'}
                        fillOpacity={index < 2 ? 1 : 0.78}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      });
    }

    // Row 3: 4 Clip showcase cards as vertical tiles (no individual clip view count shown)
    topFourClips.forEach(clip => {
      const key = clip.id || clip.url;
      const platform = detectPlatform(clip);
      const hasWorkingThumb = Boolean(clip.thumbnail && !failedThumbIds[key]);

      if (hasWorkingThumb) {
        items.push({
          id: `top-clip-${key}`,
          colSpan: 1,
          rowSpan: 2,
          image: clip.thumbnail,
          icon: <PlatformIcon platform={platform} size={14} />,
          label: platform.toUpperCase(),
          title: clip.account,
          description: clip.title,
          href: clip.url,
          target: '_blank',
          rel: 'noopener noreferrer'
        });
      } else {
        // Fallback placeholder tile when thumbnail is missing or blocked by network
        items.push({
          id: `top-clip-${key}`,
          colSpan: 1,
          rowSpan: 2,
          href: clip.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          title: `${clip.account} — ${clip.title}`,
          content: (
            <div className="flex flex-col justify-between h-full w-full">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-bg/90 border border-white/10 flex items-center justify-center text-accent">
                  <PlatformIcon platform={platform} size={15} />
                </span>
                <ExternalLink size={14} className="text-gray-400" />
              </div>

              <div className="my-auto flex flex-col items-center justify-center text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/80 mb-2.5">
                  <PlatformIcon platform={platform} size={24} />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  {platform}
                </span>
              </div>

              <div className="flex flex-col text-left">
                <span className="font-bold text-sm text-white truncate">{clip.account}</span>
                <span className="font-mono text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                  {clip.title}
                </span>
              </div>
            </div>
          )
        });
      }
    });

    return items;
  }, [meta, chartData, topFourClips, failedThumbIds]);

  // Override MagicBento's default purple-ish dark surface variables so cards match the site's #171717 / #0a0a0a palette
  const bentoCustomVars = {
    '--mb-surface': 'linear-gradient(180deg, #171717 0%, #111111 100%)',
    '--mb-edge': 'rgba(255, 255, 255, 0.1)',
    '--mb-highlight': 'rgba(255, 255, 255, 0.06)',
    '--mb-tile': 'linear-gradient(180deg, #242424 0%, #181818 100%)',
    '--mb-tile-edge': 'rgba(255, 255, 255, 0.08)',
    '--mb-well': 'rgba(10, 10, 10, 0.65)',
    '--mb-well-edge': 'rgba(255, 255, 255, 0.07)',
    '--mb-focus': 'var(--accent-color)'
  };

  return (
    <section id="brands" className="py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-20">
        {/* Top Split */}
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-16 items-start">
          {/* Left: Copy, CTAs, and Showcase Stats */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-28">
            <span className="font-mono text-accent text-sm tracking-widest uppercase mb-4 block">
              {brandsSection.eyebrow}
            </span>
            <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl uppercase leading-tight mb-6">
              {brandsSection.headline}
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              {brandsSection.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={scrollToContact}
                className="bg-accent text-bg px-8 py-3.5 rounded-full font-bold hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Work with us
              </button>
              <button
                onClick={scrollToContact}
                className="bg-surface/80 border border-white/20 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Talk to us
              </button>
            </div>

            {/* Showcase Stat Strip */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              <div className="flex flex-col">
                <span className="font-headline text-2xl md:text-3xl text-accent">
                  {meta.totalViewsDisplay}
                </span>
                <span className="text-xs text-gray-500 uppercase font-mono">
                  Total Views on Clips
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-2xl md:text-3xl">{meta.totalClipsDisplay}</span>
                <span className="text-xs text-gray-500 uppercase font-mono">Total Clips</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-2xl md:text-3xl">{clippedChannels.length}</span>
                <span className="text-xs text-gray-500 uppercase font-mono">Channels Clipped</span>
              </div>
            </div>
          </div>

          {/* Right: MagicBento Grid */}
          <div className="w-full lg:w-7/12">
            <MagicBento
              items={bentoItems}
              theme={bentoCfg.theme || 'dark'}
              glowColor={accentHex}
              columns={bentoCfg.columns ?? 4}
              rowHeight={bentoCfg.rowHeight ?? 150}
              gap={bentoCfg.gap ?? 12}
              radius={bentoCfg.radius ?? 20}
              enableBorderGlow={bentoCfg.enableBorderGlow !== false}
              enableSpotlight={bentoCfg.enableSpotlight !== false}
              spotlightRadius={bentoCfg.spotlightRadius ?? 300}
              clickEffect={bentoCfg.clickEffect !== false}
              intro={bentoCfg.intro !== false}
              textAutoHide={bentoCfg.textAutoHide !== false}
              enableStars={Boolean(bentoCfg.enableStars)}
              particleCount={bentoCfg.particleCount ?? 24}
              enableTilt={Boolean(bentoCfg.enableTilt)}
              enableMagnetism={Boolean(bentoCfg.enableMagnetism)}
              disableAnimations={Boolean(bentoCfg.disableAnimations)}
              style={bentoCustomVars}
            />

            {/* Dynamic current date line under the bento dashboard */}
            <p className="text-right font-mono text-xs text-gray-500 mt-3">
              Updated as of {meta.viewsAsOf}
            </p>
          </div>
        </div>

        {/* Channels We've Clipped For — ScrollStack */}
        <div className="pt-12 border-t border-white/10">
          <div className="text-center mb-10">
            <h3 className="font-mono text-sm text-accent uppercase tracking-widest mb-2">
              {brandsSection.channelsHeading}
            </h3>
            {brandsSection.channelsSubnote && (
              <p className="text-xs text-gray-500 font-mono max-w-xl mx-auto">
                {brandsSection.channelsSubnote}
              </p>
            )}
          </div>

          <ScrollStack
            useWindowScroll={stackCfg.useWindowScroll !== false}
            smoothScroll={Boolean(stackCfg.smoothScroll)}
            snap={Boolean(stackCfg.snap)}
            stackPosition={stackCfg.stackPosition || '112px'}
            itemDistance={stackCfg.itemDistance ?? 100}
            itemStackDistance={
              isMobile
                ? (stackCfg.itemStackDistanceMobile ?? 15)
                : (stackCfg.itemStackDistanceDesktop ?? 24)
            }
            itemScale={stackCfg.itemScale ?? 0.05}
            baseScale={stackCfg.baseScale ?? 0.85}
            dimAmount={stackCfg.dimAmount ?? 0.2}
            blurAmount={stackCfg.blurAmount ?? 0}
            tiltAmount={stackCfg.tiltAmount ?? 0}
            rotationAmount={stackCfg.rotationAmount ?? 0}
            holdDistance={stackCfg.holdDistance ?? 200}
            className="max-w-5xl mx-auto"
          >
            {channels.map(channel => {
              const platformListText = (channel.platformLabels || channel.platforms || []).join(', ');

              return (
                <ScrollStackItem
                  key={channel.id}
                  itemClassName="!p-0 !h-[17rem] md:!h-[22rem] !rounded-[28px] overflow-hidden !bg-[#141414] border border-white/10"
                >
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${channel.name} on ${platformListText}`}
                    className="block w-full h-full relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent rounded-[28px] select-none"
                  >
                    {/* 1. Full-bleed Official Channel Banner OR Opaque Branded Fallback */}
                    {channel.bannerImage ? (
                      <div className="absolute inset-0 bg-[#121212]">
                        <img
                          src={channel.bannerImage}
                          alt={channel.bannerAlt || `${channel.name} official channel banner`}
                          className="w-full h-full object-cover object-center opacity-85 group-hover:scale-[1.03] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          backgroundColor: '#141414',
                          backgroundImage:
                            'radial-gradient(circle at 50% 32%, color-mix(in srgb, var(--accent-color) 26%, #141414) 0%, #141414 72%)'
                        }}
                      >
                        {/* Centered Circular Avatar or Initials Badge */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1b1b1b] border-2 border-accent/40 shadow-2xl flex items-center justify-center overflow-hidden -translate-y-6 md:-translate-y-8 group-hover:scale-105 group-hover:border-accent transition-all duration-300">
                          {channel.avatarImage ? (
                            <img
                              src={channel.avatarImage}
                              alt={channel.avatarAlt || `${channel.name} avatar`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="font-headline text-2xl md:text-3xl text-accent tracking-tight">
                              {channel.initials}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. Strong Dark Bottom Gradient Scrim for Crisp Text Contrast */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(10, 10, 10, 0.96) 0%, rgba(10, 10, 10, 0.84) 38%, rgba(10, 10, 10, 0.35) 68%, rgba(10, 10, 10, 0.2) 100%)'
                      }}
                    />

                    {/* 3. Foreground Content Layer */}
                    <div className="relative h-full w-full p-5 sm:p-7 md:p-9 flex flex-col justify-between">
                      {/* Top Row: Handle Badge + Visit Channel CTA */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5">
                          {channel.avatarImage && channel.bannerImage && (
                            <img
                              src={channel.avatarImage}
                              alt={channel.avatarAlt || `${channel.name} avatar`}
                              className="w-5 h-5 rounded-full object-cover border border-white/20"
                              loading="lazy"
                            />
                          )}
                          <span className="font-mono text-[11px] sm:text-xs text-gray-200 truncate max-w-[200px] sm:max-w-xs">
                            {channel.displayHandle}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1.5 bg-black/70 group-hover:bg-accent text-white group-hover:text-bg backdrop-blur-md border border-white/15 group-hover:border-accent rounded-full px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider font-bold transition-all">
                          <span>Visit channel</span>
                          <ArrowUpRight size={14} />
                        </span>
                      </div>

                      {/* Bottom Row: Channel Name & Platform Chips (Left) + Channel Stats (Right) */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
                        <div>
                          {/* Platform Chips */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {(channel.platforms || []).map((plat, pIdx) => (
                              <span
                                key={plat}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-mono uppercase text-gray-200"
                              >
                                <PlatformIcon platform={plat} size={11} />
                                <span>{channel.platformLabels?.[pIdx] || plat}</span>
                              </span>
                            ))}
                          </div>

                          {/* Channel / Brand Name */}
                          <h4 className="font-headline text-3xl sm:text-4xl md:text-5xl uppercase text-white tracking-tight leading-none group-hover:text-accent transition-colors">
                            {channel.name}
                          </h4>
                        </div>

                        {/* Channel Statistics */}
                        <div className="flex items-center gap-6 sm:gap-8 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                          <div className="flex flex-col text-left md:text-right">
                            <span className="font-headline text-xl sm:text-2xl md:text-3xl text-accent leading-tight">
                              {channel.viewsDisplay}
                            </span>
                            <span className="font-mono text-[10px] sm:text-[11px] uppercase text-gray-300 tracking-wider">
                              {channel.viewsLabel}
                            </span>
                          </div>

                          <div className="flex flex-col text-left md:text-right">
                            <span className="font-headline text-xl sm:text-2xl md:text-3xl text-white leading-tight">
                              {channel.clipsDisplay}
                            </span>
                            <span className="font-mono text-[10px] sm:text-[11px] uppercase text-gray-300 tracking-wider">
                              {channel.clipsLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </ScrollStackItem>
              );
            })}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
};

export default Brands;
