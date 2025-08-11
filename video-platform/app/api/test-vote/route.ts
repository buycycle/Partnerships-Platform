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
    console.log('🔍 [TEST-VOTE] Starting comprehensive vote test...');
    
    // Test parameters
    const testUserId = '4533903';
    const testVideoId = '1';
    const testVideoTitle = 'Test Video';
    
    console.log('🔍 [TEST-VOTE] Test parameters:', { testUserId, testVideoId, testVideoTitle });
    
    // Step 1: Check current state
    console.log('🔍 [TEST-VOTE] Step 1: Checking current state...');
    const initialVoteCount = await getVoteCount(testVideoId);
    const initialUserVote = await getUserVoteForVideo(testUserId, testVideoId);
    const initialUserVoteCount = await getUserVoteCount(testUserId);
    
    console.log('🔍 [TEST-VOTE] Initial state:', {
      videoVoteCount: initialVoteCount,
      userHasVoted: !!initialUserVote,
      userTotalVotes: initialUserVoteCount
    });
    
    // Step 2: Try to add a vote
    console.log('🔍 [TEST-VOTE] Step 2: Adding vote...');
    let addResult = null;
    try {
      if (initialUserVote) {
        console.log('🔍 [TEST-VOTE] User already voted, removing first...');
        await removeVote(testUserId, testVideoId);
      }
      
      addResult = await addVote(testUserId, testVideoId, testVideoTitle);
      console.log('✅ [TEST-VOTE] Vote added successfully:', addResult);
    } catch (error) {
      console.error('❌ [TEST-VOTE] Error adding vote:', error);
      addResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Step 3: Verify the vote was added
    console.log('🔍 [TEST-VOTE] Step 3: Verifying vote was added...');
    const afterAddVoteCount = await getVoteCount(testVideoId);
    const afterAddUserVote = await getUserVoteForVideo(testUserId, testVideoId);
    const afterAddUserVoteCount = await getUserVoteCount(testUserId);
    
    console.log('🔍 [TEST-VOTE] After add state:', {
      videoVoteCount: afterAddVoteCount,
      userHasVoted: !!afterAddUserVote,
      userTotalVotes: afterAddUserVoteCount
    });
    
    // Step 4: Direct database check
    console.log('🔍 [TEST-VOTE] Step 4: Direct database verification...');
    const directCountQuery = 'SELECT COUNT(*) as total FROM video_votes';
    const directCountResult = await executeQuery(directCountQuery);
    
    const directUserVoteQuery = 'SELECT * FROM video_votes WHERE user_id = ? AND video_id = ?';
    const directUserVoteResult = await executeQuery(directUserVoteQuery, [testUserId, testVideoId]);
    
    const directVideoVoteQuery = 'SELECT * FROM video_votes WHERE video_id = ?';
    const directVideoVoteResult = await executeQuery(directVideoVoteQuery, [testVideoId]);
    
    console.log('🔍 [TEST-VOTE] Direct database results:', {
      totalVotesInTable: directCountResult,
      userSpecificVote: directUserVoteResult,
      videoSpecificVotes: directVideoVoteResult
    });
    
    // Step 5: Test removal
    console.log('🔍 [TEST-VOTE] Step 5: Testing vote removal...');
    let removeResult = null;
    try {
      if (afterAddUserVote) {
        removeResult = await removeVote(testUserId, testVideoId);
        console.log('✅ [TEST-VOTE] Vote removed successfully:', removeResult);
      } else {
        console.log('🔍 [TEST-VOTE] No vote to remove');
      }
    } catch (error) {
      console.error('❌ [TEST-VOTE] Error removing vote:', error);
      removeResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Step 6: Final state check
    console.log('🔍 [TEST-VOTE] Step 6: Final state check...');
    const finalVoteCount = await getVoteCount(testVideoId);
    const finalUserVote = await getUserVoteForVideo(testUserId, testVideoId);
    const finalUserVoteCount = await getUserVoteCount(testUserId);
    
    const finalDirectCount = await executeQuery(directCountQuery);
    
    console.log('🔍 [TEST-VOTE] Final state:', {
      videoVoteCount: finalVoteCount,
      userHasVoted: !!finalUserVote,
      userTotalVotes: finalUserVoteCount,
      totalVotesInTable: finalDirectCount
    });
    
    return NextResponse.json({
      success: true,
      message: 'Vote test completed',
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
        directDatabaseCheck: {
          totalVotesInTable: directCountResult,
          userSpecificVote: directUserVoteResult,
          videoSpecificVotes: directVideoVoteResult
        },
        removeVoteResult: removeResult,
        finalState: {
          videoVoteCount: finalVoteCount,
          userHasVoted: !!finalUserVote,
          userTotalVotes: finalUserVoteCount,
          totalVotesInTable: finalDirectCount
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST-VOTE] Vote test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Vote test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 