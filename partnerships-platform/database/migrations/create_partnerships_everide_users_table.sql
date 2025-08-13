-- Partnerships Everide Users Table
-- Tracks all migration attempts from Everide to Buycycle

CREATE TABLE IF NOT EXISTS partnerships_everide_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- User Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  
  -- Migration Details
  migration_status ENUM('pending', 'success', 'failed', 'duplicate') NOT NULL DEFAULT 'pending',
  migration_source VARCHAR(50) NOT NULL DEFAULT 'everide_partnerships_platform',
  
  -- Buycycle Integration
  buycycle_user_id VARCHAR(100) NULL,
  buycycle_response JSON NULL,
  
  -- Request Tracking
  request_ip VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_migration_status (migration_status),
  INDEX idx_created_at (created_at),
  
  -- Prevent duplicate email requests
  UNIQUE KEY unique_email_migration (email)
);

-- Optional: Create audit log table for detailed tracking
CREATE TABLE IF NOT EXISTS partnerships_everide_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partnerships_everide_user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (partnerships_everide_user_id) REFERENCES partnerships_everide_users(id) ON DELETE CASCADE,
  INDEX idx_partnerships_everide_user (partnerships_everide_user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
