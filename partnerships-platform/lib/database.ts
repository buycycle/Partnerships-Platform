// Database connection helper
// Replace this with your actual MySQL connection setup

// Helper function to generate video URLs from Google Drive IDs
function generateVideoUrl(googleDriveId: string | null): string | null {
  if (!googleDriveId) return null;
  
  // Check if it's already a full URL
  if (googleDriveId.startsWith('http://') || googleDriveId.startsWith('https://')) {
    return googleDriveId;
  }
  
  // Generate Google Drive share URL from file ID
  return `https://drive.google.com/file/d/${googleDriveId}/view?usp=sharing`;
  }
  
// Helper function to generate thumbnail URLs from Google Drive IDs
function generateThumbnailUrl(googleDriveId: string | null): string {
  if (!googleDriveId) return '/placeholder.svg?height=200&width=300&text=Video+Thumbnail';
  
  // Check if it's already a full URL
  if (googleDriveId.startsWith('http://') || googleDriveId.startsWith('https://')) {
    // Extract file ID from full URL if needed
    const fileIdMatch = googleDriveId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w400-h300`;
    }
    return '/placeholder.svg?height=200&width=300&text=Video+Thumbnail';
  }
  
  // Generate Google Drive thumbnail URL from file ID
  return `https://drive.google.com/thumbnail?id=${googleDriveId}&sz=w400-h300`;
}

// Type definitions for better TypeScript support
interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  connectionLimit: number;
  connectTimeout: number;
  queueLimit: number;
  ssl: any;
}

interface DatabaseResult {
  affectedRows?: number;
  insertId?: number;
  [key: string]: any;
}

// Conditional import to prevent build errors
let mysql: any = null;
let pool: any = null;

try {
  if (typeof window === 'undefined') {
    console.log('🔍 [DB] Attempting to load mysql2/promise module...');
    mysql = require('mysql2/promise');
    console.log('✅ [DB] mysql2/promise module loaded successfully');
  } else {
    console.log('🔍 [DB] Running in browser, skipping MySQL module load');
  }
} catch (error) {
  console.error('❌ [DB] Failed to load MySQL module:', error);
  console.log('❌ [DB] MySQL module not available, using mock implementation');
}

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER?.trim() || process.env.DB_USER?.trim() || 'root',
  password: process.env.MYSQL_PASSWORD?.trim() || process.env.DB_PASSWORD?.trim() || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'buycycle',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
  connectionLimit: 5,
  connectTimeout: 5000, // Reduced timeout to fail faster
  queueLimit: 0,
  ssl: (process.env.MYSQL_HOST || process.env.DB_HOST)?.includes('rds.amazonaws.com') ? { 
    rejectUnauthorized: false,
    ca: undefined 
  } : false
};

// Debug: Log the database configuration (without sensitive data)
console.log('🔍 [DB] Database configuration loaded:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: !!dbConfig.ssl,
  envVars: {
    MYSQL_HOST: !!process.env.MYSQL_HOST,
    DB_HOST: !!process.env.DB_HOST,
    MYSQL_USER: !!process.env.MYSQL_USER,
    DB_USER: !!process.env.DB_USER,
    MYSQL_DATABASE: !!process.env.MYSQL_DATABASE,
    DB_NAME: !!process.env.DB_NAME
  }
});

