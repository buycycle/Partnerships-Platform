import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserVotes, 
  getUserVoteForVideo,
  getUserVoteCount,
  hasUserReachedMaxVotes,
  validateUserVoteLimit,
  addVote, 
  removeVote, 
  getVoteCount,
  executeQuery
} from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoTitle, userId } = await request.json();

    console.log('🔍 [DEBUG] POST /api/videos/vote - Starting vote operation');
    console.log('🔍 [DEBUG] Video ID:', videoId);
    console.log('🔍 [DEBUG] Video Title:', videoTitle);
    console.log('🔍 [DEBUG] User ID from request:', userId);

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get auth token for session validation (contact-form pattern)
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      console.log('❌ [DEBUG] No auth token found in Authorization header');
      return NextResponse.json(
        { success: false, message: 'Please log in to vote' },
        { status: 401 }
      );
    }

    console.log('🔍 [DEBUG] Validating user session with auth token...');
    const sessionValidation = validateUserSession(authToken);
    
    if (!sessionValidation.valid) {
      console.log('❌ [DEBUG] Session validation failed:', sessionValidation.error);
      return NextResponse.json(
        { success: false, message: 'Please log in to vote' },
        { status: 401 }
      );
    }

    console.log('✅ [DEBUG] Session validation successful');

    // Use the provided userId instead of extracting from token
    const userIdToUse = userId.toString();
    console.log('🔍 [DEBUG] Using User ID:', userIdToUse);
    
    // NEW: Verify the video exists and get its actual ID format
    console.log('🔍 [DEBUG] Verifying video exists...');
    const videoQuery = 'SELECT id, title, google_drive_id FROM videos WHERE id = ? OR google_drive_id = ?';
    const videoResult = await executeQuery(videoQuery, [videoId, videoId]);
    console.log('🔍 [DEBUG] Video lookup result:', videoResult);
    
    if (!videoResult || videoResult.length === 0) {
      console.log('❌ [DEBUG] Video not found:', videoId);
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    const video = videoResult[0];
    const actualVideoId = video.id; // Use the actual video ID from database
    const actualVideoTitle = video.title || videoTitle;
    
    console.log('🔍 [DEBUG] Using actual video ID:', actualVideoId);
    console.log('🔍 [DEBUG] Using actual video title:', actualVideoTitle);

    // ENHANCED VOTE LIMIT ENFORCEMENT
    console.log('🔍 [DEBUG] === STARTING ENHANCED VOTE VALIDATION ===');
    console.log('🔍 [DEBUG] User ID:', userIdToUse);
    console.log('🔍 [DEBUG] Video ID:', actualVideoId);
    
    // Step 1: Get comprehensive user vote data
    const userVoteCount = await getUserVoteCount(userIdToUse);
    const existingVoteForVideo = await getUserVoteForVideo(userIdToUse, actualVideoId);
    const userVotes = await getUserVotes(userIdToUse);
    
    console.log('🔍 [DEBUG] User vote analysis:');
    console.log('🔍 [DEBUG] - Total votes by user:', userVoteCount);
    console.log('🔍 [DEBUG] - Has voted for this video:', !!existingVoteForVideo);
    console.log('🔍 [DEBUG] - All user votes:', userVotes.map(v => ({ videoId: v.video_id, title: v.video_title })));
    
    if (existingVoteForVideo) {
      // User has already voted for this video - remove the vote
      console.log('🔍 [DEBUG] Removing existing vote for user:', userIdToUse, 'video:', actualVideoId);
      const removeResult = await removeVote(userIdToUse, actualVideoId);
      console.log('🔍 [DEBUG] Remove vote result:', removeResult);
      
      // Get updated vote count after removal
      const updatedVoteCount = await getVoteCount(actualVideoId);
      console.log('🔍 [DEBUG] Updated vote count after removal:', updatedVoteCount);
        
      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Vote removed successfully',
        currentVoteCount: updatedVoteCount
      });
    } else {
      // User hasn't voted for this video yet - STRICT 5-vote enforcement
      console.log('🔍 [DEBUG] Checking if user can add new vote...');
      console.log('🔍 [DEBUG] Current user vote count:', userVoteCount);
      console.log('🔍 [DEBUG] Max votes allowed: 5');
      
      // BULLETPROOF CHECK: Always enforce 5-vote limit
      if (userVoteCount >= 5) {
        console.log('❌ [DEBUG] VOTE LIMIT REACHED - User has already cast', userVoteCount, 'votes');
        console.log('❌ [DEBUG] Existing votes:', userVotes.map(v => `${v.video_id}: "${v.video_title}"`));
        
        return NextResponse.json({
          success: false,
          message: `You have reached the maximum number of votes (5). You have already voted for ${userVoteCount} videos. Please remove a vote before adding a new one.`,
          currentVoteCount: userVoteCount,
          maxVotesReached: true,
          userVotedVideos: userVotes.map(v => ({ id: v.video_id, title: v.video_title }))
        }, { status: 400 });
      }
      
             // Double-check: Verify user can vote (additional safety check)
       const hasMaxVotes = await hasUserReachedMaxVotes(userIdToUse);
       if (hasMaxVotes) {
         console.log('❌ [DEBUG] SECONDARY CHECK FAILED - hasUserReachedMaxVotes returned true');
         return NextResponse.json({
           success: false,
           message: 'You have reached the maximum number of votes (5). Please remove a vote before adding a new one.',
           currentVoteCount: userVoteCount,
           maxVotesReached: true
         }, { status: 400 });
       }
       
       // TRIPLE-CHECK: Use comprehensive validation function
       const finalValidation = await validateUserVoteLimit(userIdToUse, 'add');
       console.log('🔍 [DEBUG] FINAL VALIDATION CHECK:', finalValidation);
       
       if (!finalValidation.canVote) {
         console.log('❌ [DEBUG] FINAL VALIDATION FAILED - User cannot vote');
         return NextResponse.json({
           success: false,
           message: `You have reached the maximum number of votes (5). You have already voted for ${finalValidation.currentVoteCount} videos.`,
           currentVoteCount: finalValidation.currentVoteCount,
           maxVotesReached: true,
           userVotedVideos: finalValidation.votedVideos.map(v => ({ id: v.video_id, title: v.video_title }))
         }, { status: 400 });
       }
      
      // Add new vote with actual video ID
      console.log('🔍 [DEBUG] Adding new vote for user:', userIdToUse, 'video:', actualVideoId, 'title:', actualVideoTitle);
      console.log('🔍 [DEBUG] Vote will be:', userVoteCount + 1, 'out of 5 allowed');
      
      try {
        const addResult = await addVote(userIdToUse, actualVideoId, actualVideoTitle);
        console.log('🔍 [DEBUG] Add vote result:', addResult);
        
        // Verify the vote was actually added
        const newUserVoteCount = await getUserVoteCount(userIdToUse);
        console.log('🔍 [DEBUG] Verification - New user vote count:', newUserVoteCount);
        
        // Get updated vote count for this video
        const updatedVoteCount = await getVoteCount(actualVideoId);
        console.log('🔍 [DEBUG] Updated vote count for video:', updatedVoteCount);
        
        return NextResponse.json({
          success: true,
          action: 'added',
          message: `Vote added successfully! You have now voted for ${newUserVoteCount} out of 5 videos.`,
          currentVoteCount: updatedVoteCount,
          userVoteCount: newUserVoteCount
        });
        
      } catch (error) {
        console.error('❌ [DEBUG] Error in addVote:', error);
        // The addVote function includes its own max vote checks, so this should catch any edge cases
        return NextResponse.json({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to add vote',
          currentVoteCount: await getVoteCount(actualVideoId)
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('❌ [ERROR] Vote error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    console.log('🔍 [DEBUG] GET /api/videos/vote - Starting vote count check');
    console.log('🔍 [DEBUG] Video ID:', videoId);

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      );
    }

    // NEW: Get actual video ID format
    console.log('🔍 [DEBUG] Looking up actual video ID...');
    const videoQuery = 'SELECT id, title FROM videos WHERE id = ? OR google_drive_id = ?';
    const videoResult = await executeQuery(videoQuery, [videoId, videoId]);
    console.log('🔍 [DEBUG] Video lookup result:', videoResult);
    
    if (!videoResult || videoResult.length === 0) {
      console.log('❌ [DEBUG] Video not found:', videoId);
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    const actualVideoId = videoResult[0].id;
    console.log('🔍 [DEBUG] Using actual video ID for vote count:', actualVideoId);

    console.log('🔍 [DEBUG] Getting vote count for video:', actualVideoId);
    // Get vote count for specific video
    const voteCount = await getVoteCount(actualVideoId);
    console.log('🔍 [DEBUG] Vote count result:', voteCount);

    // Check if current user has voted (if authenticated)
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    let userVote = null;

    if (authToken) {
      console.log('🔍 [DEBUG] Validating user session for vote check...');
      const sessionValidation = validateUserSession(authToken);
      
      if (sessionValidation.valid && sessionValidation.tokenType === 'auth_token') {
        console.log('🔍 [DEBUG] Session valid - auth token format verified');
        // Note: Individual user vote checking now handled by client-side with user ID
      } else {
        console.log('❌ [DEBUG] Session validation failed for GET request:', sessionValidation.error);
      }
    } else {
      console.log('🔍 [DEBUG] No auth token provided for GET request - continuing without user vote info');
    }

    console.log('🔍 [DEBUG] Final GET response:', { voteCount, userVote: !!userVote });
    return NextResponse.json({
      success: true,
      voteCount,
      userVote
    });

  } catch (error) {
    console.error('❌ [ERROR] Get votes error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to validate session using auth token (contact-form pattern)
function validateUserSession(authToken: string) {
  console.log('🔍 [DEBUG] Validating user session with auth token...');
  console.log('🔍 [DEBUG] Token format:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
  console.log('🔍 [DEBUG] Token length:', authToken?.length || 0);
    
  if (!authToken) {
    console.log('❌ [DEBUG] No auth token provided');
    return { valid: false, error: 'No authentication token provided' };
  }
    
  // Validate token has reasonable format (contains pipe and has reasonable length)
  const containsPipe = authToken.includes('|');
  const hasReasonableLength = authToken.length > 20;
  const parts = authToken.split('|');
  
  console.log('🔍 [DEBUG] Token analysis:');
  console.log('🔍 [DEBUG] - Contains pipe:', containsPipe);
  console.log('🔍 [DEBUG] - Reasonable length (>20):', hasReasonableLength);
  console.log('🔍 [DEBUG] - Parts count:', parts.length);
  
  if (containsPipe && hasReasonableLength && parts.length === 2 && parts[0] && parts[1]) {
    // Basic format validation - token should have two parts separated by pipe
    const tokenId = parts[0];
    const tokenPart = parts[1];
    const tokenIdIsNumeric = /^\d+$/.test(tokenId);
    const tokenPartIsAlphaNumeric = /^[A-Za-z0-9]+$/.test(tokenPart);

    console.log('🔍 [DEBUG] - Token ID is numeric:', tokenIdIsNumeric);
    console.log('🔍 [DEBUG] - Token part is alphanumeric:', tokenPartIsAlphaNumeric);

    if (tokenIdIsNumeric && tokenPartIsAlphaNumeric) {
      console.log('✅ [DEBUG] Valid auth token format - session accepted');
      
      return { 
        valid: true,
        tokenType: 'auth_token'
      };
    } else {
      console.log('❌ [DEBUG] Token parts failed validation');
      return { 
        valid: false, 
        error: 'Invalid token format - parts validation failed' 
      };
    }
  }
  
  console.log('❌ [DEBUG] Invalid token format - basic structure failed');
  return { 
    valid: false, 
    error: 'Invalid token format - must be tokenId|tokenPart format'
  };
} 