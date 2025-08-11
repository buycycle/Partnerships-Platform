import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [VOTE-CHECK] Simple vote validation check...');
    
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get auth token for session validation
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Please log in to vote' },
        { status: 401 }
      );
    }

    // Validate token format only
    const sessionValidation = validateUserSession(authToken);
    
    if (!sessionValidation.valid) {
      return NextResponse.json(
        { success: false, message: 'Please log in to vote' },
        { status: 401 }
      );
    }

    console.log('🔍 [VOTE-CHECK] Checking vote count for user:', userId);

    // SIMPLE SQL CHECK: Count total votes for this user
    const query = 'SELECT COUNT(*) as vote_count FROM video_votes WHERE user_id = ?';
    const result = await executeQuery(query, [userId]);
    
    const voteCount = Array.isArray(result) && result.length > 0 ? result[0].vote_count : 0;
    const canVote = voteCount < 5;
    const remainingVotes = Math.max(0, 5 - voteCount);
    
    console.log('🔍 [VOTE-CHECK] User vote status:', {
      userId,
      currentVotes: voteCount,
      canVote,
      remainingVotes
    });
    
    return NextResponse.json({
      success: true,
      canVote,
      currentVotes: voteCount,
      maxVotes: 5,
      remainingVotes,
      message: canVote 
        ? `You can vote ${remainingVotes} more times` 
        : 'You have reached the maximum number of votes (5)'
    });

  } catch (error) {
    console.error('❌ [VOTE-CHECK] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple token validation function
function validateUserSession(authToken: string) {
  if (!authToken) {
    return { valid: false, error: 'No authentication token provided' };
  }
    
  const containsPipe = authToken.includes('|');
  const hasReasonableLength = authToken.length > 20;
  const parts = authToken.split('|');
  
  if (containsPipe && hasReasonableLength && parts.length === 2 && parts[0] && parts[1]) {
    const tokenId = parts[0];
    const tokenPart = parts[1];
    const tokenIdIsNumeric = /^\d+$/.test(tokenId);
    const tokenPartIsAlphaNumeric = /^[A-Za-z0-9]+$/.test(tokenPart);

    if (tokenIdIsNumeric && tokenPartIsAlphaNumeric) {
      return { 
        valid: true,
        tokenType: 'auth_token'
      };
    }
  }
  
  return { 
    valid: false, 
    error: 'Invalid token format'
  };
} 