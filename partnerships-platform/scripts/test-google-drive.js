// Simple test for Google Drive links
// Run with: node scripts/test-google-drive.js

// Test with first 3 actual Google Drive links
const testVideos = [
  "https://drive.google.com/file/d/13ApBzZgehRRwQJwn-2SElbcXc-cz3uUC/view?usp=sharing",
  "https://drive.google.com/file/d/1N2qCiiJ3O8n5F5R3xm9OVDLCAbZ1B7DF/view?usp=sharing",
  "https://drive.google.com/file/d/1cc5AXVGORhOpcuboh5Qk3ynzyKzvMQYu/view?usp=sharing",
];

// Extract Google Drive file ID from URL
function extractGoogleDriveFileId(shareUrl) {
  const patterns = [
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /file\/d\/([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = shareUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Convert Google Drive URL to direct video URL
function convertGoogleDriveToDirectUrl(shareUrl) {
  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Convert Google Drive URL to embed URL (for iframe)
function convertGoogleDriveToEmbedUrl(shareUrl) {
  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

// Convert Google Drive URL to thumbnail URL
function convertGoogleDriveToThumbnailUrl(shareUrl) {
  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL');
  }
  
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
}

function testGoogleDriveLinks() {
  console.log('🧪 Testing Google Drive links...\n');
  
  testVideos.forEach((url, index) => {
    console.log(`📹 Video ${index + 1}:`);
    console.log(`   Original: ${url}`);
    
    try {
      const fileId = extractGoogleDriveFileId(url);
      console.log(`   File ID: ${fileId}`);
      
      const directUrl = convertGoogleDriveToDirectUrl(url);
      console.log(`   Direct URL: ${directUrl}`);
      
      const embedUrl = convertGoogleDriveToEmbedUrl(url);
      console.log(`   Embed URL: ${embedUrl}`);
      
      const thumbnailUrl = convertGoogleDriveToThumbnailUrl(url);
      console.log(`   Thumbnail URL: ${thumbnailUrl}`);
      
      console.log(`   ✅ Valid\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error}\n`);
    }
  });
  
  console.log('🔗 Test these URLs in your browser:');
  console.log('\n📺 Embed URLs (should work in iframe):');
  testVideos.forEach((url, index) => {
    try {
      const embedUrl = convertGoogleDriveToEmbedUrl(url);
      console.log(`Video ${index + 1}: ${embedUrl}`);
    } catch (error) {
      console.log(`Video ${index + 1}: ERROR - ${error}`);
    }
  });
  
  console.log('\n🖼️ Thumbnail URLs:');
  testVideos.forEach((url, index) => {
    try {
      const thumbnailUrl = convertGoogleDriveToThumbnailUrl(url);
      console.log(`Video ${index + 1}: ${thumbnailUrl}`);
    } catch (error) {
      console.log(`Video ${index + 1}: ERROR - ${error}`);
    }
  });
}

testGoogleDriveLinks(); 