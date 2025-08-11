import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { insertVideo } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No video file provided' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Video title is required' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Generate unique video ID
    const videoId = `video-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    // Save to database
    await insertVideo({
      id: videoId,
      title: title,
      description: description || '',
      aws_s3_key: blob.url, // Store blob URL in this field for now
    });

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: videoId,
        title,
        description,
        video_url: blob.url,
      },
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload video' },
      { status: 500 }
    );
  }
} 