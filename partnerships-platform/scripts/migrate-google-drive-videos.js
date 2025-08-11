// Migration script to add Google Drive videos to database
// Run with: node scripts/migrate-google-drive-videos.js

// Your Google Drive videos data
const googleDriveVideos = [
  {
    title: "Cycling Adventure #1",
    description: "Amazing cycling video submission",
    googleDriveUrl: "https://drive.google.com/file/d/13ApBzZgehRRwQJwn-2SElbcXc-cz3uUC/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #2",
    description: "Exciting cycling journey",
    googleDriveUrl: "https://drive.google.com/file/d/1N2qCiiJ3O8n5F5R3xm9OVDLCAbZ1B7DF/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #3",
    description: "Thrilling bike ride experience",
    googleDriveUrl: "https://drive.google.com/file/d/1cc5AXVGORhOpcuboh5Qk3ynzyKzvMQYu/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #4",
    description: "Epic cycling adventure",
    googleDriveUrl: "https://drive.google.com/file/d/1qHcQWtIeghkZrUrxRl8Ahdcr2hVZW4X9/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #5",
    description: "Spectacular bike journey",
    googleDriveUrl: "https://drive.google.com/file/d/1y67cwM629jV1RiS1V_3wQtkbECChf_0h/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #6",
    description: "Amazing cycling performance",
    googleDriveUrl: "https://drive.google.com/file/d/1OWkgwbHZPy-YJwkmKdgPlbPI0OCXbpwj/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #7",
    description: "Incredible bike ride",
    googleDriveUrl: "https://drive.google.com/file/d/18oUyFk1njdpFzxxSD_qRx9ELlGH_WmVp/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #8",
    description: "Outstanding cycling video",
    googleDriveUrl: "https://drive.google.com/file/d/1MNNf4vEc72MMqtcwJXYUaDUFaWVzRNhi/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #9",
    description: "Fantastic cycling experience",
    googleDriveUrl: "https://drive.google.com/file/d/1Fj0JrJtiAmjtOKwovR1MBsJN02bxZb-y/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #10",
    description: "Great bike adventure",
    googleDriveUrl: "https://drive.google.com/file/d/1LuCtaC6vCPmc0vHWhxpr5SPatM6s-U8E/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #11",
    description: "Exciting cycling submission",
    googleDriveUrl: "https://drive.google.com/file/d/1J8gXw7F0hVvAlr5bpmuFl8gPKzcC-wjy/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #12",
    description: "Impressive bike performance",
    googleDriveUrl: "https://drive.google.com/file/d/1WL4NIFl5Q64Wefba7sOFV9zlejoBNM6v/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #13",
    description: "Remarkable cycling journey",
    googleDriveUrl: "https://drive.google.com/file/d/1dYcwb496pcNpCRmjmwIdHX9hlwZ6pXox/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #14",
    description: "Awesome cycling video",
    googleDriveUrl: "https://drive.google.com/file/d/1MJIMO5Pdt8-3tbE7IUnpnJC3WwLp1lm2/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #15",
    description: "Epic bike ride experience",
    googleDriveUrl: "https://drive.google.com/file/d/1nTtmjUZEynCzrjPwniYo_rhaOG0A0JXy/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #16",
    description: "Incredible cycling adventure",
    googleDriveUrl: "https://drive.google.com/file/d/1KoVkK838iVIwKEX_I9I3pNLsvHVLuQzu/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #17",
    description: "Amazing bike journey",
    googleDriveUrl: "https://drive.google.com/file/d/1Hx5oXjWKZOsjjAAM_Dqo4F6nNqguaWo9/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #18",
    description: "Spectacular cycling video",
    googleDriveUrl: "https://drive.google.com/file/d/1gvA4eehTL2QpX22mS7ALVpjiUU_0nda6/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #19",
    description: "Great cycling performance",
    googleDriveUrl: "https://drive.google.com/file/d/1GPUVVp-uMJMHxQYXSi21q8NjXcxKnnMf/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #20",
    description: "Thrilling bike adventure",
    googleDriveUrl: "https://drive.google.com/file/d/1EVywIUtoFDToVlc_nEzdSgfRCj8xPkpg/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #21",
    description: "Outstanding cycling journey",
    googleDriveUrl: "https://drive.google.com/file/d/1irYhm0oLOqYwRmSbhWwX_xy8AUsYpxl8/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #22",
    description: "Fantastic bike ride",
    googleDriveUrl: "https://drive.google.com/file/d/1_FMzUtr83p6ayt_aEGLgjpP28JwD4jRv/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #23",
    description: "Exciting cycling experience",
    googleDriveUrl: "https://drive.google.com/file/d/1V1WbtfdLI8uf-6-7Himv8LSedoMBLZHy/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #24",
    description: "Impressive cycling video",
    googleDriveUrl: "https://drive.google.com/file/d/1YQ7n0NlZeXNVhUnVqtP4u_ttk74z2dOk/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #25",
    description: "Amazing cycling submission",
    googleDriveUrl: "https://drive.google.com/file/d/1KZQWstKWe9U85vIThq0ZxlZcS0B_M9He/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #26",
    description: "Incredible bike performance",
    googleDriveUrl: "https://drive.google.com/file/d/1ANzbL25UHyF5qGwj0Kjz2hulqxdy8DUO/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #27",
    description: "Epic cycling adventure",
    googleDriveUrl: "https://drive.google.com/file/d/1V3xoYcMOYSWCsEwh6n8pSbgXxivJC337/view?usp=sharing"
  },
  {
    title: "Cycling Adventure #28",
    description: "Spectacular bike journey",
    googleDriveUrl: "https://drive.google.com/file/d/17rI5Ru8LQIPAe3pSAkJILTjm4wT_qKTm/view?usp=sharing"
  }
];

