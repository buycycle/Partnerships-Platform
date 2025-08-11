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
        ? '/everride_french_mobile.jpeg'
        : '/everride_french_web.webp';
    } else {
      return isMobile 
        ? '/everride_english_mobile.jpeg'
        : '/everride_english_web.webp';
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
    <div className="relative bg-white">
      {/* Hero Image Container - Fully responsive for all screen sizes */}
      <div className="w-full">
        <a 
          href="https://buycycle.com/en-us" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block cursor-pointer hover:opacity-95 transition-opacity duration-300"
          title="Visit buycycle.com"
        >
          <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-50 to-green-50">
            <img 
              src={getBannerImage()}
              alt={getAltText()}
              className="w-full h-auto object-cover object-center
                         min-h-[280px] max-h-[350px] 
                         sm:min-h-[320px] sm:max-h-[400px]
                         md:min-h-[360px] md:max-h-[450px]
                         lg:min-h-[400px] lg:max-h-[500px]
                         xl:min-h-[450px] xl:max-h-[550px]
                         2xl:min-h-[500px] 2xl:max-h-[600px]
                         transition-all duration-300"
            />
            {/* Subtle overlay for better text readability on wide screens */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
          </div>
        </a>
      </div>
    </div>
  );
}
