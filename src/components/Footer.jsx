import React from 'react';
import { siteConfig } from '../config/siteConfig';

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
    <footer className="bg-surface border-t border-white/10 pt-14 pb-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="flex flex-col items-center md:items-start">
          <button
            onClick={() => scrollTo('home')}
            className="flex items-center gap-3 mb-3 hover:opacity-85 transition-opacity focus:outline-none"
            aria-label={`${siteConfig.siteName} — Back to top`}
          >
            <img
              src={siteConfig.logoPath || '/logo.png'}
              alt={siteConfig.siteName}
              className="h-8 w-auto object-contain select-none"
            />
          </button>
          <p className="text-gray-400 text-sm max-w-sm text-center md:text-left">
            {siteConfig.tagline}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <button
            onClick={() => scrollTo('home')}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Home
          </button>
          {siteConfig.nav.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('contact')}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Contact
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-mono uppercase">
        <p>© {currentYear} {siteConfig.siteName}. All rights reserved.</p>
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="hover:text-accent transition-colors lowercase font-mono"
        >
          {siteConfig.contact.email}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
