import { put } from '@vercel/blob';

// Upload video to Vercel Blob
export async function uploadVideoToBlob(file: File): Promise<string> {
  try {
    const blob = await put(file.name, file, {
      access: 'public',
    });
    
    return blob.url;
  } catch (error) {
    console.error('Error uploading video to blob:', error);
    throw new Error('Failed to upload video');
  }
}

// Download video from Google Drive and upload to Blob
export async function migrateFromGoogleDrive(driveFileId: string, fileName: string): Promise<string> {
  try {
    // Download from Google Drive
    const driveUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
    const response = await fetch(driveUrl);
    
    if (!response.ok) {
      throw new Error('Failed to download from Google Drive');
    }
    
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: 'video/mp4' });
    
    // Upload to Vercel Blob
    return await uploadVideoToBlob(file);
  } catch (error) {
    console.error('Error migrating video:', error);
    throw error;
  }
}

// Utility to convert Google Drive sharing URL to file ID
export function extractGoogleDriveFileId(shareUrl: string): string | null {
  const patterns = [
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /file\/d\/([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = shareUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Convert Google Drive URL to direct video URL (for downloading)
export function convertGoogleDriveToDirectUrl(shareUrl: string): string {
  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  // For video streaming, use this format
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Convert Google Drive URL to embed URL (better for HTML5 video players)
export function convertGoogleDriveToEmbedUrl(shareUrl: string): string {
  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

// Convert Google Drive URL to streaming URL (best for HTML5 video)
export function convertGoogleDriveToStreamingUrl(shareUrl: string): string {
  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  // Use a different approach for better video streaming
  // This format works better with HTML5 video players
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Get video URL based on source type
export function getVideoUrl(video: any): string {
  // If it's a Google Drive URL, convert it to streaming format
  if (video.video_url && video.video_url.includes('drive.google.com')) {
    try {
      return convertGoogleDriveToStreamingUrl(video.video_url);
    } catch (error) {
      console.error('Failed to convert Google Drive URL:', error);
      return video.video_url;
    }
  }
  
  // Return as-is for other URLs
  return video.video_url || '';
}

// Extract thumbnail from Google Drive video
export function getGoogleDriveThumbnail(shareUrl: string): string {
  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    return "/placeholder.svg";
  }
  
  // Google Drive provides thumbnail URLs for videos
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
} 