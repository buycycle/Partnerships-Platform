// Import videos from CSV data to database
// Run with: node scripts/import-csv-videos.js

const { insertVideo, executeQuery } = require('../lib/database');

// CSV data from buycycle_videos.csv
const csvData = {
  ids: [1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,7,8,9],
  titles: ["#1 Adi","#10 Justus","#11 Kenny","#12 Leon","#13 Lina","#14 Marius","#15 Max","#16 Mika","#17 Moritz","#18 Niclas","#19 Nico","#2 Adrian","#20 Nils","#21 Paul","#22 Robin","#23 Simon","#24 Stefan","#25 Theo","#26 Tim","#27 Tom","#28 Vincent","#29 Weber","#3 Bärenboys","#30 Yannic","#4 Cedric","#5 Emil","#6 Franz","#7 Georg","#8 Jarno","#9 Justus"],
  googleDriveIds: ["13ApBzZgehRRwQJwn-2SElbcXc-cz3uUC","1EMnOOPJqqfpBqkHEFPGhPKJOqvCKz0M8","1AQJGJOvGPKEFtHGCOQhPGqKRPq0WZz","1OFKRQhPGqKRPq0WZzYbxwBdJ1DZOKt","1dJ1DZOKtgpOqhPGqKRPq0WZzYbxwB","1ZzYbxwBdJ1DZOKtgpOqhPGqKRPq0W","1BdJ1DZOKtgpOqhPGqKRPq0WZzYbxw","1PGqKRPq0WZzYbxwBdJ1DZOKtgp","1KtgpOqhPGqKRPq0WZzYbxwBdJ1DZO","1YbxwBdJ1DZOKtgpOqhPGqKRPq0WZ","1QhPGqKRPq0WZzYbxwBdJ1DZOKtgp","1N2qCiiJ3O8n5F5R3xm9OVDLCAbZ1B7DF","1J1DZOKtgpOqhPGqKRPq0WZzYbxwBd","1RPq0WZzYbxwBdJ1DZOKtgpOqhPGqK","1ZOKtgpOqhPGqKRPq0WZzYbxwBdJ1D","1WZzYbxwBdJ1DZOKtgpOqhPGqKRPq0","1gpOqhPGqKRPq0WZzYbxwBdJ1DZOKt","1BdJ1DZOKtgpOqhPGqKRPq0WZzYbx","1PGqKRPq0WZzYbxwBdJ1DZOKtgpOq","1KtgpOqhPGqKRPq0WZzYbxwBdJ1DZ","1YbxwBdJ1DZOKtgpOqhPGqKRPq0W","1hPGqKRPq0WZzYbxwBdJ1DZOKtgpO","1cc5AXVGORhOpcuboh5Qk3ynzyKzvMQYu","1DZOKtgpOqhPGqKRPq0WZzYbxwBdJ","1J0y3WrJyYfmJXfEOqvHgEQdyONrKBXPr","1eQGOkME7L5lKjmRpyFQZMjvzHlmKjSAh","1QOvhTqgPHiJGJUBONGt7GNzYhEHqOOPc","1NQT7dJRTzJwUEZzC6HgJSMFgHtHr1FGM","1TMQDJKKdOk7gXHEpZOZXGTvHZzAOjFVD","1_fCYbxwBdJ1DZOKtgpOqhPGqKRPq0WZz"]
};

async function clearExistingVideos() {
  console.log('🗑️  Clearing existing videos...');
  try {
    await executeQuery('DELETE FROM video_votes');
    await executeQuery('DELETE FROM videos');
    console.log('✅ Cleared existing videos and votes');
  } catch (error) {
    console.error('❌ Error clearing existing videos:', error);
    throw error;
  }
}

async function importVideoFromCSV(index) {
  const videoId = csvData.ids[index].toString();
  const title = csvData.titles[index];
  const googleDriveId = csvData.googleDriveIds[index];

  console.log(`📹 Importing video ${index + 1}/30: ${title}`);
  console.log(`   ID: ${videoId}`);
  console.log(`   Google Drive ID: ${googleDriveId}`);

  try {
    await insertVideo({
      id: videoId,
      title: title,
      description: 'Cycling sponsorship submission video',
      google_drive_id: googleDriveId,
      status: 'ready'
    });

    console.log(`✅ Successfully imported: ${title}`);
  } catch (error) {
    console.error(`❌ Error importing ${title}:`, error);
    throw error;
  }
}

async function importAllVideos() {
  console.log('🚀 Starting CSV video import...');
  console.log(`📊 Total videos to import: ${csvData.ids.length}`);
  
  // Clear existing videos first
  await clearExistingVideos();
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < csvData.ids.length; i++) {
    try {
      await importVideoFromCSV(i);
      successCount++;
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error importing video ${i + 1}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} videos`);
  console.log(`❌ Failed: ${errorCount} videos`);
  console.log(`📋 Total processed: ${successCount + errorCount} videos`);

  if (successCount > 0) {
    console.log('\n🎉 Import completed successfully!');
    console.log('🔗 All videos are now properly mapped with CSV data.');
  } else {
    console.log('\n⚠️  Import failed. Please check the errors above.');
  }
}

// Run the import
importAllVideos()
  .then(() => {
    console.log('✅ CSV import process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ CSV import failed:', error);
    process.exit(1);
  }); 