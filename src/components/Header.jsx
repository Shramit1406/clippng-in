import React, { useEffect, useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Scroll spy logic
      const sections = ['home', ...siteConfig.nav.map(n => n.id), 'contact'];
      let current = 'home';

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-bg/90 backdrop-blur-md border-b border-white/10'
          : 'bg-bg/40 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Clickable Logo Mark -> scrolls to #home */}
        <button
          onClick={() => scrollTo('home')}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg py-1"
          aria-label={`${siteConfig.siteName} — Back to top`}
        >
          <img
            src={siteConfig.logoPath || '/logo.png'}
            alt={siteConfig.siteName}
            className="h-7 md:h-9 w-auto object-contain select-none"
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {siteConfig.nav.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`text-sm font-medium transition-colors hover:text-white focus:outline-none focus-visible:text-accent ${
                activeSection === item.id ? 'text-accent font-semibold' : 'text-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Contact CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => scrollTo('contact')}
            className="hidden md:block bg-accent text-bg px-6 py-2.5 rounded-full font-bold text-sm hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Contact Me
          </button>

          <button
            className="md:hidden text-white p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-surface border-b border-white/10 p-6 flex flex-col gap-5 shadow-2xl">
          {siteConfig.nav.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`text-left text-lg font-bold py-1 ${
                activeSection === item.id ? 'text-accent' : 'text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('contact')}
            className="bg-accent text-bg px-6 py-3.5 rounded-full font-bold text-base text-center mt-2"
          >
            Contact Me
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
