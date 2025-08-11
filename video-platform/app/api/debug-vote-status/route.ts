import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserVotes, 
  getUserVoteCount,
  validateUserVoteLimit
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-VOTE-STATUS] Starting vote status check...');
    
    // Get auth token for session validation
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Please log in to check vote status' },
        { status: 401 }
      );
    }

    // Validate session using the same logic as vote endpoint
    const sessionValidation = validateUserSession(authToken);
    
    if (!sessionValidation.valid) {
      return NextResponse.json(
        { success: false, message: 'Please log in to check vote status' },
        { status: 401 }
      );
    }

    const userId = sessionValidation.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid user session' },
        { status: 401 }
      );
    }
    
    console.log('🔍 [DEBUG-VOTE-STATUS] Checking status for user:', userId);

    // Get comprehensive vote data
    const userVoteCount = await getUserVoteCount(userId);
    const userVotes = await getUserVotes(userId);
    const validation = await validateUserVoteLimit(userId, 'check');
    
    const status = {
      userId,
      totalVotes: userVoteCount,
      maxVotes: 5,
      remainingVotes: Math.max(0, 5 - userVoteCount),
      canVoteMore: userVoteCount < 5,
      hasReachedLimit: userVoteCount >= 5,
      votedVideos: userVotes.map(vote => ({
        videoId: vote.video_id,
        videoTitle: vote.video_title,
        votedAt: vote.created_at
      })),
      validation: validation
    };
    
    console.log('✅ [DEBUG-VOTE-STATUS] Status result:', status);
    
    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('❌ [DEBUG-VOTE-STATUS] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function (copied from vote endpoint)
function validateUserSession(authToken: string) {
  if (!authToken) {
    return { valid: false, error: 'No authentication token provided' };
  }
    
  const containsPipe = authToken.includes('|');
  const hasReasonableLength = authToken.length > 20;
  const parts = authToken.split('|');
  
  if (containsPipe && hasReasonableLength && parts.length === 2 && parts[0] && parts[1]) {
    const userId = parts[0];
    const tokenPart = parts[1];
    const userIdIsNumeric = /^\d+$/.test(userId);
    const tokenPartIsAlphaNumeric = /^[A-Za-z0-9]+$/.test(tokenPart);

    if (userIdIsNumeric && tokenPartIsAlphaNumeric) {
      return { 
        valid: true, 
        userId: userId,
        tokenType: 'auth_token'
      };
    }
  }
  
  return { 
    valid: false, 
    error: 'Invalid authentication token format' 
  };
} 