// Helper functions
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

// Actual database function
async function insertVideo(videoData) {
  // Import the database function
  const { insertVideo: dbInsertVideo } = require('../lib/database');
  
  console.log(`📝 Inserting video: ${videoData.title} (ID: ${videoData.id})`);
  console.log(`   Description: ${videoData.description}`);
  console.log(`   File ID: ${videoData.aws_s3_key}`);
  
  try {
    // Call the actual database function
    const result = await dbInsertVideo(videoData);
    return result;
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
}

async function migrateGoogleDriveVideos() {
  console.log('🚀 Starting Google Drive video migration...');
  console.log(`📊 Total videos to migrate: ${googleDriveVideos.length}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, video] of googleDriveVideos.entries()) {
    try {
      console.log(`📹 Processing video ${index + 1}/${googleDriveVideos.length}: ${video.title}`);
      
      // Extract Google Drive file ID
      const fileId = extractGoogleDriveFileId(video.googleDriveUrl);
      
      if (!fileId) {
        console.error(`❌ Invalid Google Drive URL for: ${video.title}`);
        errorCount++;
        continue;
      }
      
      // Generate unique video ID
      const videoId = `video-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      
      // Insert into database with Google Drive file ID
      await insertVideo({
        id: videoId,
        title: video.title,
        description: video.description,
        aws_s3_key: fileId, // Store Google Drive file ID here
      });
      
      console.log(`✅ Migrated: ${video.title} (File ID: ${fileId})`);
      successCount++;
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error migrating ${video.title}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} videos`);
  console.log(`❌ Failed: ${errorCount} videos`);
  console.log(`📋 Total processed: ${successCount + errorCount} videos`);
  
  if (successCount > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('🔗 Your videos are now ready to use with Google Drive hosting.');
  } else {
    console.log('\n⚠️  Migration failed. Please check the errors above.');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateGoogleDriveVideos()
    .then(() => {
      console.log('\n✅ Migration script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateGoogleDriveVideos }; 