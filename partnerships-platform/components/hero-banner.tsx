'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

export function HeroBanner() {
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Get the appropriate banner image based on language and device
  const getBannerImage = () => {
    if (language === 'fr') {
      return isMobile 
        ? '/everride_french_mobile.webp'
        : '/everride_english_web.webp';
    } else {
      return isMobile 
        ? '/everride_english_mobile.webp'
        : '/everride_french_web.webp';
    }
  };

  // Get appropriate alt text based on language
  const getAltText = () => {
    if (language === 'fr') {
      return "buycycle. | everide - Everide rejoint buycycle pour vous apporter plus d'équipements sportifs et une plus grande communauté !";
    } else {
      return "buycycle. | everide - Everide joins buycycle to bring you more sports gear and a bigger community!";
    }
  };

  return (
    <div className="relative bg-white pt-2 sm:pt-3 md:pt-4">
      {/* Hero Image - Smaller and centered like buycycle.com */}
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <a 
          href="https://buycycle.com/sell/?utm_source=everide&utm_medium=redirect&utm_campaign=CT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block cursor-pointer hover:opacity-95 transition-opacity duration-300 w-full max-w-6xl"
          title="Sell on buycycle.com"
        >
          <img 
            src={getBannerImage()}
            alt={getAltText()}
            className={`w-full h-auto ${isMobile 
              ? 'object-contain' 
              : 'object-cover max-h-[250px] md:max-h-[300px] lg:max-h-[350px]'
            }`}
            loading="eager"
            decoding="async"
          />
        </a>
      </div>
    </div>
  );
}
