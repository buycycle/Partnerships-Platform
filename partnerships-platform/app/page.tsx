"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { LoginModal } from "@/components/auth/login-modal"
import { HeroBanner } from "@/components/hero-banner"
import { MigrateForm } from "@/components/migrate-form"
import { MarketplaceSections } from "@/components/marketplace-sections"
import { HowItWorks } from "@/components/how-it-works"
import { AppDownloadBanner } from "@/components/app-download-banner"
import { LanguageSelector } from "@/components/language-selector"
import { 
  extractUTMParams, 
  storeUTMParams, 
  trackPageView,
  initializeAnalytics,
  type UTMParams 
} from "@/lib/analytics"
import { useUser } from "@/contexts/user-context"
import { useLanguage } from "@/contexts/language-context"

// Separate component for search params logic
function SearchParamsHandler({ onUtmParamsChange }: { onUtmParamsChange: (params: UTMParams) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const extractedUtmParams = extractUTMParams(searchParams)
    onUtmParamsChange(extractedUtmParams)
    
    // Store UTM parameters for session
    if (Object.keys(extractedUtmParams).length > 0) {
      storeUTMParams(extractedUtmParams)
    }
  }, [searchParams, onUtmParamsChange])

  return null
}

function HomePageContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [utmParams, setUtmParams] = useState<UTMParams>({})
  
  // Use the user context instead of local state
  const { isUserLoggedIn, user, refreshUser } = useUser()
  const { t } = useLanguage()

  // Initialize analytics
  useEffect(() => {
    initializeAnalytics()
  }, [])

  // Refresh user context on mount to ensure we have the latest auth state
  useEffect(() => {
    refreshUser()
  }, [])

  // Track page view when UTM params change
  useEffect(() => {
    if (Object.keys(utmParams).length > 0) {
      trackPageView('Homepage - Buycycle Marketplace', utmParams, {
        page_type: 'homepage',
        marketplace: 'buycycle'
      })
    }
  }, [utmParams])

  const handleLoginSuccess = async (userData: any) => {
    console.log('🎉 [HomePage] Login success callback triggered');
    setIsLoginModalOpen(false)
    
    // Refresh user context to ensure UI updates immediately
    await refreshUser()
    console.log('🎉 [HomePage] User context refreshed after login');
  }

  const handleVisitBuycycle = () => {
    window.open('https://buycycle.com', '_blank')
  }

  const handleSignOut = async () => {
    // Clear all auth tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('custom_auth_token')
    }
    
    // Refresh user context to reflect logged out state
    await refreshUser()
    
    console.log('🚪 [HomePage] User signed out successfully')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* UTM Parameters Handler */}
      <Suspense fallback={null}>
        <SearchParamsHandler onUtmParamsChange={setUtmParams} />
      </Suspense>

      {/* Top Banner */}
      <div 
        className="bg-black text-white text-sm py-2 cursor-pointer hover:bg-gray-900 transition-colors duration-300"
        onClick={() => {
          const migrateSection = document.getElementById('migrate-section');
          if (migrateSection) {
            migrateSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        title="Go to migration section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white flex items-center justify-center">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm">{t.topBanner1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white flex items-center justify-center">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm">{t.topBanner2}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm">{t.topBanner3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <a href="https://buycycle.com/de-de" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/bc-logo-update.png" 
                  alt="buycycle" 
                  className="h-6 sm:h-8 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                />
              </a>
              <a 
                href="https://buycycle.com/en-de/sell" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black text-white px-3 sm:px-4 py-1 text-sm font-medium hover:bg-gray-800 transition-colors rounded-sm"
              >
                {t.sell}
              </a>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSelector />
              {!isUserLoggedIn ? (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm text-gray-700 hover:text-black transition-colors bg-white border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-50"
                >
                  {t.login}
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleVisitBuycycle}
                    className="text-sm text-white bg-black px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <span className="hidden sm:inline">{t.visitBuycycle}</span>
                    <span className="sm:hidden">Visit</span>
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="text-sm text-gray-700 hover:text-black transition-colors bg-white border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-50"
                  >
                    {t.logout}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
      {/* Hero Banner */}
        <HeroBanner />
        
        {/* Migration Form */}
        <MigrateForm />
        
        {/* Marketplace Sections */}
        <MarketplaceSections />
        
        {/* App Download Banner */}
        <AppDownloadBanner />
        
        {/* How It Works */}
        <HowItWorks />
      </main>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}