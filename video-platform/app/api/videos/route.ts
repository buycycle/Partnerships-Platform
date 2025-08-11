import { NextRequest, NextResponse } from 'next/server';
import { 
  insertVideo, 
  updateVideoStatus, 
  getAllVideos, 
  getVideoById,
  deleteVideo,
  getVideosCount
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (videoId) {
      // Get specific video
      const video = await getVideoById(videoId);
      if (!video) {
        return NextResponse.json(
          { success: false, message: 'Video not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, video });
    } else {
      // Get all videos with pagination info
      const videos = await getAllVideos(limit, offset);
      const totalCount = await getVideosCount();
      
      return NextResponse.json({ 
        success: true, 
        videos,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + videos.length < totalCount
        }
      });
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      description, 
      google_drive_id, 
      thumbnail_url, 
      created_by 
    } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate unique video ID
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert video into database
    await insertVideo({
      id: videoId,
      title,
      description,
      google_drive_id,
      thumbnail_url,
      created_by
    });

    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
      videoId: videoId
    });

  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { videoId, status } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (status) {
      await updateVideoStatus(videoId, status);
    }

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully'
    });

  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      );
    }

    await deleteVideo(videoId);

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 