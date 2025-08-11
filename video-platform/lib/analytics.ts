// Analytics utility for UTM tracking and Google Analytics integration

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export interface TrackingEvent {
  event_name: string
  video_id?: string
  video_title?: string
  utm_params?: UTMParams
  custom_params?: Record<string, any>
}

/**
 * Extract UTM parameters from URL search params
 */
export function extractUTMParams(searchParams: URLSearchParams): UTMParams {
  const utmData: UTMParams = {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
  }
  
  // Filter out undefined values
  return Object.entries(utmData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof UTMParams] = value
    }
    return acc
  }, {} as UTMParams)
}

/**
 * Store UTM parameters in session storage
 */
export function storeUTMParams(utmParams: UTMParams): void {
  if (typeof window !== 'undefined' && Object.keys(utmParams).length > 0) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams))
    sessionStorage.setItem('utm_timestamp', Date.now().toString())
  }
}

/**
 * Retrieve UTM parameters from session storage
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = sessionStorage.getItem('utm_params')
    const timestamp = sessionStorage.getItem('utm_timestamp')
    
    if (!stored || !timestamp) return null
    
    // Check if UTM data is less than 30 minutes old
    const now = Date.now()
    const storedTime = parseInt(timestamp)
    const thirtyMinutes = 30 * 60 * 1000
    
    if (now - storedTime > thirtyMinutes) {
      sessionStorage.removeItem('utm_params')
      sessionStorage.removeItem('utm_timestamp')
      return null
    }
    
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error retrieving UTM params:', error)
    return null
  }
}

/**
 * Track page view with UTM parameters
 */
export function trackPageView(pageName: string, utmParams: UTMParams, additionalParams?: Record<string, any>): void {
  if (typeof window === 'undefined') return
  
  console.log(`[Analytics] Page View: ${pageName}`, { utmParams, additionalParams })
  
  // Google Analytics 4 tracking
  if ((window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content,
      ...additionalParams
    })
  }
  
  // Custom analytics endpoint (if you have one)
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        page: pageName,
        utm_params: utmParams,
        timestamp: new Date().toISOString(),
        ...additionalParams
      })
    }).catch(console.error)
  }
}

/**
 * Track video view with UTM parameters
 */
export function trackVideoView(videoId: string, videoTitle: string, utmParams: UTMParams): void {
  if (typeof window === 'undefined') return
  
  console.log(`[Analytics] Video View: ${videoTitle}`, { videoId, utmParams })
  
  // Google Analytics 4 tracking
  if ((window as any).gtag) {
    (window as any).gtag('event', 'video_view', {
      video_id: videoId,
      video_title: videoTitle,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content
    })
  }
}

/**
 * Track video vote with UTM parameters
 */
export function trackVideoVote(videoId: string, videoTitle: string, action: 'added' | 'removed', utmParams: UTMParams): void {
  if (typeof window === 'undefined') return
  
  console.log(`[Analytics] Video Vote ${action}: ${videoTitle}`, { videoId, utmParams })
  
  // Google Analytics 4 tracking
  if ((window as any).gtag) {
    (window as any).gtag('event', 'video_vote', {
      video_id: videoId,
      video_title: videoTitle,
      vote_action: action,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content
    })
  }
}

/**
 * Track video share with UTM parameters
 */
export function trackVideoShare(videoId: string, videoTitle: string, method: string, utmParams: UTMParams): void {
  if (typeof window === 'undefined') return
  
  console.log(`[Analytics] Video Share via ${method}: ${videoTitle}`, { videoId, utmParams })
  
  // Google Analytics 4 tracking
  if ((window as any).gtag) {
    (window as any).gtag('event', 'share', {
      method: method,
      content_type: 'video',
      item_id: videoId,
      video_title: videoTitle,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content
    })
  }
}

/**
 * Track user login with UTM parameters
 */
export function trackUserLogin(method: 'google' | 'apple' | 'email', utmParams: UTMParams): void {
  if (typeof window === 'undefined') return
  
  console.log(`[Analytics] User Login via ${method}`, { utmParams })
  
  // Google Analytics 4 tracking
  if ((window as any).gtag) {
    (window as any).gtag('event', 'login', {
      method: method,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content
    })
  }
}

/**
 * Build share URL with UTM parameters
 */
export function buildShareUrl(baseUrl: string, utmParams: UTMParams): string {
  if (Object.keys(utmParams).length === 0) {
    return baseUrl
  }
  
  const utmString = new URLSearchParams(utmParams as Record<string, string>).toString()
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${utmString}`
}

/**
 * Initialize analytics tracking on page load
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return
  
  // Log that analytics is initialized
  console.log('[Analytics] Initialized UTM tracking')
  
  // You can add Google Analytics initialization here if needed
  // Example: gtag('config', 'GA_TRACKING_ID', { ... });
} 