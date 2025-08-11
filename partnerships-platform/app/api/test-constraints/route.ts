import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TEST-CONSTRAINTS] Testing foreign key constraints...');
    
    const testUserId = '4533903';
    const testVideoId = '1';
    
    // Test 1: Check if user exists
    console.log('🔍 [TEST-CONSTRAINTS] Checking if user exists...');
    const userExistsQuery = 'SELECT id, first_name, last_name, email FROM users WHERE id = ?';
    const userExistsResult = await executeQuery(userExistsQuery, [testUserId]);
    console.log('🔍 [TEST-CONSTRAINTS] User exists result:', userExistsResult);
    
    // Test 2: Check if video exists
    console.log('🔍 [TEST-CONSTRAINTS] Checking if video exists...');
    const videoExistsQuery = 'SELECT id, title FROM videos WHERE id = ?';
    const videoExistsResult = await executeQuery(videoExistsQuery, [testVideoId]);
    console.log('🔍 [TEST-CONSTRAINTS] Video exists result:', videoExistsResult);
    
    // Test 3: Check data types
    console.log('🔍 [TEST-CONSTRAINTS] Checking data types...');
    const userIdAsInt = parseInt(testUserId);
    const userIdAsString = testUserId;
    
    console.log('🔍 [TEST-CONSTRAINTS] Data type analysis:', {
      originalUserId: testUserId,
      asInteger: userIdAsInt,
      asString: userIdAsString,
      isValidInteger: !isNaN(userIdAsInt)
    });
    
    // Test 4: Try INSERT with different data types
    console.log('🔍 [TEST-CONSTRAINTS] Testing INSERT with integer user_id...');
    let insertTestResult = null;
    try {
      const insertQuery = 'INSERT INTO video_votes (user_id, video_id, video_title) VALUES (?, ?, ?)';
      insertTestResult = await executeQuery(insertQuery, [userIdAsInt, testVideoId, 'Test Video']);
      console.log('✅ [TEST-CONSTRAINTS] INSERT with integer succeeded:', insertTestResult);
      
      // Clean up the test record
      const deleteQuery = 'DELETE FROM video_votes WHERE user_id = ? AND video_id = ?';
      await executeQuery(deleteQuery, [userIdAsInt, testVideoId]);
      console.log('🔍 [TEST-CONSTRAINTS] Test record cleaned up');
      
    } catch (error) {
      console.error('❌ [TEST-CONSTRAINTS] INSERT with integer failed:', error);
      insertTestResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Test 5: Try INSERT with string user_id
    console.log('🔍 [TEST-CONSTRAINTS] Testing INSERT with string user_id...');
    let insertStringTestResult = null;
    try {
      const insertQuery = 'INSERT INTO video_votes (user_id, video_id, video_title) VALUES (?, ?, ?)';
      insertStringTestResult = await executeQuery(insertQuery, [userIdAsString, testVideoId, 'Test Video']);
      console.log('✅ [TEST-CONSTRAINTS] INSERT with string succeeded:', insertStringTestResult);
      
      // Clean up the test record
      const deleteQuery = 'DELETE FROM video_votes WHERE user_id = ? AND video_id = ?';
      await executeQuery(deleteQuery, [userIdAsString, testVideoId]);
      console.log('🔍 [TEST-CONSTRAINTS] Test record cleaned up');
      
    } catch (error) {
      console.error('❌ [TEST-CONSTRAINTS] INSERT with string failed:', error);
      insertStringTestResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Test 6: Check foreign key constraints
    console.log('🔍 [TEST-CONSTRAINTS] Checking foreign key constraints...');
    const constraintsQuery = `
      SELECT 
        CONSTRAINT_NAME, 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'video_votes' 
      AND TABLE_SCHEMA = DATABASE() 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `;
    const constraintsResult = await executeQuery(constraintsQuery);
    console.log('🔍 [TEST-CONSTRAINTS] Foreign key constraints:', constraintsResult);
    
    // Test 7: Check if we can create a user and video for testing
    console.log('🔍 [TEST-CONSTRAINTS] Testing with existing user/video...');
    const someUserQuery = 'SELECT id FROM users LIMIT 1';
    const someUserResult = await executeQuery(someUserQuery);
    
    const someVideoQuery = 'SELECT id FROM videos LIMIT 1';
    const someVideoResult = await executeQuery(someVideoQuery);
    
    console.log('🔍 [TEST-CONSTRAINTS] Available users:', someUserResult);
    console.log('🔍 [TEST-CONSTRAINTS] Available videos:', someVideoResult);
    
    return NextResponse.json({
      success: true,
      message: 'Constraint testing completed',
      results: {
        testParams: { testUserId, testVideoId },
        userExists: userExistsResult,
        videoExists: videoExistsResult,
        dataTypes: {
          originalUserId: testUserId,
          asInteger: userIdAsInt,
          asString: userIdAsString,
          isValidInteger: !isNaN(userIdAsInt)
        },
        insertWithInteger: insertTestResult,
        insertWithString: insertStringTestResult,
        foreignKeyConstraints: constraintsResult,
        availableUsers: someUserResult,
        availableVideos: someVideoResult
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST-CONSTRAINTS] Constraint test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Constraint test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 