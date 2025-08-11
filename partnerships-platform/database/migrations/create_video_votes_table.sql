-- Video Votes Table
-- Each user can vote for up to 5 videos total
CREATE TABLE `video_votes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `video_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `video_votes_user_video_unique` (`user_id`, `video_id`),
  KEY `video_votes_video_id_index` (`video_id`),
  KEY `video_votes_user_id_index` (`user_id`),
  KEY `video_votes_created_at_index` (`created_at`),
  CONSTRAINT `video_votes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for counting votes per video
CREATE INDEX `video_votes_video_id_count` ON `video_votes` (`video_id`);

-- Index for counting votes per user
CREATE INDEX `video_votes_user_id_count` ON `video_votes` (`user_id`);

-- View for vote counts per video
CREATE VIEW `video_vote_counts` AS
SELECT 
  `video_id`,
  COUNT(*) as `vote_count`,
  GROUP_CONCAT(`user_id`) as `voter_ids`
FROM `video_votes`
GROUP BY `video_id`; 

-- View for vote counts per user
CREATE VIEW `user_vote_counts` AS
SELECT 
  `user_id`,
  COUNT(*) as `vote_count`,
  GROUP_CONCAT(`video_id`) as `voted_video_ids`
FROM `video_votes`
GROUP BY `user_id`; 