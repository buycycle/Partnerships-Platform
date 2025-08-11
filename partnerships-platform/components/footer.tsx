export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/buycyclelogo.png" 
              alt="buycycle" 
              className="h-6 sm:h-8 w-auto"
            />
          </div>
          
          {/* Support Links */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-sm">
            <a 
              href="https://contact.buycycle.com/en" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </a>
            <a 
              href="https://buycycle.zendesk.com/agent/home/tickets" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              FAQs
            </a>
            <a 
              href="https://buycycle.com/en-fr/page/terms" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms
            </a>
            <a 
              href="https://buycycle.com/en-fr/page/imprint" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Imprint
            </a>
            <a 
              href="https://buycycle.com/en-fr/page/privacy-policy" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} buycycle. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 