function getPool() {
  console.log('🔍 [DB] getPool() called. Pool exists:', !!pool, 'MySQL module loaded:', !!mysql);
  
  if (!pool && mysql) {
    console.log('🔍 [DB] Creating new database pool...');
    
    // Allow all valid RDS hostnames to connect
    if (dbConfig.host.includes('rds.amazonaws.com')) {
      console.log('🔍 [DB] Valid RDS hostname detected, proceeding with connection');
    }
    
    console.log('🔍 [DB] Creating database connection pool...');
    console.log('🔍 [DB] Config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      connectionLimit: dbConfig.connectionLimit,
      ssl: !!dbConfig.ssl
    });
    
    try {
      pool = mysql.createPool(dbConfig);
      
      // Handle pool errors
      pool.on('error', (err: any) => {
        console.error('❌ [DB] Database pool error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.log('🔍 [DB] Database connection lost, recreating pool...');
          pool = null;
        }
      });
      
      console.log('✅ [DB] Database pool created successfully');
      
      // Test the connection immediately with detailed error logging
      pool.getConnection((err: any, connection: any) => {
        if (err) {
          console.error('❌ [DB] Failed to get test connection:', err);
          console.error('❌ [DB] Connection error details:', {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            message: err.message,
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            database: dbConfig.database
          });
          pool = null;
        } else {
          console.log('✅ [DB] Test connection successful');
          connection.release();
        }
      });
      
    } catch (error) {
      console.error('❌ [DB] Failed to create database pool:', error);
      return null;
    }
  }
  
  console.log('🔍 [DB] Pool status:', {
    poolExists: !!pool,
    mysqlAvailable: !!mysql,
    fallbackMode: !pool && !mysql
  });
  
  return pool;
}

