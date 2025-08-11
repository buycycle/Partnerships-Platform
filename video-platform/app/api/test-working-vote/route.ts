import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserVoteForVideo,
  getUserVoteCount,
  addVote, 
  removeVote, 
  getVoteCount,
  executeQuery
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TEST-WORKING] Testing vote with existing user...');
    
    // Use existing user ID from the constraint test
    const testUserId = '123826';  // This user exists!
    const testVideoId = '1';      // This video exists!
    const testVideoTitle = '#1 Adi';
    
    console.log('🔍 [TEST-WORKING] Test parameters:', { testUserId, testVideoId, testVideoTitle });
    
    // Step 1: Clean slate - remove any existing vote
    console.log('🔍 [TEST-WORKING] Step 1: Cleaning any existing votes...');
    try {
      await removeVote(testUserId, testVideoId);
      console.log('🔍 [TEST-WORKING] Cleaned existing votes');
    } catch (error) {
      console.log('🔍 [TEST-WORKING] No existing votes to clean');
    }
    
    // Step 2: Check initial state
    console.log('🔍 [TEST-WORKING] Step 2: Checking initial state...');
    const initialVoteCount = await getVoteCount(testVideoId);
    const initialUserVote = await getUserVoteForVideo(testUserId, testVideoId);
    const initialUserVoteCount = await getUserVoteCount(testUserId);
    
    console.log('🔍 [TEST-WORKING] Initial state:', {
      videoVoteCount: initialVoteCount,
      userHasVoted: !!initialUserVote,
      userTotalVotes: initialUserVoteCount
    });
    
    // Step 3: Add vote with existing user
    console.log('🔍 [TEST-WORKING] Step 3: Adding vote with existing user...');
    let addResult = null;
    try {
      addResult = await addVote(testUserId, testVideoId, testVideoTitle);
      console.log('✅ [TEST-WORKING] Vote added successfully:', addResult);
    } catch (error) {
      console.error('❌ [TEST-WORKING] Error adding vote:', error);
      addResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Step 4: Verify the vote was added
    console.log('🔍 [TEST-WORKING] Step 4: Verifying vote was added...');
    const afterAddVoteCount = await getVoteCount(testVideoId);
    const afterAddUserVote = await getUserVoteForVideo(testUserId, testVideoId);
    const afterAddUserVoteCount = await getUserVoteCount(testUserId);
    
    console.log('🔍 [TEST-WORKING] After add state:', {
      videoVoteCount: afterAddVoteCount,
      userHasVoted: !!afterAddUserVote,
      userTotalVotes: afterAddUserVoteCount
    });
    
    // Step 5: Direct database verification
    console.log('🔍 [TEST-WORKING] Step 5: Direct database verification...');
    const totalVotesQuery = 'SELECT COUNT(*) as total FROM video_votes';
    const totalVotesResult = await executeQuery(totalVotesQuery);
    
    const specificVoteQuery = 'SELECT * FROM video_votes WHERE user_id = ? AND video_id = ?';
    const specificVoteResult = await executeQuery(specificVoteQuery, [testUserId, testVideoId]);
    
    console.log('🔍 [TEST-WORKING] Direct verification:', {
      totalVotes: totalVotesResult,
      specificVote: specificVoteResult
    });
    
    // Step 6: Test removal
    console.log('🔍 [TEST-WORKING] Step 6: Testing vote removal...');
    let removeResult = null;
    if (afterAddUserVote) {
      try {
        removeResult = await removeVote(testUserId, testVideoId);
        console.log('✅ [TEST-WORKING] Vote removed successfully:', removeResult);
      } catch (error) {
        console.error('❌ [TEST-WORKING] Error removing vote:', error);
        removeResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    // Step 7: Final verification
    console.log('🔍 [TEST-WORKING] Step 7: Final verification...');
    const finalVoteCount = await getVoteCount(testVideoId);
    const finalUserVote = await getUserVoteForVideo(testUserId, testVideoId);
    const finalTotalVotes = await executeQuery(totalVotesQuery);
    
    console.log('🔍 [TEST-WORKING] Final state:', {
      videoVoteCount: finalVoteCount,
      userHasVoted: !!finalUserVote,
      totalVotesInDatabase: finalTotalVotes
    });
    
    return NextResponse.json({
      success: true,
      message: 'Working vote test completed',
      testResults: {
        testParams: { testUserId, testVideoId, testVideoTitle },
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
    console.error('❌ [TEST-WORKING] Working vote test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Working vote test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 