import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserVoteForVideo,
  getUserVoteCount,
  addVote, 
  removeVote, 
  getVoteCount,
  executeQuery,
  createUserIfNotExists
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TEST-GD] Testing vote with Google Drive video IDs...');
    
    // Use actual Google Drive ID from your CSV data
    const testUserId = '4533903';  // Your user ID from auth token
    const testVideoGoogleDriveId = '13ApBzZgehRRwQJwn-2SElbcXc-cz3uUC';  // #1 Adi from CSV
    const testVideoTitle = '#1 Adi';
    
    console.log('🔍 [TEST-GD] Test parameters:', { 
      testUserId, 
      testVideoGoogleDriveId, 
      testVideoTitle 
    });
    
    // Step 1: Ensure user exists (create if needed)
    console.log('🔍 [TEST-GD] Step 1: Ensuring user exists...');
    try {
      await createUserIfNotExists(testUserId, {
        firstName: 'Test',
        lastName: 'User',
        email: `user${testUserId}@buycycle.com`
      });
      console.log('✅ [TEST-GD] User created/verified successfully');
    } catch (error) {
      console.error('❌ [TEST-GD] Error creating user:', error);
    }
    
    // Step 2: Look up the actual video by Google Drive ID
    console.log('🔍 [TEST-GD] Step 2: Looking up video by Google Drive ID...');
    const videoQuery = 'SELECT id, title, google_drive_id FROM videos WHERE google_drive_id = ? OR id = ?';
    const videoResult = await executeQuery(videoQuery, [testVideoGoogleDriveId, testVideoGoogleDriveId]);
    console.log('🔍 [TEST-GD] Video lookup result:', videoResult);
    
    if (!videoResult || videoResult.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Video not found with Google Drive ID',
        testData: { testVideoGoogleDriveId }
      });
    }
    
    const video = videoResult[0];
    const actualVideoId = video.id;
    const actualVideoTitle = video.title;
    
    console.log('🔍 [TEST-GD] Using actual video ID:', actualVideoId);
    console.log('🔍 [TEST-GD] Using actual video title:', actualVideoTitle);
    
    // Step 3: Clean any existing votes
    console.log('🔍 [TEST-GD] Step 3: Cleaning existing votes...');
    try {
      await removeVote(testUserId, actualVideoId);
      console.log('🔍 [TEST-GD] Cleaned existing votes');
    } catch (error) {
      console.log('🔍 [TEST-GD] No existing votes to clean');
    }
    
    // Step 4: Check initial state
    console.log('🔍 [TEST-GD] Step 4: Checking initial state...');
    const initialVoteCount = await getVoteCount(actualVideoId);
    const initialUserVote = await getUserVoteForVideo(testUserId, actualVideoId);
    const initialUserVoteCount = await getUserVoteCount(testUserId);
    
    console.log('🔍 [TEST-GD] Initial state:', {
      videoVoteCount: initialVoteCount,
      userHasVoted: !!initialUserVote,
      userTotalVotes: initialUserVoteCount
    });
    
    // Step 5: Add vote
    console.log('🔍 [TEST-GD] Step 5: Adding vote...');
    let addResult = null;
    try {
      addResult = await addVote(testUserId, actualVideoId, actualVideoTitle);
      console.log('✅ [TEST-GD] Vote added successfully:', addResult);
    } catch (error) {
      console.error('❌ [TEST-GD] Error adding vote:', error);
      addResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Step 6: Verify the vote was added
    console.log('🔍 [TEST-GD] Step 6: Verifying vote was added...');
    const afterAddVoteCount = await getVoteCount(actualVideoId);
    const afterAddUserVote = await getUserVoteForVideo(testUserId, actualVideoId);
    const afterAddUserVoteCount = await getUserVoteCount(testUserId);
    
    console.log('🔍 [TEST-GD] After add state:', {
      videoVoteCount: afterAddVoteCount,
      userHasVoted: !!afterAddUserVote,
      userTotalVotes: afterAddUserVoteCount
    });
    
    // Step 7: Direct database verification
    console.log('🔍 [TEST-GD] Step 7: Direct database verification...');
    const totalVotesQuery = 'SELECT COUNT(*) as total FROM video_votes';
    const totalVotesResult = await executeQuery(totalVotesQuery);
    
    const specificVoteQuery = 'SELECT * FROM video_votes WHERE user_id = ? AND video_id = ?';
    const specificVoteResult = await executeQuery(specificVoteQuery, [testUserId, actualVideoId]);
    
    console.log('🔍 [TEST-GD] Direct verification:', {
      totalVotes: totalVotesResult,
      specificVote: specificVoteResult
    });
    
    // Step 8: Test removal
    console.log('🔍 [TEST-GD] Step 8: Testing vote removal...');
    let removeResult = null;
    if (afterAddUserVote) {
      try {
        removeResult = await removeVote(testUserId, actualVideoId);
        console.log('✅ [TEST-GD] Vote removed successfully:', removeResult);
      } catch (error) {
        console.error('❌ [TEST-GD] Error removing vote:', error);
        removeResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    // Step 9: Final verification
    console.log('🔍 [TEST-GD] Step 9: Final verification...');
    const finalVoteCount = await getVoteCount(actualVideoId);
    const finalUserVote = await getUserVoteForVideo(testUserId, actualVideoId);
    const finalTotalVotes = await executeQuery(totalVotesQuery);
    
    console.log('🔍 [TEST-GD] Final state:', {
      videoVoteCount: finalVoteCount,
      userHasVoted: !!finalUserVote,
      totalVotesInDatabase: finalTotalVotes
    });
    
    return NextResponse.json({
      success: true,
      message: 'Google Drive ID vote test completed',
      testResults: {
        testParams: { 
          testUserId, 
          testVideoGoogleDriveId, 
          actualVideoId,
          testVideoTitle: actualVideoTitle 
        },
        videoLookup: video,
        initialState: {
          videoVoteCount: initialVoteCount,
          userHasVoted: !!initialUserVote,
          userTotalVotes: initialUserVoteCount
        },
        addVoteResult: addResult,
        afterAddState: {
          videoVoteCount: afterAddVoteCount,
          userHasVoted: !!afterAddUserVote,
          userTotalVotes: afterAddUserVoteCount
        },
        directVerification: {
          totalVotes: totalVotesResult,
          specificVote: specificVoteResult
        },
        removeResult: removeResult,
        finalState: {
          videoVoteCount: finalVoteCount,
          userHasVoted: !!finalUserVote,
          totalVotesInDatabase: finalTotalVotes
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST-GD] Google Drive vote test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Google Drive vote test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 