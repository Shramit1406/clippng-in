import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { getSyncMeta } from '../config/clipData';
import LightfallBackground from './LightfallBackground';

const Hero = () => {
  const meta = getSyncMeta();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-6 relative text-center overflow-x-clip"
    >
      {/* Renders inside #home only when siteConfig.effects.lightfall.scope === "hero" */}
      <LightfallBackground mode="hero" />

      <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
        {/* Giant Headline */}
        <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl uppercase leading-[0.92] tracking-tight mb-8 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
          {siteConfig.hero.headline}
        </h1>

        {/* Intro paragraph */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-300 mb-14 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          {siteConfig.hero.subtext}
        </p>

        {/* Centered Split Block: "Two sides. One platform. Pick yours." */}
        <div className="bg-surface border border-white/10 rounded-3xl p-8 md:p-12 w-full max-w-3xl shadow-2xl">
          <h2 className="text-2xl md:text-4xl font-headline uppercase mb-1">
            {siteConfig.hero.splitTitle}
          </h2>
          <p className="text-xl md:text-2xl font-headline uppercase text-gray-500 mb-4">
            {siteConfig.hero.splitSubtitle}
          </p>
          {siteConfig.hero.splitDescription && (
            <p className="text-sm md:text-base text-gray-400 mb-8 max-w-lg mx-auto">
              {siteConfig.hero.splitDescription}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollTo('clips')}
              className="px-8 py-4 rounded-full bg-white text-bg font-bold hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {siteConfig.hero.buttonClipsLabel}
            </button>
            <button
              onClick={() => scrollTo('brands')}
              className="px-8 py-4 rounded-full bg-surface-light border border-white/10 font-bold hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {siteConfig.hero.buttonBrandsLabel}
            </button>
          </div>
        </div>

        {/* Showcase Stats Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-14">
          <div className="flex flex-col items-center border border-white/10 bg-surface/85 backdrop-blur-sm rounded-full px-7 py-3.5 min-w-[200px]">
            <span className="text-2xl font-headline text-accent mb-0.5">
              {meta.totalViewsDisplay}
            </span>
            <span className="text-[11px] font-mono uppercase text-gray-300 tracking-wider">
              Views on All Clips (as of {meta.viewsAsOf})
            </span>
          </div>

          <div className="flex flex-col items-center border border-white/10 bg-surface/85 backdrop-blur-sm rounded-full px-7 py-3.5 min-w-[160px]">
            <span className="text-2xl font-headline text-white mb-0.5">
              {meta.totalClipsDisplay}
            </span>
            <span className="text-[11px] font-mono uppercase text-gray-300 tracking-wider">
              Total Clips
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
