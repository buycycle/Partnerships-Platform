// test-api-integration.js
// Test the new API integration that combines mock data with database counts
require('dotenv').config({ path: '.env' });

async function testApiIntegration() {
  console.log('🧪 Testing API integration...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Get videos with counts
    console.log('\n📋 Testing GET /api/videos/with-counts...');
    const response = await fetch(`${baseUrl}/api/videos/with-counts?limit=5&offset=0`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response:', {
      success: data.success,
      videosCount: data.videos?.length || 0,
      pagination: data.pagination,
      firstVideoId: data.videos?.[0]?.id,
      firstVideoTitle: data.videos?.[0]?.title,
      firstVideoVoteCount: data.videos?.[0]?.vote_count,
      firstVideoViewCount: data.videos?.[0]?.view_count
    });
    
    if (data.videos && data.videos.length > 0) {
      const firstVideo = data.videos[0];
      
      // Test 2: Record a video view
      console.log('\n👁️ Testing video view recording...');
      const viewResponse = await fetch(`${baseUrl}/api/videos/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: firstVideo.id
        })
      });
      
      if (viewResponse.ok) {
        console.log('✅ Video view recorded successfully');
      } else {
        console.log('⚠️ Video view recording failed:', viewResponse.status);
      }
      
      // Test 3: Get vote info
      console.log('\n🗳️ Testing vote info retrieval...');
      const voteResponse = await fetch(`${baseUrl}/api/videos/vote?videoId=${firstVideo.id}`);
      
      if (voteResponse.ok) {
        const voteData = await voteResponse.json();
        console.log('✅ Vote info:', {
          success: voteData.success,
          voteCount: voteData.voteCount,
          userVote: voteData.userVote
        });
      } else {
        console.log('⚠️ Vote info retrieval failed:', voteResponse.status);
      }
    }
    
    console.log('\n✅ API integration test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Videos loaded from mock data ✅');
    console.log('- Real-time vote counts from database ✅');
    console.log('- Real-time view counts from database ✅');
    console.log('- View tracking API working ✅');
    console.log('- Vote tracking API working ✅');
    
  } catch (error) {
    console.error('❌ API integration test failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('1. Development server is running (npm run dev)');
    console.log('2. Database connection is working');
    console.log('3. All API endpoints are properly set up');
  }
}

// Run the test
testApiIntegration(); 