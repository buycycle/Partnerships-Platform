'use client';

import { useLanguage } from '@/contexts/language-context';

export function TopNavigation() {
  const { t } = useLanguage();
  
  const menuItems = [
    {
      label: 'Road & Gravel',
      href: 'https://buycycle.com/en-de/shop/bike-types/road-gravel'
    },
    {
      label: 'Mountain Bikes',
      href: 'https://buycycle.com/en-de/shop/bike-types/mountainbike'
    },
    {
      label: 'Bike Parts',
      href: 'https://buycycle.com/en-de/shop/main-types/bike-part'
    },
    {
      label: 'Accessories',
      href: 'https://buycycle.com/en-de/shop/main-types/accessories/types/accessories'
    },
    {
      label: 'Apparel',
      href: 'https://buycycle.com/en-de/shop/main-types/apparel'
    },
    {
      label: 'Framesets',
      href: 'https://buycycle.com/en-de/shop/is_frameset/1'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <ul className="flex space-x-12 py-6">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-black transition-colors font-medium text-base px-3 py-2 hover:bg-gray-50 rounded-md"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
