# 🎥 Complete Video Storage & AWS Integration Guide

## 📋 **Overview**
This system provides complete video management with AWS S3 storage, database tracking, and voting functionality.

## 🗄️ **1. Database Setup**

### Run Both SQL Migrations:

```sql
-- 1. First, create the videos table
-- Run: database/migrations/create_videos_table.sql

-- 2. Then, create the video_votes table  
-- Run: database/migrations/create_video_votes_table.sql
```

This creates:
- **`videos` table** - Stores video metadata and AWS references
- **`video_votes` table** - Tracks user votes (linked to videos)
- **Foreign key relationship** - Ensures vote integrity

## ☁️ **2. AWS S3 Setup**

### Create S3 Bucket:
1. Go to AWS S3 Console
2. Create bucket: `buycycle-videos` (or your preferred name)
3. Set up IAM user with S3 permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": [
                "arn:aws:s3:::buycycle-videos/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::buycycle-videos"
            ]
        }
    ]
}
```

### S3 Bucket Structure:
```
buycycle-videos/
├── videos/
│   ├── video_1234567890_abc123.mp4
│   ├── video_1234567891_def456.mov
│   └── ...
└── thumbnails/
    ├── video_1234567890_abc123_thumb.jpg
    ├── video_1234567891_def456_thumb.jpg
    └── ...
```

## 🔧 **3. Environment Variables**

Add to your `.env.local`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=buycycle
DB_PORT=3306

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=buycycle-videos

# Existing Auth Variables
NEXT_PUBLIC_BUYCYCLE_API_URL=https://api.buycycle.com
NEXT_PUBLIC_BUYCYCLE_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_google_client_id
APPLE_CLIENT_ID=your_apple_client_id
```

## 📦 **4. Install Dependencies**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 🎯 **5. How Video Upload Works**

### Upload Flow:
```
1. User uploads video file
2. Generate unique video ID
3. Get presigned S3 upload URL
4. Upload video directly to S3
5. Save video metadata to database
6. Process/validate video
7. Update status to 'ready'
8. Video appears in platform
```

## 📊 **6. Insert Videos Into Database**

### Method 1: Manual Insert (for existing videos)
```sql
INSERT INTO videos (
  id, title, description, video_url, thumbnail_url,
  aws_s3_bucket, aws_s3_key, aws_thumbnail_key,
  status, created_at
) VALUES (
  'video_001',
  'Mountain Biking Adventure',
  'Epic mountain biking through scenic trails',
  'https://buycycle-videos.s3.us-east-1.amazonaws.com/videos/video_001.mp4',
  'https://buycycle-videos.s3.us-east-1.amazonaws.com/thumbnails/video_001_thumb.jpg',
  'buycycle-videos',
  'videos/video_001.mp4',
  'thumbnails/video_001_thumb.jpg',
  'ready',
  NOW()
);
```

### Method 2: Via API (programmatic)
```javascript
// Create video entry
const response = await fetch('/api/videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Mountain Biking Adventure',
    description: 'Epic mountain biking through scenic trails',
    aws_s3_key: 'videos/video_001.mp4',
    aws_thumbnail_key: 'thumbnails/video_001_thumb.jpg',
    aws_s3_bucket: 'buycycle-videos',
    duration: 300, // seconds
    file_size: 50000000, // bytes
    resolution: '1920x1080'
  })
});
```

## 🔄 **7. Video ID Association**

### Database Relationships:
```sql
-- videos table (primary)
id = 'video_001'

-- video_votes table (references videos)
video_id = 'video_001' (FOREIGN KEY → videos.id)
user_id = 12345 (FOREIGN KEY → users.id)
```

### How Voting Works:
```sql
-- When user votes for video_001:
INSERT INTO video_votes (user_id, video_id, video_title) 
VALUES (12345, 'video_001', 'Mountain Biking Adventure');

-- Get vote count for video:
SELECT COUNT(*) FROM video_votes WHERE video_id = 'video_001';

-- Get videos with vote counts:
SELECT 
  v.*,
  COALESCE(vote_counts.vote_count, 0) as vote_count
FROM videos v
LEFT JOIN (
  SELECT video_id, COUNT(*) as vote_count
  FROM video_votes
  GROUP BY video_id
) vote_counts ON v.id = vote_counts.video_id;
```

