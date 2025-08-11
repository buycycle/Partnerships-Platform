// AWS S3 Integration for Video Storage
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from './env';

// AWS S3 Client Configuration
const s3Client = new S3Client({
  region: env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 Configuration
export const S3_CONFIG = {
  BUCKET_NAME: env.AWS_S3_BUCKET_NAME || 'buycycle-videos',
  REGION: env.AWS_REGION || 'us-east-1',
  VIDEO_FOLDER: 'videos/',
  THUMBNAIL_FOLDER: 'thumbnails/',
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Generate unique video ID
export function generateVideoId(): string {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate S3 key for video
export function generateVideoKey(videoId: string, originalName: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'mp4';
  return `${S3_CONFIG.VIDEO_FOLDER}${videoId}.${extension}`;
}

// Generate S3 key for thumbnail
export function generateThumbnailKey(videoId: string): string {
  return `${S3_CONFIG.THUMBNAIL_FOLDER}${videoId}_thumb.jpg`;
}

// Get presigned URL for video upload
export async function getVideoUploadUrl(videoId: string, fileName: string, fileType: string): Promise<string> {
  try {
    if (!S3_CONFIG.ALLOWED_VIDEO_TYPES.includes(fileType)) {
      throw new Error(`Invalid file type. Allowed types: ${S3_CONFIG.ALLOWED_VIDEO_TYPES.join(', ')}`);
    }

    const key = generateVideoKey(videoId, fileName);
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Metadata: {
        'uploaded-by': 'buycycle-video-platform',
        'video-id': videoId,
      },
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return signedUrl;
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw error;
  }
}

// Get presigned URL for thumbnail upload
export async function getThumbnailUploadUrl(videoId: string, fileType: string): Promise<string> {
  try {
    if (!S3_CONFIG.ALLOWED_IMAGE_TYPES.includes(fileType)) {
      throw new Error(`Invalid file type. Allowed types: ${S3_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    const key = generateThumbnailKey(videoId);
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Metadata: {
        'uploaded-by': 'buycycle-video-platform',
        'video-id': videoId,
        'type': 'thumbnail',
      },
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return signedUrl;
  } catch (error) {
    console.error('Error generating thumbnail upload URL:', error);
    throw error;
  }
}

// Get public URL for S3 object
export function getS3PublicUrl(key: string): string {
  return `https://${S3_CONFIG.BUCKET_NAME}.s3.${S3_CONFIG.REGION}.amazonaws.com/${key}`;
}

// Delete video from S3
export async function deleteVideoFromS3(videoKey: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: videoKey,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting video from S3:', error);
    throw error;
  }
}

// Delete thumbnail from S3
export async function deleteThumbnailFromS3(thumbnailKey: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: thumbnailKey,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting thumbnail from S3:', error);
    throw error;
  }
}

// Validate video file
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!S3_CONFIG.ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${S3_CONFIG.ALLOWED_VIDEO_TYPES.join(', ')}`
    };
  }

  if (file.size > S3_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${S3_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
}

// Validate thumbnail file
export function validateThumbnailFile(file: File): { valid: boolean; error?: string } {
  if (!S3_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${S3_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit for thumbnails
    return {
      valid: false,
      error: 'Thumbnail too large. Maximum size: 5MB'
    };
  }

  return { valid: true };
} 