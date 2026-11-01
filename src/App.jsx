import React, { useEffect, useState } from 'react';
import { siteConfig } from './config/siteConfig';

// Components
import LightfallBackground from './components/LightfallBackground';
import Header from './components/Header';
import Hero from './components/Hero';
import Clips from './components/Clips';
import Brands from './components/Brands';
import Earnings from './components/Earnings';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  // Apply dynamic CSS variables based on siteConfig
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', siteConfig.accentColor);
    document.documentElement.style.setProperty('--font-headline', siteConfig.fonts.headline);
    document.documentElement.style.setProperty('--font-body', siteConfig.fonts.body);
    document.documentElement.style.setProperty('--font-mono', siteConfig.fonts.mono);
    document.title = `${siteConfig.siteName} — Stream Clipping & Creator Growth`;
  }, []);

  return (
    <div className="min-h-screen text-white font-body selection:bg-accent selection:text-bg relative">
      {/* Fixed full-viewport Lightfall background when siteConfig.effects.lightfall.scope === "page" */}
      <LightfallBackground mode="page" />

      <Header />

      <main className="relative z-10">
        <Hero />
        <Clips />
        <Brands />
        <Earnings onSelectEstimate={setSelectedEstimate} />
        <FAQ />
        <Contact selectedEstimate={selectedEstimate} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
