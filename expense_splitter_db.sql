-- =====================================================================
-- BRAINWARE UNIVERSITY (BWU)
-- DEPARTMENT OF COMPUTATIONAL SCIENCES (CSS)
-- FULL STACK PROJECT 2: SHARED EXPENSE SPLITTER APPLICATION
-- DEVELOPER: SUMAN KUMAR DAS (STUDENT CODE: BWU/BCA/24/255)
-- COURSE: BACHELOR OF COMPUTER APPLICATIONS (BCA) FINAL YEAR
-- DATABASE SCRIPT: expense_splitter_db.sql
-- =====================================================================

-- 1. CREATE DATABASE
CREATE DATABASE IF NOT EXISTS `expense_splitter_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `expense_splitter_db`;

-- =====================================================================
-- TABLE 1: users
-- Stores dynamically added group members and participants
-- =====================================================================
DROP TABLE IF EXISTS `expense_splits`;
DROP TABLE IF EXISTS `settlements`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `group_members`;
DROP TABLE IF EXISTS `expense_groups`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `student_code` VARCHAR(50) NULL,
  `email` VARCHAR(100) NULL,
  `avatar` VARCHAR(20) DEFAULT '👤',
  `is_current_user` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 2: expense_groups
-- Stores groups created dynamically by users (e.g. Tour, Flat, Project)
-- =====================================================================
CREATE TABLE `expense_groups` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(20) DEFAULT '👥',
  `created_by` VARCHAR(50) NULL,
  `created_at` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 3: group_members
-- Maps many-to-many relationship between participants and expense groups
-- =====================================================================
CREATE TABLE `group_members` (
  `group_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`, `user_id`),
  CONSTRAINT `fk_gm_group` FOREIGN KEY (`group_id`) REFERENCES `expense_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 4: expenses
-- Stores master expense transactions
-- =====================================================================
CREATE TABLE `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `group_id` VARCHAR(50) NOT NULL,
  `paid_by` VARCHAR(50) NOT NULL,
  `split_type` VARCHAR(30) DEFAULT 'EQUAL',
  `expense_date` DATE NOT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_exp_group` (`group_id`),
  INDEX `idx_exp_payer` (`paid_by`),
  CONSTRAINT `fk_exp_group` FOREIGN KEY (`group_id`) REFERENCES `expense_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exp_payer` FOREIGN KEY (`paid_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 5: expense_splits
-- Stores breakdown of how much each participant owes for an expense
-- =====================================================================
CREATE TABLE `expense_splits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expense_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `share_amount` DECIMAL(10,2) NOT NULL,
  INDEX `idx_split_exp` (`expense_id`),
  INDEX `idx_split_user` (`user_id`),
  CONSTRAINT `fk_split_exp` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_split_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 6: settlements
-- Stores cleared payments between students
-- =====================================================================
CREATE TABLE `settlements` (
  `id` VARCHAR(50) PRIMARY KEY,
  `from_user_id` VARCHAR(50) NOT NULL,
  `to_user_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `settlement_date` DATE NOT NULL,
  `notes` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_set_from` (`from_user_id`),
  INDEX `idx_set_to` (`to_user_id`),
  CONSTRAINT `fk_set_from` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_set_to` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- USEFUL ANALYTICAL SQL QUERIES (FOR COLLEGE PROJECT VIVA)
-- =====================================================================
-- 1. Total spending by Category:
-- SELECT category, COUNT(*) AS total_bills, SUM(amount) AS total_spent
-- FROM expenses GROUP BY category ORDER BY total_spent DESC;
--
-- 2. Total amount paid by each student:
-- SELECT u.name, SUM(e.amount) AS total_paid_out_of_pocket
-- FROM expenses e JOIN users u ON e.paid_by = u.id GROUP BY u.id, u.name;
--
-- 3. Net balance query for each student:
-- SELECT 
--   u.name,
--   COALESCE(paid.total_paid, 0) AS total_paid,
--   COALESCE(owed.total_owed, 0) AS total_share_owed,
--   (COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0)) AS net_balance
-- FROM users u
-- LEFT JOIN (SELECT paid_by, SUM(amount) AS total_paid FROM expenses GROUP BY paid_by) paid ON u.id = paid.paid_by
-- LEFT JOIN (SELECT user_id, SUM(share_amount) AS total_owed FROM expense_splits GROUP BY user_id) owed ON u.id = owed.user_id;
