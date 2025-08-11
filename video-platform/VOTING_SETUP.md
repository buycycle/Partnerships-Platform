# 🗳️ Video Voting System Setup Guide

## Overview
This voting system allows authenticated users to vote for **ONE video only** across the entire platform. Each user can change their vote but can never vote for multiple videos simultaneously.

## 🗄️ Database Setup

### 1. Run the SQL Migration
Execute the SQL script in `database/migrations/create_video_votes_table.sql`:

```sql
-- Video Votes Table
-- Each user can vote for only ONE video total
CREATE TABLE `video_votes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `video_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `video_votes_user_id_unique` (`user_id`),
  KEY `video_votes_video_id_index` (`video_id`),
  KEY `video_votes_created_at_index` (`created_at`),
  CONSTRAINT `video_votes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for counting votes per video
CREATE INDEX `video_votes_video_id_count` ON `video_votes` (`video_id`);

-- View for vote counts per video
CREATE VIEW `video_vote_counts` AS
SELECT 
  `video_id`,
  COUNT(*) as `vote_count`,
  GROUP_CONCAT(`user_id`) as `voter_ids`
FROM `video_votes`
GROUP BY `video_id`;
```

### 2. Environment Variables
Add these to your `.env.local` file:

```env
# Database Configuration for Video Voting
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=buycycle
DB_PORT=3306

# Existing Auth Variables
NEXT_PUBLIC_BUYCYCLE_API_URL=https://api.buycycle.com
NEXT_PUBLIC_BUYCYCLE_API_KEY=your_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id
APPLE_CLIENT_ID=your_apple_client_id
```

## 📦 Dependencies Installation

```bash
npm install mysql2
```

## 🎯 How It Works

### User Flow:
1. **Unauthenticated User**: Sees vote buttons but clicking opens login modal
2. **Authenticated User - No Vote**: Can vote for any video
3. **Authenticated User - Has Voted**: 
   - Clicking same video = removes vote (unlike)
   - Clicking different video = changes vote to new video
   - Warning message shows when changing votes

### Technical Implementation:
- **One Vote Per User**: Enforced by unique constraint on `user_id`
- **Authentication Required**: All voting requires valid auth token
- **Real-time Updates**: Vote counts update immediately after voting
- **Database Integrity**: Foreign key ensures user exists

## 🎨 UI Components

### VoteButton Component
- Shows current vote count
- Indicates if user has voted (heart filled)
- Shows "Change Vote" when user voted for different video
- Handles authentication flow

### Video Card Integration
- Vote button in top-right overlay
- Vote section at bottom of card
- Clean, modern design with hover effects

## 🔒 Security Features

- **Authentication Validation**: Every vote requires valid token
- **CSRF Protection**: State validation in OAuth flows  
- **Rate Limiting**: Database constraints prevent vote spam
- **User Verification**: Token validated against Buycycle API

## 📊 Database Queries You Can Run

### See all votes:
```sql
SELECT 
  vv.*, 
  u.first_name, 
  u.last_name, 
  u.email 
FROM video_votes vv 
JOIN users u ON vv.user_id = u.id 
ORDER BY vv.created_at DESC;
```

### Vote counts per video:
```sql
SELECT * FROM video_vote_counts ORDER BY vote_count DESC;
```

### Users who voted for specific video:
```sql
SELECT 
  u.first_name, 
  u.last_name, 
  u.email, 
  vv.created_at 
FROM video_votes vv 
JOIN users u ON vv.user_id = u.id 
WHERE vv.video_id = 'your_video_id'
ORDER BY vv.created_at DESC;
```

### Users who haven't voted yet:
```sql
SELECT 
  u.id, 
  u.first_name, 
  u.last_name, 
  u.email 
FROM users u 
LEFT JOIN video_votes vv ON u.id = vv.user_id 
WHERE vv.user_id IS NULL;
```

## 🚀 API Endpoints

### POST `/api/videos/vote`
Vote for a video (add/change/remove)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "videoId": "video_123",
  "videoTitle": "Amazing Video Title"
}
```

**Responses:**
- `action: "added"` - New vote added
- `action: "changed"` - Vote changed to different video
- `action: "removed"` - Vote removed (unliked same video)

### GET `/api/videos/vote?videoId=video_123`
Get vote count and user's vote status

**Response:**
```json
{
  "success": true,
  "voteCount": 42,
  "userVote": {
    "hasVoted": true,
    "votedVideoId": "video_123", 
    "isCurrentVideo": true
  }
}
```

## 🔧 Troubleshooting

### Common Issues:

1. **MySQL Connection Error**
   - Check database credentials in `.env.local`
   - Ensure MySQL server is running
   - Verify database exists

2. **Authentication Failing**
   - Check if Buycycle API credentials are correct
   - Verify token is being passed in headers
   - Check network connectivity to API

3. **Vote Not Saving**
   - Check database table exists
   - Verify foreign key constraint (user must exist)
   - Check database permissions

4. **UI Not Updating**
   - Check browser console for errors
   - Verify API endpoints are responding
   - Check React contexts are properly wrapped

## 📈 Analytics Queries

### Daily vote activity:
```sql
SELECT 
  DATE(created_at) as vote_date,
  COUNT(*) as votes_count
FROM video_votes 
GROUP BY DATE(created_at)
ORDER BY vote_date DESC;
```

### Most popular videos:
```sql
SELECT 
  video_id,
  video_title,
  COUNT(*) as votes
FROM video_votes 
GROUP BY video_id, video_title
ORDER BY votes DESC
LIMIT 10;
```

### Vote changes (updates):
```sql
SELECT 
  video_id,
  video_title,
  user_id,
  created_at,
  updated_at,
  TIMESTAMPDIFF(MINUTE, created_at, updated_at) as minutes_to_change
FROM video_votes 
WHERE created_at != updated_at
ORDER BY updated_at DESC;
```

## ✅ Testing Checklist

- [ ] Database table created successfully
- [ ] Environment variables configured
- [ ] MySQL2 dependency installed
- [ ] Can login/logout successfully
- [ ] Vote button shows for unauthenticated users
- [ ] Login modal opens when unauthenticated user votes
- [ ] Authenticated user can vote successfully
- [ ] Vote count updates immediately
- [ ] User can change vote to different video
- [ ] User can remove vote (unlike same video)
- [ ] Only one vote per user enforced
- [ ] Vote data persists in database
- [ ] API endpoints return correct responses

## 🎉 You're Done!

Your video voting system is now fully functional with:
- ✅ One vote per user constraint
- ✅ Authentication required
- ✅ Real-time UI updates  
- ✅ Database persistence
- ✅ Vote changing capability
- ✅ Clean, modern interface 