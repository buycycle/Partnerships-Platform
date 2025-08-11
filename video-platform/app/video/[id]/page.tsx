"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { mockVideos } from "@/lib/mock-data"
import { notFound } from "next/navigation"
import { AlertCircle, Share2, Check, ArrowLeft } from "lucide-react"
import { VoteButton } from "@/components/vote-button"
import { getVideoUrl, extractGoogleDriveFileId } from "@/lib/video-upload"
import { 
  extractUTMParams, 
  storeUTMParams, 
  trackPageView, 
  trackVideoView, 
  trackVideoShare, 
  buildShareUrl,
  type UTMParams 
} from "@/lib/analytics"
import { generateVideoUTMUrl } from "@/lib/utils"
import Link from "next/link"

interface VideoPageProps {
  params: {
    id: string
  }
}

export default function VideoPage({ params }: VideoPageProps) {
  const searchParams = useSearchParams()
  const video = mockVideos.find((v) => v.id === params.id)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isGoogleDriveVideo, setIsGoogleDriveVideo] = useState(false)
  const [utmParams, setUtmParams] = useState<UTMParams>({})
  const [voteCount, setVoteCount] = useState<number>(0)
  const [userVoteInfo, setUserVoteInfo] = useState<{
    hasVoted: boolean;
    votedVideoIds: string[];
    currentVoteCount: number;
    hasVotedForThisVideo: boolean;
    canVoteMore: boolean;
  } | null>(null)
  
  // Mobile detection helper
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (!video) {
    notFound()
  }

  // Extract and store UTM parameters on component mount
  useEffect(() => {
    const extractedUtmParams = extractUTMParams(searchParams)
    setUtmParams(extractedUtmParams)
    
    // Store UTM parameters for session
    if (Object.keys(extractedUtmParams).length > 0) {
      storeUTMParams(extractedUtmParams)
      
      // Track page view with UTM data
      trackPageView(`Video: ${video.title}`, extractedUtmParams, {
        video_id: video.id,
        video_title: video.title
      })
    }
  }, [searchParams, video.title, video.id])

  // Get the proper video URL on mount
  useEffect(() => {
    const url = getVideoUrl(video)
    setVideoUrl(url)
    setIsGoogleDriveVideo(video.video_url.includes('drive.google.com'))
    setIsLoading(false)
  }, [video])

  // Fetch vote data on mount with mobile-specific delay
  useEffect(() => {
    console.log('🔍 [VideoPage] Initializing vote data fetch, isMobile:', isMobile);
    
    // Add small delay for mobile browsers to ensure proper initialization
    const timer = setTimeout(() => {
      console.log('🔍 [VideoPage] Fetching vote data for video:', video.id);
      fetchVoteData();
    }, isMobile ? 200 : 100);
    
    return () => clearTimeout(timer);
  }, [video.id])

  useEffect(() => {
    // Track video view with UTM data
    if (Object.keys(utmParams).length > 0) {
      trackVideoView(video.id, video.title, utmParams)
    }

    // Auto-play video when page loads (only for non-Google Drive videos)
    if (videoRef.current && !videoError && videoUrl && !isGoogleDriveVideo) {
      videoRef.current.load() // Reload video with new URL
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked by browser, that's okay
        console.log("Auto-play was prevented by browser")
      })
    }
  }, [videoError, videoUrl, isGoogleDriveVideo, video.id, video.title, utmParams])

  const handleVideoError = () => {
    console.error('Video failed to load:', videoUrl)
    setVideoError(true)
    setIsLoading(false)
  }

  const handleVideoLoad = () => {
    setIsLoading(false)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const getGoogleDriveEmbedUrl = () => {
    const fileId = extractGoogleDriveFileId(videoUrl)
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`
    }
    return videoUrl
  }

  // Fetch vote data for this video
  const fetchVoteData = async () => {
    try {
      // More robust token access for mobile
      let authToken = null;
      try {
        authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      } catch (e) {
        console.log('localStorage access failed, continuing without token');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Use more efficient single video API endpoint
      const response = await fetch(`/api/videos/vote?videoId=${video.id}`, {
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout for mobile
      });

      if (response.ok) {
        const data = await response.json();
        setVoteCount(data.voteCount || 0);
        
        // Handle userVote data structure
        if (data.userVote) {
          setUserVoteInfo({
            hasVoted: !!data.userVote,
            votedVideoIds: [],
            currentVoteCount: 0,
            hasVotedForThisVideo: !!data.userVote,
            canVoteMore: true
          });
        } else {
          setUserVoteInfo(null);
        }
      } else if (response.status === 401) {
        console.log('Authentication required for vote data');
        // Don't show error, just continue without user vote info
        setUserVoteInfo(null);
      } else {
        console.error('Vote API error:', response.status, response.statusText);
        setUserVoteInfo(null);
      }
    } catch (error) {
      console.error('Failed to fetch vote data:', error);
      if (isMobile) {
        console.log('Mobile-specific error detected:', error);
        // Add mobile-specific error handling
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request timeout on mobile');
        }
      }
      // Set defaults on error
      setVoteCount(0);
      setUserVoteInfo(null);
    }
  };

  // Handle vote update
  const handleVoteUpdate = (data: { voteCount: number; userVoteInfo: any }) => {
    setVoteCount(data.voteCount);
    
    // Update user vote info based on the callback data
    if (data.userVoteInfo) {
      setUserVoteInfo({
        hasVoted: data.userVoteInfo.hasVoted || false,
        votedVideoIds: [],
        currentVoteCount: 0,
        hasVotedForThisVideo: data.userVoteInfo.hasVoted || false,
        canVoteMore: true
      });
    } else {
      // Only refresh data if we don't have userVoteInfo in callback
      setTimeout(() => fetchVoteData(), 100);
    }
  };

  const handleShare = async () => {
    // Use consistent UTM URL like video cards
    const shareUrl = generateVideoUTMUrl(video.id)
    
    try {
        await navigator.clipboard.writeText(shareUrl)
        setIsShared(true)
      
      // Track share event with UTM data
      trackVideoShare(video.id, video.title, 'clipboard', utmParams)
      
      setTimeout(() => setIsShared(false), 3000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div 
        className="bg-black text-white text-xs py-2 cursor-pointer hover:bg-gray-900 transition-colors duration-300"
        onClick={() => {
          window.location.href = '/#videos-section';
        }}
        title="Go to videos section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white flex items-center justify-center">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm">Über 100.000 Fahrräder, Fahrradteile und Zubehör</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white flex items-center justify-center">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm">Nur zertifizierte Verkäufer</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm">79€ Versand auf alle Räder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-black hover:text-gray-700">
                <img 
                  src="/bc-logo-update.png" 
                  alt="buycycle" 
                  className="h-6 sm:h-8 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                />
              </Link>
              <a 
                href="https://buycycle.com/en-de/sell" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black text-white px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors rounded-sm"
              >
                Verkaufen
              </a>
            </div>
            <Link 
              href="/"
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Videos</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Video Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
          {isLoading && (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-base sm:text-lg">Loading video...</p>
              </div>
            </div>
          )}
          
          {!videoError && videoUrl ? (
            <>
              {isGoogleDriveVideo ? (
                // Use iframe for Google Drive videos
                <iframe
                  ref={iframeRef}
                  src={getGoogleDriveEmbedUrl()}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={handleVideoError}
                  style={{ display: isLoading ? 'none' : 'block' }}
                />
              ) : (
                // Use HTML5 video for other sources
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  controls
                  autoPlay
                  crossOrigin="anonymous"
                  src={videoUrl}
                  onError={handleVideoError}
                  onLoadedData={handleVideoLoad}
                  preload="metadata"
                  style={{ display: isLoading ? 'none' : 'block' }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </>
          ) : !isLoading && (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center px-4">
                <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-base sm:text-lg mb-2">Video could not be loaded</p>
                <p className="text-sm text-gray-400">Please try again later</p>
                <p className="text-xs text-gray-500 mt-2 break-all">URL: {videoUrl}</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">{video.title}</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{video.description}</p>

              {/* Removed View Count section */}
            </div>
            
            <div className="text-left sm:text-right mt-4 sm:mt-0 sm:ml-4">
              <VoteButton 
                videoId={video.id} 
                videoTitle={video.title}
                className={`text-base sm:text-lg ${isMobile ? 'touch-manipulation' : ''}`}
                voteCount={voteCount}
                userVoteInfo={userVoteInfo}
                onVoteUpdate={handleVoteUpdate}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm sm:text-base"
            >
              {isShared ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Video</span>
                </>
              )}
            </button>
            
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Videos</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
