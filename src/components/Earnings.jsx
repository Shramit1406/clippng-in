import React, { useEffect, useRef, useState } from 'react';
import { earningsConfig } from '../config/earnings';
import { siteConfig } from '../config/siteConfig';
import WakeSlider from './effects/WakeSlider';
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

const platformIcons = {
  TikTok: <FaTiktok size={14} />,
  Reels: <FaInstagram size={14} />,
  Shorts: <FaYoutube size={14} />,
  X: <FaTwitter size={14} />
};

/**
 * Smoothly animates a number when its target value changes (while respecting prefers-reduced-motion).
 */
function useAnimatedNumber(targetValue, durationMs = 180) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const currentRef = useRef(targetValue);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced || currentRef.current === targetValue) {
      currentRef.current = targetValue;
      setDisplayValue(targetValue);
      return;
    }

    const startValue = currentRef.current;
    const diff = targetValue - startValue;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(startValue + diff * eased);
      currentRef.current = next;
      setDisplayValue(next);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [targetValue, durationMs]);

  return displayValue;
}

const Earnings = ({ onSelectEstimate }) => {
  const [platform, setPlatform] = useState('Shorts');
  const [region, setRegion] = useState('USA/Canada');
  const [viewsIdx, setViewsIdx] = useState(4); // Default 1M (index 4)
  const [clipsPerMonth, setClipsPerMonth] = useState(15);
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const sliderCfg = siteConfig.effects?.wakeSlider || {};

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const platforms = Object.keys(earningsConfig.ratePer100kViews);
  const regions = Object.keys(earningsConfig.ratePer100kViews['Shorts']);

  const safeViewsIdx = Math.max(
    0,
    Math.min(earningsConfig.viewsSliderOptions.length - 1, Math.round(viewsIdx))
  );
  const viewsPerClip = earningsConfig.viewsSliderOptions[safeViewsIdx].value;
  const viewsLabel = earningsConfig.viewsSliderOptions[safeViewsIdx].label;

  // Calculation from rate table in src/config/earnings.js
  const rate = earningsConfig.ratePer100kViews[platform]?.[region] || 0;
  const earningsPerClip = (viewsPerClip / 100000) * rate;
  const monthlyTotal = earningsPerClip * clipsPerMonth;

  const lowEstimate = Math.round(monthlyTotal * (1 - (earningsConfig.rangeVariance || 0.3)));
  const highEstimate = Math.round(monthlyTotal * (1 + (earningsConfig.rangeVariance || 0.3)));

  // Smooth count-up values for the big headline display while dragging
  const animatedLow = useAnimatedNumber(lowEstimate);
  const animatedHigh = useAnimatedNumber(highEstimate);
  const animatedMid = useAnimatedNumber(Math.round(monthlyTotal));

  // Optional suggested plan based on clipsPerMonth
  const suggestedPlan =
    Array.isArray(earningsConfig.packages) && earningsConfig.packages.length > 0
      ? (earningsConfig.packages.find(pkg => clipsPerMonth <= pkg.maxClips) ||
          earningsConfig.packages[earningsConfig.packages.length - 1])?.name
      : null;

  const summaryText = `${clipsPerMonth} clips · ${viewsLabel} avg views each · ${region} · ${platform}`;
  const exactEstimateDisplay = earningsConfig.showRange
    ? `${earningsConfig.currencySymbol}${lowEstimate.toLocaleString()} – ${earningsConfig.currencySymbol}${highEstimate.toLocaleString()}`
    : `${earningsConfig.currencySymbol}${Math.round(monthlyTotal).toLocaleString()}`;

  const animatedEstimateDisplay = earningsConfig.showRange
    ? `${earningsConfig.currencySymbol}${animatedLow.toLocaleString()} – ${earningsConfig.currencySymbol}${animatedHigh.toLocaleString()}`
    : `${earningsConfig.currencySymbol}${animatedMid.toLocaleString()}`;

  const barCount = isMobile ? (sliderCfg.barsMobile ?? 24) : (sliderCfg.barsDesktop ?? 32);
  const sliderHeight = sliderCfg.height ?? 52;
  const sliderRestHeight = sliderCfg.restHeight ?? 12;
  const sliderGap = sliderCfg.gap ?? 4;
  const sliderTrackColor = sliderCfg.trackColor || '#27272a';
  const sliderCrestColor = sliderCfg.crestColor || '';

  // Build Mailto pre-filled with selected creator parameters
  const buildMailto = () => {
    const subject = encodeURIComponent(`Clip Plan Inquiry (${platform} / ${clipsPerMonth} clips/mo) — ${siteConfig.siteName}`);
    const body = encodeURIComponent(
      `Hi ${siteConfig.siteName} team,\n\nI used the Earning Estimator on your site and would love to discuss a clipping plan:\n\n` +
      `- Platform: ${platform}\n` +
      `- Primary Audience Region: ${region}\n` +
      `- Avg Views per Clip: ${viewsLabel} (${viewsPerClip.toLocaleString()})\n` +
      `- Clips per Month: ${clipsPerMonth}\n` +
      (suggestedPlan ? `- Suggested Tier: ${suggestedPlan}\n` : '') +
      `- Estimated Monthly Range: ${exactEstimateDisplay}/mo (at ${earningsConfig.currencySymbol}${rate}/100K views)\n\n` +
      `My channel link:\n`
    );
    return `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`;
  };

  const handleGetPlanClick = () => {
    if (onSelectEstimate) {
      onSelectEstimate({
        platform,
        region,
        viewsLabel,
        clipsPerMonth,
        estimateDisplay: exactEstimateDisplay,
        summaryText,
        mailtoUrl: buildMailto()
      });
    }
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="earnings" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-accent text-sm tracking-widest uppercase mb-3 block">
            CREATOR CALCULATOR
          </span>
          <h2 className="font-headline text-4xl md:text-5xl uppercase mb-4">
            What could your clips earn you?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Model potential monthly creator payouts based on your clip volume, average views, and primary audience region.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Creator Controls */}
          <div className="w-full lg:w-1/2 bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* 1. Platform Selector */}
            <div className="mb-8">
              <label className="font-mono text-xs uppercase text-gray-400 tracking-widest mb-3 block">
                1. Select Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {platforms.map(p => {
                  const isAvailable = earningsConfig.availability[p]?.[region] !== false;
                  const isSelected = platform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (isAvailable) {
                          setPlatform(p);
                          setAvailabilityNote('');
                        }
                      }}
                      disabled={!isAvailable}
                      className={`px-4 py-3 rounded-2xl text-sm font-bold border flex items-center justify-center gap-2 transition-all ${
                        !isAvailable
                          ? 'opacity-30 cursor-not-allowed border-white/5 bg-bg text-gray-500'
                          : isSelected
                          ? 'bg-accent border-accent text-bg shadow-lg'
                          : 'bg-bg border-white/15 text-white hover:border-white/40'
                      }`}
                    >
                      {platformIcons[p]}
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
              {availabilityNote && (
                <p className="text-xs font-mono text-amber-400 mt-2.5">
                  Note: {availabilityNote}
                </p>
              )}
            </div>

            {/* 2. Audience Region Selector */}
            <div className="mb-8">
              <label className="font-mono text-xs uppercase text-gray-400 tracking-widest mb-3 block">
                2. Primary Audience Region
              </label>
              <div className="flex flex-wrap gap-2">
                {regions.map(r => {
                  const isSelected = region === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRegion(r);
                        if (earningsConfig.availability[platform]?.[r] === false) {
                          const noteKey = `${platform}:${r}`;
                          setAvailabilityNote(
                            earningsConfig.unavailabilityNotes?.[noteKey] ||
                              `${platform} is unavailable in ${r}. Switched to Shorts.`
                          );
                          setPlatform('Shorts');
                        } else {
                          setAvailabilityNote('');
                        }
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-white text-bg border-white'
                          : 'bg-bg text-gray-300 border-white/15 hover:border-white/40'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Average Views Per Clip WakeSlider (Index-driven discrete steps) */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-xs uppercase text-gray-400 tracking-widest">
                  3. Average Views per Clip
                </span>
                <span className="font-headline text-lg text-accent">{viewsLabel}</span>
              </div>
              <WakeSlider
                min={0}
                max={earningsConfig.viewsSliderOptions.length - 1}
                step={1}
                value={safeViewsIdx}
                onChange={(nextIdx) => setViewsIdx(Math.round(nextIdx))}
                formatValue={(idx) => {
                  const opt = earningsConfig.viewsSliderOptions[Math.round(idx)];
                  return opt ? `${opt.label} views` : String(idx);
                }}
                bars={barCount}
                height={sliderHeight}
                restHeight={sliderRestHeight}
                gap={sliderGap}
                fillColor="var(--accent-color)"
                trackColor={sliderTrackColor}
                crestColor={sliderCrestColor}
                sensitivity={sliderCfg.sensitivity ?? 1}
                reach={sliderCfg.reach ?? 6}
                skew={sliderCfg.skew ?? 0.6}
                glide={sliderCfg.glide ?? 0.3}
                smoothing={sliderCfg.smoothing ?? 100}
                ariaLabel="Average views per clip"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                {earningsConfig.viewsSliderOptions.map(opt => (
                  <span key={opt.label}>{opt.label}</span>
                ))}
              </div>
            </div>

            {/* 4. Clips Per Month WakeSlider */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-xs uppercase text-gray-400 tracking-widest">
                  4. Clips Posted per Month
                </span>
                <span className="font-headline text-lg text-accent">{clipsPerMonth} clips</span>
              </div>
              <WakeSlider
                min={1}
                max={30}
                step={1}
                value={clipsPerMonth}
                onChange={(nextVal) => setClipsPerMonth(Math.round(nextVal))}
                formatValue={(val) => `${Math.round(val)} clips per month`}
                bars={barCount}
                height={sliderHeight}
                restHeight={sliderRestHeight}
                gap={sliderGap}
                fillColor="var(--accent-color)"
                trackColor={sliderTrackColor}
                crestColor={sliderCrestColor}
                sensitivity={sliderCfg.sensitivity ?? 1}
                reach={sliderCfg.reach ?? 6}
                skew={sliderCfg.skew ?? 0.6}
                glide={sliderCfg.glide ?? 0.3}
                smoothing={sliderCfg.smoothing ?? 100}
                ariaLabel="Clips per month"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                <span>1 clip</span>
                <span>15 clips</span>
                <span>30 clips</span>
              </div>
            </div>
          </div>

          {/* Right: Results Panel (Creator's Point of View) */}
          <div className="w-full lg:w-1/2 bg-accent rounded-3xl p-6 sm:p-8 text-bg flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="z-10">
              <span className="font-mono text-xs sm:text-sm uppercase tracking-widest opacity-85 block mb-2">
                Your estimated monthly earnings
              </span>

              <div className="font-headline text-4xl sm:text-5xl lg:text-6xl mb-2 tracking-tight tabular-nums">
                {animatedEstimateDisplay}
              </div>

              <p className="opacity-90 font-semibold text-sm sm:text-base mb-6">
                {summaryText}
              </p>

              {/* Breakdown Rows */}
              <div className="space-y-2.5 border-t border-black/15 pt-5 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-75">Estimated per clip (midpoint)</span>
                  <span className="font-bold">
                    {earningsConfig.currencySymbol}
                    {earningsPerClip.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Views per clip</span>
                  <span className="font-bold">{viewsPerClip.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Rate used (per 100K views)</span>
                  <span className="font-bold">{earningsConfig.currencySymbol}{rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Clips per month</span>
                  <span className="font-bold">{clipsPerMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Audience region</span>
                  <span className="font-bold">{region}</span>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-2">
                  <span className="opacity-85 font-semibold">Midpoint monthly total</span>
                  <span className="font-bold">
                    {earningsConfig.currencySymbol}{Math.round(monthlyTotal).toLocaleString()}
                  </span>
                </div>
                {suggestedPlan && (
                  <div className="flex justify-between">
                    <span className="opacity-85 font-semibold">Suggested plan</span>
                    <span className="font-bold uppercase font-mono text-xs bg-black/15 px-2.5 py-1 rounded-full">
                      {suggestedPlan}
                    </span>
                  </div>
                )}
                {earningsConfig.agencySharePercent > 0 && (
                  <div className="flex justify-between border-t border-black/10 pt-2">
                    <span className="opacity-85 font-semibold">
                      You keep ({100 - earningsConfig.agencySharePercent}%)
                    </span>
                    <span className="font-bold">
                      {earningsConfig.currencySymbol}
                      {Math.round(monthlyTotal * (1 - earningsConfig.agencySharePercent / 100)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <a
                href={buildMailto()}
                onClick={handleGetPlanClick}
                className="block w-full bg-bg text-white text-center py-4 rounded-full font-bold hover:bg-black transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Get a plan for this
              </a>

              <p className="text-center text-xs opacity-75 mt-4 font-medium">
                Estimates only. Actual earnings depend on the platform, your audience, and verification.
              </p>
            </div>

            {/* Subtle background symbol */}
            <div className="absolute -bottom-16 -right-10 text-bg opacity-10 font-headline text-[180px] leading-none pointer-events-none select-none">
              {earningsConfig.currencySymbol}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Earnings;