## 🚀 **8. API Endpoints**

### Video Management:
```
GET    /api/videos           - Get all videos
GET    /api/videos?id=video_001  - Get specific video
POST   /api/videos           - Create new video
PUT    /api/videos           - Update video status/progress
DELETE /api/videos?id=video_001  - Delete video
```

### Voting:
```
POST   /api/videos/vote      - Vote for video
GET    /api/videos/vote?videoId=video_001  - Get vote info
```

## 💾 **9. Sample Data Insert Script**

```sql
-- Insert sample videos
INSERT INTO videos (id, title, description, video_url, thumbnail_url, aws_s3_bucket, aws_s3_key, aws_thumbnail_key, status) VALUES
('video_mountain_001', 'Mountain Bike Adventure', 'Experience breathtaking mountain trails', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/videos/video_mountain_001.mp4', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/thumbnails/video_mountain_001_thumb.jpg', 'buycycle-videos', 'videos/video_mountain_001.mp4', 'thumbnails/video_mountain_001_thumb.jpg', 'ready'),
('video_urban_002', 'Urban Cycling Guide', 'Navigate city streets safely', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/videos/video_urban_002.mp4', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/thumbnails/video_urban_002_thumb.jpg', 'buycycle-videos', 'videos/video_urban_002.mp4', 'thumbnails/video_urban_002_thumb.jpg', 'ready'),
('video_road_003', 'Road Bike Performance', 'Professional road cycling techniques', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/videos/video_road_003.mp4', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/thumbnails/video_road_003_thumb.jpg', 'buycycle-videos', 'videos/video_road_003.mp4', 'thumbnails/video_road_003_thumb.jpg', 'ready'),
('video_ebike_004', 'E-Bike Technology', 'Latest in electric bike technology', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/videos/video_ebike_004.mp4', 'https://buycycle-videos.s3.us-east-1.amazonaws.com/thumbnails/video_ebike_004_thumb.jpg', 'buycycle-videos', 'videos/video_ebike_004.mp4', 'thumbnails/video_ebike_004_thumb.jpg', 'ready');

-- Verify data
SELECT v.*, COALESCE(vc.vote_count, 0) as current_votes 
FROM videos v 
LEFT JOIN (SELECT video_id, COUNT(*) as vote_count FROM video_votes GROUP BY video_id) vc 
ON v.id = vc.video_id;
```

## 🔍 **10. Testing Queries**

### Check video-vote relationships:
```sql
-- See all videos with their vote counts
SELECT 
  v.id,
  v.title,
  v.status,
  COUNT(vv.id) as votes,
  GROUP_CONCAT(u.first_name, ' ', u.last_name) as voters
FROM videos v
LEFT JOIN video_votes vv ON v.id = vv.video_id
LEFT JOIN users u ON vv.user_id = u.id
GROUP BY v.id, v.title, v.status;

-- Find most popular video
SELECT 
  v.title,
  COUNT(vv.id) as vote_count
FROM videos v
LEFT JOIN video_votes vv ON v.id = vv.video_id
GROUP BY v.id, v.title
ORDER BY vote_count DESC
LIMIT 1;
```

## 🎯 **11. Video Upload Component (Future)**

You can create a video upload component that:
1. Validates file type/size
2. Gets presigned S3 URL
3. Uploads directly to S3
4. Creates database entry
5. Shows upload progress
6. Updates status when complete

## ✅ **12. Final Verification**

After setup, verify:
- [ ] Database tables created
- [ ] AWS S3 bucket configured
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Can insert videos via SQL/API
- [ ] Videos appear in platform
- [ ] Voting works on real videos
- [ ] Vote counts are accurate

## 🎉 **You're Done!**

Your platform now has:
- ✅ **Complete video storage** (AWS S3)
- ✅ **Database video management**
- ✅ **Vote tracking per video**
- ✅ **User-video associations**
- ✅ **RESTful API endpoints**
- ✅ **Production-ready architecture**

Videos uploaded to AWS S3 will automatically get video IDs that connect to your voting system! 🚀 