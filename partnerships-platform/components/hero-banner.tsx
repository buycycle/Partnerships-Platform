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
      {/* Hero Image */}
      <a 
        href="https://buycycle.com/en-us" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block cursor-pointer hover:opacity-95 transition-opacity duration-300"
        title="Visit buycycle.com"
      >
        <img 
          src={getBannerImage()}
          alt={getAltText()}
          className="w-full h-auto object-cover max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px]"
          loading="eager"
          decoding="async"
        />
      </a>
    </div>
  );
}
