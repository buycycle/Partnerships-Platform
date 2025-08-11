import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate UTM URL for video navigation
 * @param videoId - The video ID (1-30)
 * @returns Full URL with UTM parameters
 */
export function generateVideoUTMUrl(videoId: string): string {
  const baseUrl = `https://sponsorship.buycycle.com/video/${videoId}`
  const utmParams = new URLSearchParams({
    utm_source: 'social',
    utm_medium: 'partnerships', 
    utm_campaign: 'senders'
  })
  
  return `${baseUrl}?${utmParams.toString()}`
}
