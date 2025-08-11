import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TEST] Testing database connection...');
    
    // Show environment variables being used
    const dbConfig = {
      host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
      user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '(empty)',
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'buycycle',
      port: process.env.MYSQL_PORT || process.env.DB_PORT || '3306'
    };
    
    console.log('🔍 [TEST] Database config:', {
      ...dbConfig,
      password: dbConfig.password ? '***HIDDEN***' : '(empty)'
    });
    
    // Test basic connection
    const testQuery = 'SELECT 1 as test_value';
    const testResult = await executeQuery(testQuery);
    console.log('🔍 [TEST] Test query result:', testResult);
    
    // Check what database we're connected to
    const databaseQuery = 'SELECT DATABASE() as current_database';
    const databaseResult = await executeQuery(databaseQuery);
    console.log('🔍 [TEST] Current database:', databaseResult);
    
    // Check what tables exist in the current database
    const tablesQuery = 'SHOW TABLES';
    const tablesResult = await executeQuery(tablesQuery);
    console.log('🔍 [TEST] Available tables:', tablesResult);
    
    // Check if video_votes table exists specifically
    const tableExistsQuery = "SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'video_votes'";
    const tableExistsResult = await executeQuery(tableExistsQuery);
    console.log('🔍 [TEST] Video_votes table exists:', tableExistsResult);
    
    // Try to describe video_votes table
    let tableStructure = null;
    try {
      const tableQuery = 'DESCRIBE video_votes';
      tableStructure = await executeQuery(tableQuery);
      console.log('🔍 [TEST] Table structure result:', tableStructure);
    } catch (error) {
      console.log('❌ [TEST] Failed to describe video_votes table:', error);
    }
    
    // Try to count records in video_votes
    let recordCount = null;
    try {
      const countQuery = 'SELECT COUNT(*) as total_votes FROM video_votes';
      recordCount = await executeQuery(countQuery);
      console.log('🔍 [TEST] Record count result:', recordCount);
    } catch (error) {
      console.log('❌ [TEST] Failed to count video_votes records:', error);
    }
    
    // Check if users table exists (for foreign key)
    let usersTableExists = null;
    try {
      const usersExistsQuery = "SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'";
      usersTableExists = await executeQuery(usersExistsQuery);
      console.log('🔍 [TEST] Users table exists:', usersTableExists);
    } catch (error) {
      console.log('❌ [TEST] Failed to check users table:', error);
    }
    
    // Check if videos table exists (for foreign key)
    let videosTableExists = null;
    try {
      const videosExistsQuery = "SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'videos'";
      videosTableExists = await executeQuery(videosExistsQuery);
      console.log('🔍 [TEST] Videos table exists:', videosTableExists);
    } catch (error) {
      console.log('❌ [TEST] Failed to check videos table:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      results: {
        config: {
          ...dbConfig,
          password: dbConfig.password ? '***HIDDEN***' : '(empty)'
        },
        connection: testResult,
        currentDatabase: databaseResult,
        availableTables: tablesResult,
        videoVotesTableExists: tableExistsResult,
        usersTableExists: usersTableExists,
        videosTableExists: videosTableExists,
        tableStructure: tableStructure,
        recordCount: recordCount
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST] Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 