/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-color)',
        bg: '#0a0a0a',
        surface: '#171717',
        'surface-light': '#262626',
      },
      fontFamily: {
        headline: 'var(--font-headline)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
    },
  },
  plugins: [],
}
