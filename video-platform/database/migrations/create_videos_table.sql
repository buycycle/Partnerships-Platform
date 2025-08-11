-- Videos Table
-- Stores video metadata with AWS S3 file references
CREATE TABLE `videos` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `thumbnail_url` text COLLATE utf8mb4_unicode_ci,
  `video_url` text COLLATE utf8mb4_unicode_ci,
  `duration` int DEFAULT NULL COMMENT 'Duration in seconds',
  `file_size` bigint DEFAULT NULL COMMENT 'File size in bytes',
  `aws_s3_bucket` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aws_s3_key` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aws_thumbnail_key` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_format` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'mp4',
  `resolution` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g., 1920x1080',
  `status` enum('processing','ready','error','deleted') COLLATE utf8mb4_unicode_ci DEFAULT 'processing',
  `upload_progress` tinyint DEFAULT 0 COMMENT 'Upload progress 0-100',
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'User who uploaded (optional)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `videos_status_index` (`status`),
  KEY `videos_created_at_index` (`created_at`),
  KEY `videos_created_by_index` (`created_by`),
  CONSTRAINT `videos_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update video_votes table to use proper foreign key to videos table
ALTER TABLE `video_votes` 
ADD CONSTRAINT `video_votes_video_id_foreign` 
FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE;

-- Create view for video statistics
CREATE VIEW `video_statistics` AS
SELECT 
  v.id,
  v.title,
  v.status,
  v.created_at,
  COALESCE(vote_counts.vote_count, 0) as vote_count,
  COALESCE(vote_counts.voter_ids, '') as voter_ids
FROM videos v
LEFT JOIN (
  SELECT 
    video_id,
    COUNT(*) as vote_count,
    GROUP_CONCAT(user_id) as voter_ids
  FROM video_votes
  GROUP BY video_id
) vote_counts ON v.id = vote_counts.video_id; 