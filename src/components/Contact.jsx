import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { Mail, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import {
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaTwitch,
  FaLinkedin,
  FaDiscord,
  FaTiktok
} from 'react-icons/fa';

const Contact = ({ selectedEstimate }) => {
  const getSocialIcon = (platformName) => {
    switch (platformName.toLowerCase()) {
      case 'instagram':
        return <FaInstagram size={20} />;
      case 'x':
      case 'twitter':
        return <FaTwitter size={20} />;
      case 'youtube':
        return <FaYoutube size={20} />;
      case 'twitch':
        return <FaTwitch size={20} />;
      case 'linkedin':
        return <FaLinkedin size={20} />;
      case 'tiktok':
        return <FaTiktok size={20} />;
      case 'discord':
        return <FaDiscord size={20} />;
      default:
        return null;
    }
  };

  // Only render social platforms that have a non-empty URL in siteConfig
  const activeSocials = Object.entries(siteConfig.contact.socials || {}).filter(
    ([_, url]) => typeof url === 'string' && url.trim() !== ''
  );

  const buildMailto = (subject, customBody) => {
    const bodyText = customBody || siteConfig.contact.defaultBody;
    return `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  const hasResponseNote = Boolean(siteConfig.contact.responseTimeNote && siteConfig.contact.responseTimeNote.trim() !== '');
  const hasLocation = Boolean(siteConfig.contact.location && siteConfig.contact.location.trim() !== '');

  return (
    <section id="contact" className="pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        <span className="font-mono text-accent text-sm tracking-widest uppercase mb-4">
          GET IN TOUCH
        </span>
        <h2 className="font-headline text-5xl md:text-7xl uppercase mb-10">
          Let's work together
        </h2>

        {/* Shared Estimate Banner if the visitor clicked "Get a plan for this" in #earnings */}
        {selectedEstimate && (
          <div className="w-full max-w-2xl mb-10 bg-surface border border-accent/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <span className="text-xs font-mono uppercase text-accent block mb-1">
                Your Estimate Selected
              </span>
              <p className="text-sm font-bold text-white">
                {selectedEstimate.estimateDisplay}/mo — {selectedEstimate.summaryText}
              </p>
            </div>
            <a
              href={selectedEstimate.mailtoUrl}
              className="flex-shrink-0 bg-accent text-bg px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all"
            >
              Email This Plan
            </a>
          </div>
        )}

        {/* Contact Cards Grid */}
        <div
          className={`grid grid-cols-1 ${
            hasResponseNote ? 'md:grid-cols-2 max-w-4xl' : 'max-w-xl'
          } gap-6 w-full mb-12`}
        >
          {/* Email Card */}
          <a
            href={selectedEstimate?.mailtoUrl || buildMailto(siteConfig.contact.defaultSubject)}
            className="group bg-surface border border-white/10 rounded-3xl p-8 hover:border-accent/60 hover:bg-white/[0.03] transition-all flex flex-col items-center text-center text-white shadow-xl"
          >
            <div className="w-14 h-14 rounded-full bg-accent text-bg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Mail size={26} />
            </div>
            <h3 className="font-bold text-xl mb-1 flex items-center gap-1.5">
              Email Us <ArrowUpRight size={18} className="text-accent" />
            </h3>
            <p className="text-accent font-mono text-base font-bold mt-1">
              {siteConfig.contact.email}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Click to open a pre-filled email draft
            </p>
          </a>

          {/* Optional Response Time Card (Only renders if configured in siteConfig.js) */}
          {hasResponseNote && (
            <div className="bg-surface border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
              <div className="w-14 h-14 rounded-full bg-surface-light text-accent flex items-center justify-center mb-5">
                <Clock size={26} />
              </div>
              <h3 className="font-bold text-xl mb-2">Response Time</h3>
              <p className="text-gray-400 font-mono text-sm">
                {siteConfig.contact.responseTimeNote}
              </p>
            </div>
          )}
        </div>

        {/* Inquiry-Type Quick Buttons */}
        {Array.isArray(siteConfig.contact.inquiryTypes) && siteConfig.contact.inquiryTypes.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-16">
            {siteConfig.contact.inquiryTypes.map((inq, idx) => (
              <a
                key={idx}
                href={buildMailto(inq.subject)}
                className="px-6 py-2.5 rounded-full border border-white/15 bg-surface/60 text-sm font-bold text-gray-200 hover:border-accent hover:text-white transition-colors"
              >
                {inq.label}
              </a>
            ))}
          </div>
        )}

        {/* Optional Location Block (Only renders if filled in siteConfig.js) */}
        {hasLocation && (
          <div className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase mb-12">
            <MapPin size={14} className="text-accent" />
            <span>{siteConfig.contact.location}</span>
          </div>
        )}

        {/* Social Links (Only renders platforms with a real URL in siteConfig.js) */}
        {activeSocials.length > 0 && (
          <div className="flex flex-col items-center border-t border-white/10 pt-12 w-full">
            <span className="font-mono text-xs uppercase text-gray-400 tracking-widest mb-5 block">
              Official Socials
            </span>
            <div className="flex gap-4">
              {activeSocials.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center gap-2.5 text-gray-300 hover:text-accent hover:border-accent transition-all"
                  aria-label={`${siteConfig.siteName} on ${platform}`}
                >
                  {getSocialIcon(platform)}
                  <span className="text-xs font-mono uppercase font-bold">
                    {platform === 'x' ? 'X (@clippngdotin)' : 'Instagram (@clippng.in)'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
