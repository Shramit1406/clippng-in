import React, { Suspense, lazy, useEffect, useState } from 'react';
import { siteConfig } from '../config/siteConfig';

const LazyLightfall = lazy(() => import('./effects/Lightfall'));

/**
 * Converts any CSS color string (#rgb, #rrggbb, or rgb(r, g, b)) to a 6-digit #rrggbb hex string.
 */
export function resolveCssColorToHex(rawColor, fallback = '#ff4d1f') {
  if (!rawColor) return fallback;
  const trimmed = String(rawColor).trim();

  // Already 6-digit hex
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  // 3-digit hex -> expand to 6-digit
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  // rgb(...) or rgba(...)
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const toHex = n => Math.max(0, Math.min(255, parseInt(n, 10))).toString(16).padStart(2, '0');
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }

  return fallback;
}

/**
 * Mixes a #rrggbb hex color with white by `amount` (0 to 1) to create a lighter tint.
 */
export function lightenHex(hex, amount = 0.42) {
  const clean = resolveCssColorToHex(hex, '#ff4d1f').slice(1);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const mix = c => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0');
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

/**
 * Static CSS fallback when WebGL2 is unavailable, disabled, or while lazy chunk loads.
 */
const StaticGlowFallback = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundColor: '#0a0a0a',
      backgroundImage:
        'radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--accent-color) 22%, transparent), transparent 70%)'
    }}
  />
);

const LightfallBackground = ({ mode = 'page' }) => {
  const cfg = siteConfig.effects?.lightfall || {};
  const configuredScope = cfg.scope || 'page';

  // Only render in the active scope ("page" fixed behind site, or "hero" inside #home)
  const shouldRenderHere = mode === configuredScope;

  const [webgl2Available, setWebgl2Available] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [accentHex, setAccentHex] = useState(() =>
    resolveCssColorToHex(siteConfig.accentColor, '#ff4d1f')
  );

  useEffect(() => {
    if (!shouldRenderHere) return;

    // 1. Check WebGL2 availability
    let hasWebGL2 = false;
    try {
      if (!window.__DISABLE_WEBGL2__) {
        const testCanvas = document.createElement('canvas');
        hasWebGL2 = Boolean(testCanvas.getContext('webgl2'));
      }
    } catch {
      hasWebGL2 = false;
    }
    setWebgl2Available(hasWebGL2);

    // 2. Read --accent-color CSS variable at runtime
    const readAccentVar = () => {
      const cssVal = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
      setAccentHex(resolveCssColorToHex(cssVal || siteConfig.accentColor, '#ff4d1f'));
    };
    readAccentVar();

    // 3. Track mobile breakpoint for dpr and streakCount optimization
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldRenderHere]);

  if (!shouldRenderHere) return null;

  const lighterAccent = lightenHex(accentHex, 0.42);
  const streakColors = [accentHex, lighterAccent, '#ffffff'];
  const effectiveStreakCount = isMobile
    ? (cfg.streakCountMobile ?? 1)
    : (cfg.streakCount ?? 2);

  const containerStyle =
    mode === 'page'
      ? {
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: '#0a0a0a'
        }
      : {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundColor: '#0a0a0a'
        };

  return (
    <div style={containerStyle} aria-hidden="true">
      {/* Base ambient glow fallback always sits underneath */}
      <StaticGlowFallback />

      {cfg.enabled !== false && webgl2Available && (
        <Suspense fallback={null}>
          <LazyLightfall
            colors={streakColors}
            backgroundColor={accentHex}
            speed={cfg.speed ?? 0.25}
            streakCount={effectiveStreakCount}
            streakWidth={cfg.streakWidth ?? 0.8}
            streakLength={cfg.streakLength ?? 1}
            density={cfg.density ?? 0.6}
            twinkle={cfg.twinkle ?? 0.3}
            glow={cfg.glow ?? 0.85}
            backgroundGlow={cfg.backgroundGlow ?? 0.12}
            headGlow={cfg.headGlow ?? 0.5}
            depth={cfg.depth ?? 0.5}
            bloom={cfg.bloom ?? 0.3}
            zoom={cfg.zoom ?? 3}
            opacity={cfg.opacity ?? 1}
            mouseInteraction={cfg.mouseInteraction !== false}
            mouseStrength={cfg.mouseStrength ?? 0.4}
            mouseRadius={cfg.mouseRadius ?? 0.45}
            mouseDampening={cfg.mouseDampening ?? 0.15}
            lens={cfg.lens ?? 0.5}
            holdToWarp={false}
            intro={cfg.intro !== false}
            fade={cfg.fade ?? 0.15}
            mixBlendMode={cfg.mixBlendMode || 'screen'}
            dpr={isMobile ? 1 : undefined}
          />
        </Suspense>
      )}

      {/* Subtle dark vignette/scrim overlay so hero headlines and body copy retain strong contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(10, 10, 10, 0.2) 0%, rgba(10, 10, 10, 0.68) 85%, rgba(10, 10, 10, 0.88) 100%)',
          opacity: cfg.vignetteOpacity ?? 0.45
        }}
      />
    </div>
  );
};

export default LightfallBackground;
