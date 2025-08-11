'use client';

import { useLanguage } from '@/contexts/language-context';

export function MarketplaceSections() {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.marketplaceTitle}
          </h2>
        </div>

        {/* Three main sections - clickable images only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Sell your sport equipment */}
          <a 
            href="https://buycycle.com/sell" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <img 
              src="/assets_78537f9f53b44e1aa1ec3c464489249a_7899abac101448f0ab45217fcb076834.png"
              alt="Sell your sport equipment"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
            />
          </a>

          {/* Sell your bike */}
          <a 
            href="https://buycycle.com/sell" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <img 
              src="/assets_78537f9f53b44e1aa1ec3c464489249a_3f94db9e046848cdbf1cd1d3371522a1.png"
              alt="Sell your bike"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
            />
          </a>

          {/* Sell your parts & accessories */}
          <a 
            href="https://buycycle.com/sell" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <img 
              src="/assets_78537f9f53b44e1aa1ec3c464489249a_9f67366d952d4cb0b5593045f16e9cae.png"
              alt="Sell your parts & accessories"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
            />
          </a>
        </div>

        {/* Brand logos section */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 mb-8">{t.trustedBrands}</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70 hover:opacity-100 transition-opacity">
            <img 
              src="/brands/assets_78537f9f53b44e1aa1ec3c464489249a_021481e67463441cabcc6e250ea31e4b.jpeg"
              alt="Cycling Brand Logo"
              className="h-12 sm:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <img 
              src="/brands/assets_78537f9f53b44e1aa1ec3c464489249a_d66b2e1e8b7143faa5546a06a353f7a1.jpeg"
              alt="Cycling Brand Logo"
              className="h-12 sm:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <img 
              src="/brands/assets_78537f9f53b44e1aa1ec3c464489249a_d7ab05e405134a329e3a0e18cd6b1b37.jpeg"
              alt="Cycling Brand Logo"
              className="h-12 sm:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <img 
              src="/brands/assets_78537f9f53b44e1aa1ec3c464489249a_ab68d17591044d78926611c0143802ce.jpeg"
              alt="Cycling Brand Logo"
              className="h-12 sm:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <img 
              src="/brands/assets_78537f9f53b44e1aa1ec3c464489249a_146e9d7b7a0f450596cd9d803f090d37.jpeg"
              alt="Cycling Brand Logo"
              className="h-12 sm:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <img 
              src="/brands/assets_78537f9f53b44e1aa1ec3c464489249a_de87dc0d647c40f3b2af9ef2c8915985.jpeg"
              alt="Cycling Brand Logo"
              className="h-12 sm:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <img 
              src="/brands/assets_78537f9f53b44e1aa1ec3c464489249a_1db2a2733b254d3ab30c5e59d9c38e22.jpeg"
              alt="Cycling Brand Logo"
              className="h-12 sm:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </div>

        {/* Parts and Accessories Section */}
        <div className="bg-white py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.partsTitle}
            </h2>
          </div>

          {/* Product Categories Grid - 2 rows x 5 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Row 1 */}
            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/fork" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_5b31f12932094918971699cf8d169413.webp"
                  alt="Fork"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.fork}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/rear-suspension" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_6bd028d1ac1a44179faac5a8e34e5c13.webp"
                  alt="Rear Suspension"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.rearSuspension}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/drivetrain" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_22ee4e0d0f784e619b5a17e0041118a8.webp"
                  alt="Drivetrain & Pedals"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.drivetrain}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/groupset" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_140a11b08c364252a50839c4c67f9a60.webp"
                  alt="Groupset"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.groupset}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/brakes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_501f76fcb43a41cba221724f7949edb2.webp"
                  alt="Brakes"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.brakes}</h3>
                </div>
              </div>
            </a>

            {/* Row 2 */}
            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/tires-tubes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_980b4afb79684619832f6e567857d682.webp"
                  alt="Tires"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.tires}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/wheels" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_22ee4e0d0f784e619b5a17e0041118a8.webp"
                  alt="Wheels"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.wheels}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/cockpit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_140a11b08c364252a50839c4c67f9a60.webp"
                  alt="Cockpit"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.cockpit}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/bike-part/types/saddle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_501f76fcb43a41cba221724f7949edb2.webp"
                  alt="Saddle"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.saddle}</h3>
                </div>
              </div>
            </a>

            <a 
              href="https://buycycle.com/en-us/shop/main-types/accessories/types/accessories" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="/assets_78537f9f53b44e1aa1ec3c464489249a_980b4afb79684619832f6e567857d682.webp"
                  alt="Accessories"
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-black text-white p-3 text-center">
                  <h3 className="font-semibold text-sm">{t.accessories}</h3>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
