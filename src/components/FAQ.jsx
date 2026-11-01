import React, { useState } from 'react';
import { faqSection, faqItems } from '../config/faq';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl uppercase mb-4">{faqSection.headline}</h2>
          <p className="text-gray-400">{faqSection.subtitle}</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl">
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                className={`border-b border-white/5 last:border-0 ${isOpen ? 'pb-2' : ''}`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-lg pr-8">{item.question}</span>
                  <ChevronDown 
                    className={`text-accent transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-gray-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
