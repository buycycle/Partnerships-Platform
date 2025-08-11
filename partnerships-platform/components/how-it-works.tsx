'use client';

import { useLanguage } from '@/contexts/language-context';

export function HowItWorks() {
  const { t } = useLanguage();
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          {/* How to buy */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t.howToBuyTitle}</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <p className="text-gray-700 text-lg">
                    {t.step1Desc}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <p className="text-gray-700 text-lg">
                    {t.step2Desc}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <p className="text-gray-700 text-lg">
                    {t.step3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to sell */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t.howToSellTitle}</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">1</span>
                </div>
                <div>
                  <p className="text-gray-700 text-lg">
                    {t.sellStep1Desc}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <p className="text-gray-700 text-lg">
                    {t.sellStep2Desc}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">3</span>
                </div>
                <div>
                  <p className="text-gray-700 text-lg">
                    {t.sellStep3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom banner with real image */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left side - Image */}
            <div className="lg:order-1">
              <img 
                src="/assets_78537f9f53b44e1aa1ec3c464489249a_e4f1c10bf4ae49d98e492a924f6e2b28.jpeg"
                alt="Sports gear lifestyle"
                className="w-full h-64 lg:h-full object-cover"
              />
            </div>
            
            {/* Right side - Content */}
            <div className="lg:order-2 p-8 lg:p-12 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">
                {t.startListingTitle}
              </h2>
              <p className="text-lg mb-6 text-white/90">
                {t.startListingDesc}
              </p>
              <a 
                href="https://buycycle.com/de-de/sell/112059/component/item" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors self-start inline-block text-center cursor-pointer"
              >
                {t.listGearButton}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
