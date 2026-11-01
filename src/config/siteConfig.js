// ==========================================
// SITE CONFIGURATION — Clippng.in
// ==========================================
// Edit this file to change the general look, text, interactive effects, and contact settings of your site.
// GOLDEN RULE: Do not hardcode fake stats here. All clip and view counts on the site
// are computed automatically from `src/config/clips.generated.json` (with `clips.js` as fallback).

export const siteConfig = {
  // ----------------------------------------
  // 1. BRANDING & COLORS
  // ----------------------------------------
  siteName: "Clippng.in",
  tagline: "Short-form stream clipping, multi-platform distribution, and creator growth.",
  logoPath: "/logo.png",
  logoTrimmedJpg: "/logo-trimmed.jpg",

  // The single source of truth for the accent color (used across buttons, highlights,
  // Lightfall streaks, WakeSlider bars, MagicBento border glow, and channel cards).
  accentColor: "#ff4d1f",

  // Typography (Google Fonts loaded in src/index.css)
  fonts: {
    headline: "'Archivo', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Space Mono', monospace",
  },

  // ----------------------------------------
  // 2. HERO SECTION (#home)
  // ----------------------------------------
  hero: {
    headline: "WE GROW STREAMERS & CREATORS",
    subtext: "High-retention stream clipping, native multi-platform distribution across TikTok, YouTube Shorts, Instagram Reels, and X, plus hands-on creator management.",
    splitTitle: "Two sides. One platform.",
    splitSubtitle: "Pick yours.",
    splitDescription: "Whether you need daily short-form clips cut from your streams or full-channel distribution.",
    buttonClipsLabel: "I need clips",
    buttonBrandsLabel: "I need management",
  },

  // ----------------------------------------
  // 3. CONTACT & SOCIALS (#contact)
  // ----------------------------------------
  contact: {
    email: "sahir@clippng.in",

    // Default subject and body when someone clicks the main email card or header CTA
    defaultSubject: "Work Inquiry — Clippng.in",
    defaultBody:
      "Hi Clippng.in team,\n\nI'd like to talk about working together.\n\n- My channel / stream link:\n- Platforms I want to grow on:\n- What I'm looking for (clipping / full management):\n\nThanks!",

    // Inquiry type buttons in the Contact section
    inquiryTypes: [
      {
        label: "Clip Package Inquiry",
        subject: "Clipping Package Inquiry — Clippng.in"
      },
      {
        label: "Creator Management",
        subject: "Creator Management Inquiry — Clippng.in"
      },
      {
        label: "Brand / Partnership",
        subject: "Partnership Inquiry — Clippng.in"
      }
    ],

    // TODO: Add a neutral response-time note only if desired; leave empty ("") to hide the response-time card.
    responseTimeNote: "",

    // Office / location block: leave empty ("") so it stays hidden. Never show a fake address.
    location: "",

    // Official social links for Clippng.in.
    // Leave any unused platform as an empty string ("") so it automatically hides.
    socials: {
      instagram: "https://www.instagram.com/clippng.in",
      x: "https://x.com/clippngdotin",
      youtube: "",
      tiktok: "",
      discord: "",
      linkedin: "",
      twitch: "",
      kick: "",
      threads: ""
    }
  },

  // ----------------------------------------
  // 4. NAVIGATION LABELS
  // ----------------------------------------
  nav: [
    { id: "clips", label: "Clips" },
    { id: "brands", label: "Brands" },
    { id: "earnings", label: "Earning Prediction" },
    { id: "faq", label: "FAQ" }
  ],

  // ----------------------------------------
  // 5. INTERACTIVE EFFECTS (React Bits)
  // ----------------------------------------
  // Tweak the look and feel of the 4 visual components below without editing component code.
  // Colors automatically inherit from `accentColor` (via CSS variable `--accent-color`).
  effects: {
    // Component 1: Lightfall WebGL light-streak background
    lightfall: {
      enabled: true,             // Set false to disable the WebGL background and use the static dark glow fallback
      scope: "page",             // "page" (fixed behind the entire site) or "hero" (only behind the #home section)
      speed: 0.25,               // How fast the light streaks fall (lower = calmer)
      streakCount: 2,            // Layers of streaks on desktop (1 to 16)
      streakCountMobile: 1,      // Layers of streaks on mobile (<768px) to save battery/GPU
      streakWidth: 0.8,          // Thickness of individual light streaks
      streakLength: 1,           // Length of the glowing streak tails
      density: 0.6,              // How closely streaks follow each other down the tunnel
      twinkle: 0.3,              // How much streaks flicker as they fall (0 to 1)
      glow: 0.85,                // Overall brightness of the falling streaks
      backgroundGlow: 0.12,      // Soft orange-red ambient glow at the top of the screen (0 turns it off)
      headGlow: 0.5,             // How white-hot the leading streak tips burn (0 to 1)
      depth: 0.5,                // Dims streaks deep in the tunnel so foreground streaks stand out
      bloom: 0.3,                // Soft halo glow around the brightest streak tips
      zoom: 3,                   // Camera field of view into the tunnel (higher = zoomed in)
      opacity: 1,                // Overall canvas opacity (0 to 1)
      mouseInteraction: true,    // Cursor bends nearby streaks like a lens and brightens them
      mouseStrength: 0.4,        // How much the cursor brightens nearby streaks
      mouseRadius: 0.45,         // Reach of the cursor light interaction
      mouseDampening: 0.15,      // Cursor light smoothing lag in seconds (0 = instant)
      lens: 0.5,                 // How strongly the cursor bends nearby light streaks
      holdToWarp: false,         // Keep false so dragging sliders or swiping the phone carousel never triggers warp
      intro: true,               // Streaks arrive at warp speed on initial page load and settle into a calm fall
      fade: 0.15,                // Softly fades the edges of the effect into the dark background (0 to 1)
      mixBlendMode: "screen",    // CSS blend mode ("screen", "lighten", or "")
      vignetteOpacity: 0.45      // Dark radial vignette overlay above the canvas so all white/gray text stays crisp
    },

    // Component 2: WakeSlider (used for "Average Views per Clip" and "Clips Posted per Month" in #earnings)
    wakeSlider: {
      barsDesktop: 32,           // Number of vertical bars on desktop screens
      barsMobile: 24,            // Number of vertical bars on mobile screens (<640px)
      height: 52,                // Full height of the slider wave in pixels when dragging (keep >= 44px for touch)
      restHeight: 12,            // Height of the bars in pixels when idle
      gap: 4,                    // Space between bars in pixels
      trackColor: "#27272a",     // Color of unlit bars (lit bars automatically use `--accent-color`)
      crestColor: "",            // Optional highlight color at the wave crest (leave "" to match accent color)
      sensitivity: 1,            // How strongly drag speed raises the wave
      reach: 6,                  // How many neighboring bars lift in the wake
      skew: 0.6,                 // How much longer the wake trails behind the drag direction (0 to 1)
      glide: 0.3,                // Spring follow time in seconds
      smoothing: 100             // Wave velocity smoothing in milliseconds
    },

    // Component 3: MagicBento (real-data dashboard grid in #brands)
    magicBento: {
      theme: "dark",             // "dark" or "light"
      columns: 4,                // Desktop column count (automatically drops to 2 on tablet and 1 on mobile)
      rowHeight: 150,            // Base height of a 1-row card in pixels (140 to 160 recommended)
      gap: 12,                   // Space between bento cards in pixels
      radius: 20,                // Corner radius of bento cards in pixels
      enableBorderGlow: true,    // Accent glow travels along card borders near the cursor
      enableSpotlight: true,     // Soft radial spotlight follows the cursor across cards
      spotlightRadius: 300,      // Reach of the spotlight and border glow in pixels
      clickEffect: true,         // Outward light ring and subtle press animation on click
      intro: true,               // Staggered entrance animation when scrolling into view
      textAutoHide: true,        // Clamps overflowing card titles/descriptions cleanly
      enableStars: false,        // Drifting particles inside hovered cards
      particleCount: 24,         // Particle count when enableStars is true
      enableTilt: false,         // 3D perspective tilt on hover
      enableMagnetism: false,    // Magnetic pull toward the cursor
      disableAnimations: false   // Set true to disable all MagicBento motion
    },

    // Component 4: ScrollStack ("Channels we've clipped for" pinning stack in #brands)
    scrollStack: {
      stackPosition: "112px",          // Pin offset from top of viewport (80px fixed header + 32px clearance)
      itemDistance: 100,               // Vertical scroll spacing in pixels between cards before they stack
      itemStackDistanceDesktop: 24,    // Visible top strip in pixels left on each pinned card on desktop
      itemStackDistanceMobile: 15,     // Visible top strip in pixels left on each pinned card on mobile
      itemScale: 0.05,                 // Scale reduction per card stacked on top of a buried card
      baseScale: 0.85,                 // Minimum scale a deeply buried card can shrink to
      dimAmount: 0.2,                  // How much buried cards darken per layer (0 to 1)
      blurAmount: 0,                   // Optional blur in pixels per buried layer
      tiltAmount: 0,                   // Optional backward tilt in degrees when buried
      rotationAmount: 0,               // Optional alternating rotation in degrees when buried
      holdDistance: 200,               // Extra scroll distance in pixels after the last card pins before unpinning
      smoothScroll: false,             // Keep false so it never fights anchor smooth-scrolling or scroll-spy
      snap: false,                     // Snap to nearest card when scrolling stops
      useWindowScroll: true,           // Pin cards using the main window scroll
      sortByViews: true                // Sort channel cards by total verified views descending (false = config order)
    }
  }
};