// Execute query function with retry logic
export async function executeQuery(query: string, params: any[] = [], retries: number = 2): Promise<any> {
  console.log('🔍 [DB] executeQuery called with:', {
    query: query.substring(0, 100) + '...',
    params,
    retries
  });
  
  for (let attempt = 0; attempt <= retries; attempt++) {
  try {
    const connection = getPool();
    if (!connection) {
      // Mock response for development when MySQL is not available
        console.log('❌ [DB] Mock database query (NO CONNECTION):', query.substring(0, 100) + '...', params);
        console.log('❌ [DB] Returning empty array due to missing connection');
        return [];
    }
    
    console.log(`🔍 [DB] Database query attempt ${attempt + 1}:`, query.substring(0, 100) + '...');
    console.log(`🔍 [DB] Using connection pool:`, !!connection);
      
      // Execute query with parameters
    const [rows] = await connection.execute(query, params);
      console.log(`✅ [DB] Query successful, returned ${Array.isArray(rows) ? rows.length : 0} rows`);
      console.log(`✅ [DB] Query result:`, rows);
    return rows;
    } catch (error: any) {
      console.error(`❌ [DB] Database query error (attempt ${attempt + 1}):`, {
        code: error.code,
        message: error.message,
        sqlState: error.sqlState,
        errno: error.errno,
        query: query.substring(0, 100) + '...',
        params
      });
      
      // Check if it's a connection timeout or connection error
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        if (attempt < retries) {
          console.log(`🔍 [DB] Retrying in ${(attempt + 1) * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
          // Reset pool on connection errors
          pool = null;
          continue;
        }
      }
      
      // For authentication errors, don't retry
      if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_DBACCESS_DENIED_ERROR') {
        console.error('❌ [DB] Database authentication failed:', error.message);
        throw error;
      }
      
      // If we've exhausted retries or it's not a retryable error
      if (attempt === retries) {
        console.log('❌ [DB] Database connection failed after all retries, returning empty result');
        return [];
  }
    }
  }
  
  console.log('❌ [DB] executeQuery completed with no result');
  return [];
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const query = 'SELECT id, first_name, last_name, email FROM users WHERE id = ?';
    const result = await executeQuery(query, [userId]);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Check if user has voted (returns all user votes)
export async function getUserVotes(userId: string) {
  try {
    const query = 'SELECT video_id, video_title, created_at FROM video_votes WHERE user_id = ? ORDER BY created_at DESC';
    const result = await executeQuery(query, [userId]);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error getting user votes:', error);
    return [];
  }
}

// Check if user has voted for a specific video
export async function getUserVoteForVideo(userId: string, videoId: string) {
  console.log('🔍 [DB] getUserVoteForVideo called with:', { userId, videoId });
  
  try {
    const query = 'SELECT video_id, video_title, created_at FROM video_votes WHERE user_id = ? AND video_id = ?';
    console.log('🔍 [DB] Executing SELECT query:', query);
    console.log('🔍 [DB] Query parameters:', [userId, videoId]);
    
    const result = await executeQuery(query, [userId, videoId]);
    console.log('🔍 [DB] getUserVoteForVideo raw result:', result);
    
    const vote = Array.isArray(result) && result.length > 0 ? result[0] : null;
    console.log('✅ [DB] getUserVoteForVideo final result:', vote);
    
    return vote;
  } catch (error) {
    console.error('❌ [DB] Error getting user vote for video:', error);
    return null;
  }
}

// Get user vote count
export async function getUserVoteCount(userId: string) {
  try {
    const query = 'SELECT COUNT(*) as vote_count FROM video_votes WHERE user_id = ?';
    const result = await executeQuery(query, [userId]);
    return Array.isArray(result) && result.length > 0 ? result[0].vote_count : 0;
  } catch (error) {
    console.error('Error getting user vote count:', error);
    return 0;
  }
}

// Check if user has reached max votes (5)
export async function hasUserReachedMaxVotes(userId: string) {
  const voteCount = await getUserVoteCount(userId);
  return voteCount >= 5;
}

// ENHANCED: Comprehensive vote limit validation with detailed logging
export async function validateUserVoteLimit(userId: string, actionType: 'add' | 'check' = 'check') {
  console.log(`🔍 [DB-VALIDATION] ${actionType.toUpperCase()} - Validating vote limit for user:`, userId);
  
  try {
    // Get comprehensive user vote data
    const voteCount = await getUserVoteCount(userId);
    const userVotes = await getUserVotes(userId);
    
    console.log('🔍 [DB-VALIDATION] User vote summary:');
    console.log('🔍 [DB-VALIDATION] - Total votes:', voteCount);
    console.log('🔍 [DB-VALIDATION] - Max allowed: 5');
    console.log('🔍 [DB-VALIDATION] - Can vote:', voteCount < 5);
    console.log('🔍 [DB-VALIDATION] - Voted videos:', userVotes.map(v => v.video_id));
    
    const canVote = voteCount < 5;
    const remainingVotes = Math.max(0, 5 - voteCount);
    
    const validation = {
      canVote,
      currentVoteCount: voteCount,
      maxVotes: 5,
      remainingVotes,
      votedVideos: userVotes,
      hasReachedLimit: voteCount >= 5
    };
    
    console.log('✅ [DB-VALIDATION] Validation result:', validation);
    return validation;
    
  } catch (error) {
    console.error('❌ [DB-VALIDATION] Error validating vote limit:', error);
    // In case of error, be conservative and don't allow voting
    return {
      canVote: false,
      currentVoteCount: 0,
      maxVotes: 5,
      remainingVotes: 0,
      votedVideos: [],
      hasReachedLimit: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Add vote (with max 5 votes per user check)
export async function addVote(userId: string, videoId: string, videoTitle: string) {
  console.log('🔍 [DB] addVote called with:', { userId, videoId, videoTitle });
  
  try {
    // Ensure user exists (create if needed)
    console.log('🔍 [DB] Ensuring user exists...');
    await createUserIfNotExists(userId);
    console.log('✅ [DB] User exists or created successfully');
    
    // ENHANCED: Comprehensive validation using new validation function
    const validation = await validateUserVoteLimit(userId, 'add');
    console.log('🔍 [DB] Comprehensive validation result:', validation);
    
    if (!validation.canVote) {
      console.log('❌ [DB] User cannot vote - validation failed');
      console.log('❌ [DB] Current votes:', validation.currentVoteCount);
      console.log('❌ [DB] Voted for videos:', validation.votedVideos.map(v => v.video_id));
      throw new Error(`You have reached the maximum number of votes (5). You have already voted for ${validation.currentVoteCount} videos.`);
    }
    
    // Check if user has already voted for this video
    const existingVote = await getUserVoteForVideo(userId, videoId);
    console.log('🔍 [DB] Existing vote check result:', existingVote);
    
    if (existingVote) {
      console.log('❌ [DB] User has already voted for this video');
      throw new Error('You have already voted for this video');
    }

    // Legacy check (keeping for backward compatibility)
    const hasMaxVotes = await hasUserReachedMaxVotes(userId);
    console.log('🔍 [DB] Legacy max votes check result:', hasMaxVotes);
    
    if (hasMaxVotes) {
      console.log('❌ [DB] User has reached maximum votes (legacy check)');
      throw new Error('You have reached the maximum number of votes (5)');
    }

    const query = 'INSERT INTO video_votes (user_id, video_id, video_title) VALUES (?, ?, ?)';
    console.log('🔍 [DB] Executing INSERT query:', query);
    console.log('🔍 [DB] Query parameters:', [userId, videoId, videoTitle]);
    
    const result = await executeQuery(query, [userId, videoId, videoTitle]);
    console.log('✅ [DB] addVote result:', result);
    
    // Verify the record was actually inserted
    const verifyQuery = 'SELECT COUNT(*) as count FROM video_votes WHERE user_id = ? AND video_id = ?';
    const verifyResult = await executeQuery(verifyQuery, [userId, videoId]);
    console.log('🔍 [DB] Verification query result:', verifyResult);
    
    if (verifyResult && verifyResult.length > 0 && verifyResult[0].count > 0) {
      console.log('✅ [DB] Vote successfully persisted to database');
    } else {
      console.log('❌ [DB] WARNING: Vote may not have been persisted');
    }
    
    return result;
  } catch (error) {
    console.error('❌ [DB] Error adding vote:', error);
    throw error;
  }
}

// Update vote (not needed anymore in multi-vote system)
export async function updateVote(userId: string, videoId: string, videoTitle: string) {
  try {
    const query = 'UPDATE video_votes SET video_title = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND video_id = ?';
    const result = await executeQuery(query, [videoTitle, userId, videoId]);
    return result;
  } catch (error) {
    console.error('Error updating vote:', error);
    throw error;
  }
}

// Remove vote (remove specific vote)
export async function removeVote(userId: string, videoId: string) {
  console.log('🔍 [DB] removeVote called with:', { userId, videoId });
  
  try {
    const query = 'DELETE FROM video_votes WHERE user_id = ? AND video_id = ?';
    console.log('🔍 [DB] Executing DELETE query:', query);
    console.log('🔍 [DB] Query parameters:', [userId, videoId]);
    
    const result = await executeQuery(query, [userId, videoId]);
    console.log('✅ [DB] removeVote result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ [DB] Error removing vote:', error);
    throw error;
  }
}

// Get vote count for video
export async function getVoteCount(videoId: string) {
  console.log('🔍 [DB] getVoteCount called with:', { videoId });
  
  try {
    const query = 'SELECT COUNT(*) as vote_count FROM video_votes WHERE video_id = ?';
    console.log('🔍 [DB] Executing COUNT query:', query);
    console.log('🔍 [DB] Query parameters:', [videoId]);
    
    const result = await executeQuery(query, [videoId]);
    console.log('🔍 [DB] getVoteCount raw result:', result);
    
    const count = Array.isArray(result) && result.length > 0 ? result[0].vote_count : 0;
    console.log('✅ [DB] getVoteCount final result:', count);
    
    return count;
  } catch (error) {
    console.error('❌ [DB] Error getting vote count:', error);
    return 0;
  }
}

// ===== VIDEO MANAGEMENT FUNCTIONS =====

// Insert new video
export async function insertVideo(videoData: {
  id: string;
  title: string;
  description?: string;
  google_drive_id?: string;
  thumbnail_url?: string;
  created_by?: number;
}) {
  try {
    const query = `
      INSERT INTO videos (
        id, title, description, google_drive_id, thumbnail_url, 
        created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'processing')
    `;
    
    const result = await executeQuery(query, [
      videoData.id,
      videoData.title,
      videoData.description || '',
      videoData.google_drive_id || null,
      videoData.thumbnail_url || null,
      videoData.created_by || null
    ]);
    return result;
  } catch (error) {
    console.error('Error inserting video:', error);
    throw error;
  }
}

// Update video status
export async function updateVideoStatus(videoId: string, status: 'processing' | 'ready' | 'error' | 'deleted') {
  try {
    const query = 'UPDATE videos SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [status, videoId]);
    return result;
  } catch (error) {
    console.error('Error updating video status:', error);
    throw error;
  }
}

// Get video by ID with computed URLs and vote info
export async function getVideoById(videoId: string, userId?: number) {
  try {
    const query = `
      SELECT 
        v.*,
        COALESCE(vote_counts.vote_count, 0) as vote_count,
        CASE WHEN user_votes.user_id IS NOT NULL THEN 1 ELSE 0 END as user_has_voted
      FROM videos v
      LEFT JOIN (
        SELECT 
          video_id,
          COUNT(*) as vote_count
        FROM video_votes
        GROUP BY video_id
      ) vote_counts ON v.id = vote_counts.video_id
      LEFT JOIN video_votes user_votes ON v.id = user_votes.video_id AND user_votes.user_id = ?
      WHERE v.id = ? AND v.status != 'deleted'
    `;
    const result = await executeQuery(query, [userId || null, videoId]);
    
    if (Array.isArray(result) && result.length > 0) {
      const video = result[0];
      return {
        ...video,
        video_url: generateVideoUrl(video.google_drive_id),
        thumbnail_url: video.thumbnail_url || generateThumbnailUrl(video.google_drive_id),
        user_has_voted: Boolean(video.user_has_voted)
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting video:', error);
    return null;
  }
}

// Get all videos with vote counts and computed URLs
export async function getAllVideos(limit: number = 50, offset: number = 0, userId?: number) {
  try {
    // Use hardcoded query since parameter binding is having issues
    const query = `SELECT id, title, description, status, google_drive_id, thumbnail_url, created_at, updated_at FROM videos WHERE status = "ready" ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const result = await executeQuery(query);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    // Simple processing without complex operations
    return result.map((video: any) => ({
      id: video.id,
      title: video.title,
      description: video.description || '',
      status: video.status,
      created_at: video.created_at,
      updated_at: video.updated_at,
      video_url: generateVideoUrl(video.google_drive_id),
      thumbnail_url: generateThumbnailUrl(video.google_drive_id),
      vote_count: 0,
      user_has_voted: false
    }));
  } catch (error) {
    console.error('Error getting videos:', error);
    return [];
  }
}

// Get total count of ready videos
export async function getVideosCount() {
  try {
    const query = 'SELECT COUNT(*) as total FROM videos WHERE status = "ready"';
    const result = await executeQuery(query);
    return Array.isArray(result) && result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error getting videos count:', error);
    return 0;
  }
}

// Delete video (soft delete)
export async function deleteVideo(videoId: string) {
  try {
    const query = 'UPDATE videos SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [videoId]);
    return result;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

// Check if video exists in database
export async function videoExists(videoId: string) {
  try {
    const query = 'SELECT COUNT(*) as count FROM videos WHERE id = ? AND status != "deleted"';
    const result = await executeQuery(query, [videoId]);
    return Array.isArray(result) && result.length > 0 && result[0].count > 0;
  } catch (error) {
    console.error('Error checking video existence:', error);
    return false;
  }
} 

// Create user if not exists (for vote system)
export async function createUserIfNotExists(userId: string, userData: {
  firstName?: string,
  lastName?: string, 
  email?: string
} = {}) {
  console.log('🔍 [DB] createUserIfNotExists called with:', { userId, userData });
  
  try {
    // Check if user already exists
    const existingUser = await getUserById(userId);
    if (existingUser) {
      console.log('✅ [DB] User already exists:', existingUser);
      return existingUser;
    }
    
    // Create new user with default values
    const defaultFirstName = userData.firstName || 'User';
    const defaultLastName = userData.lastName || userId;
    const defaultEmail = userData.email || `user${userId}@buycycle.com`;
    
    const insertQuery = `
      INSERT INTO users (id, first_name, last_name, email, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    console.log('🔍 [DB] Creating new user with query:', insertQuery);
    console.log('🔍 [DB] Parameters:', [userId, defaultFirstName, defaultLastName, defaultEmail]);
    
    const result = await executeQuery(insertQuery, [userId, defaultFirstName, defaultLastName, defaultEmail]);
    console.log('✅ [DB] User created successfully:', result);
    
    // Return the newly created user
    return await getUserById(userId);
    
  } catch (error) {
    console.error('❌ [DB] Error creating user:', error);
    throw error;
  }
} 

// ===== MIGRATION TRACKING FUNCTIONS =====

// Record migration request
export async function recordMigrationRequest(migrationData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  requestIp?: string;
  userAgent?: string;
}) {
  console.log('🔍 [DB] recordMigrationRequest called with:', {
    ...migrationData,
    requestIp: migrationData.requestIp,
    userAgent: migrationData.userAgent?.substring(0, 50) + '...'
  });
  
  try {
    const query = `
      INSERT INTO partnerships_everide_users (
        first_name, last_name, email, phone_number, 
        migration_status, migration_source, request_ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        phone_number = VALUES(phone_number),
        migration_status = 'pending',
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const result = await executeQuery(query, [
      migrationData.firstName,
      migrationData.lastName,
      migrationData.email,
      migrationData.phoneNumber || null,
      'pending',
      'everide_partnerships_platform',
      migrationData.requestIp || null,
      migrationData.userAgent || null
    ]);
    
    console.log('✅ [DB] Migration request recorded:', result);
    return result;
  } catch (error) {
    console.error('❌ [DB] Error recording migration request:', error);
    throw error;
  }
}

// Update migration status
export async function updateMigrationStatus(
  email: string, 
  status: 'pending' | 'success' | 'failed' | 'duplicate',
  buycycleUserId?: string,
  buycycleResponse?: any
) {
  console.log('🔍 [DB] updateMigrationStatus called with:', {
    email,
    status,
    buycycleUserId,
    hasResponse: !!buycycleResponse
  });
  
  try {
    const query = `
      UPDATE partnerships_everide_users 
      SET migration_status = ?, 
          buycycle_user_id = ?, 
          buycycle_response = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `;
    
    const result = await executeQuery(query, [
      status,
      buycycleUserId || null,
      buycycleResponse ? JSON.stringify(buycycleResponse) : null,
      email
    ]);
    
    console.log('✅ [DB] Migration status updated:', result);
    return result;
  } catch (error) {
    console.error('❌ [DB] Error updating migration status:', error);
    throw error;
  }
}

// Get migration request by email
export async function getMigrationByEmail(email: string) {
  try {
    const query = 'SELECT * FROM partnerships_everide_users WHERE email = ? ORDER BY created_at DESC LIMIT 1';
    const result = await executeQuery(query, [email]);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('❌ [DB] Error getting migration by email:', error);
    return null;
  }
}

// Get all migration requests with pagination
export async function getAllMigrationRequests(limit: number = 50, offset: number = 0, status?: string) {
  try {
    let query = `
      SELECT id, first_name, last_name, email, phone_number, 
             migration_status, migration_source, buycycle_user_id,
             created_at, updated_at
      FROM partnerships_everide_users
    `;
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE migration_status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await executeQuery(query, params);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('❌ [DB] Error getting migration requests:', error);
    return [];
  }
}

// Get migration statistics
export async function getMigrationStats() {
  try {
    const query = `
      SELECT 
        migration_status,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM partnerships_everide_users 
      GROUP BY migration_status, DATE(created_at)
      ORDER BY date DESC, migration_status
    `;
    
    const result = await executeQuery(query);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('❌ [DB] Error getting migration stats:', error);
    return [];
  }
}

// Add migration audit log entry
export async function addMigrationAuditLog(partnershipsEverideUserId: number, action: string, details?: any) {
  try {
    const query = `
      INSERT INTO partnerships_everide_audit_log (partnerships_everide_user_id, action, details)
      VALUES (?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      partnershipsEverideUserId,
      action,
      details ? JSON.stringify(details) : null
    ]);
    
    return result;
  } catch (error) {
    console.error('❌ [DB] Error adding migration audit log:', error);
    return null;
  }
}

 