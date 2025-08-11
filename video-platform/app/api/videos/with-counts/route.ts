import { NextRequest, NextResponse } from 'next/server';
import { mockVideos } from '@/lib/mock-data';
import { 
  getVoteCount, 
  getUserVotes, 
  getUserVoteCount, 
  getUserVoteForVideo 
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get paginated videos from mock data
    const paginatedVideos = mockVideos.slice(offset, offset + limit);

    // Get user authentication info
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    let user = null;
    let userVoteData = null;

    if (token) {
      // Get user from token
      user = await getCurrentUserFromToken(token);
      
      if (user) {
        // Get user's vote information once
        const userVotes = await getUserVotes(user.id);
        const userVoteCount = await getUserVoteCount(user.id);
        
        userVoteData = {
          hasVoted: userVotes.length > 0,
          votedVideoIds: userVotes.map(vote => vote.video_id),
          currentVoteCount: userVoteCount,
          canVoteMore: userVoteCount < 5
        };
      }
    }

    // Get vote counts for all videos in parallel
      const videosWithCounts = await Promise.all(
        paginatedVideos.map(async (video) => {
        const voteCount = await getVoteCount(video.id);
        
        // Add user-specific vote info if user is authenticated
        const userVoteInfo = userVoteData ? {
          ...userVoteData,
          hasVotedForThisVideo: userVoteData.votedVideoIds.includes(video.id)
        } : null;

          return {
            ...video,
            vote_count: voteCount,
          user_vote_info: userVoteInfo
          };
        })
      );

      return NextResponse.json({
        success: true,
        videos: videosWithCounts,
        pagination: {
          limit,
          offset,
        total: mockVideos.length,
        hasMore: offset + limit < mockVideos.length
        }
      });

  } catch (error) {
    console.error('Error fetching videos with counts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// Helper function to get user from token
async function getCurrentUserFromToken(token: string) {
  try {
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;
    
    if (!apiKey) {
      console.error('CRITICAL: X_PROXY_AUTHORIZATION environment variable is not set!');
      return null;
    }
    
    // Use the same v4 API endpoint as contact form
    const response = await fetch(`${buycycleApiUrl}/en/api/v4/user`, {
      headers: {
        'X-Custom-Authorization': token,
        'X-Proxy-Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }

    return null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
} 