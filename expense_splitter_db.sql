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
-- Stores registered university students / group members
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
  `student_code` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `avatar` VARCHAR(20) DEFAULT '👨‍💻',
  `is_current_user` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `student_code`, `email`, `avatar`, `is_current_user`) VALUES
('m1', 'Suman Kumar Das', 'BWU/BCA/24/255', 'suman.das@bwu.ac.in', '👨‍💻', TRUE),
('m2', 'Rahul Sharma', 'BWU/BCA/24/101', 'rahul.bca24@bwu.ac.in', '🧑‍🎓', FALSE),
('m3', 'Priya Mukherjee', 'BWU/BCA/24/102', 'priya.bca24@bwu.ac.in', '👩‍🎓', FALSE),
('m4', 'Sneha Dutta', 'BWU/BCA/24/103', 'sneha.bca24@bwu.ac.in', '👩‍💻', FALSE),
('m5', 'Aniket Banerjee', 'BWU/BCA/24/104', 'aniket.bca24@bwu.ac.in', '🧑‍💻', FALSE);

-- =====================================================================
-- TABLE 2: expense_groups
-- Stores groups (e.g. Project Group, Flat Roommates, College Tour)
-- =====================================================================
CREATE TABLE `expense_groups` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(20) DEFAULT '👥',
  `created_by` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  CONSTRAINT `fk_group_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `expense_groups` (`id`, `name`, `category`, `description`, `icon`, `created_by`, `created_at`) VALUES
('g1', 'BCA Final Project Group', 'Academic', 'Full Stack project expenses, cloud hosting, and printouts', '🎓', 'm1', '2026-10-15'),
('g2', 'Barasat Flat 402 Roommates', 'Living', 'Monthly apartment rent, groceries, WiFi and electricity', '🏠', 'm1', '2026-10-01'),
('g3', 'Digha Weekend Tour', 'Travel', 'College friends weekend beach tour, resort and transport', '🏖️', 'm1', '2026-10-20');

-- =====================================================================
-- TABLE 3: group_members
-- Maps many-to-many relationship between users and expense groups
-- =====================================================================
CREATE TABLE `group_members` (
  `group_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`, `user_id`),
  CONSTRAINT `fk_gm_group` FOREIGN KEY (`group_id`) REFERENCES `expense_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `group_members` (`group_id`, `user_id`) VALUES
('g1', 'm1'), ('g1', 'm2'), ('g1', 'm3'), ('g1', 'm4'),
('g2', 'm1'), ('g2', 'm2'), ('g2', 'm5'),
('g3', 'm1'), ('g3', 'm2'), ('g3', 'm3'), ('g3', 'm4'), ('g3', 'm5');

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

INSERT INTO `expenses` (`id`, `title`, `amount`, `category`, `group_id`, `paid_by`, `split_type`, `expense_date`, `notes`) VALUES
('exp-1', 'Project Report & Spiral Binding', 800.00, 'Academic', 'g1', 'm1', 'EQUAL', '2026-10-22', 'Printed 4 copies of project reports at college stationary shop'),
('exp-2', 'WiFi & Broadband Monthly Bill', 1200.00, 'Utilities', 'g2', 'm2', 'EQUAL', '2026-10-24', '100 Mbps broadband renewal for Barasat flat'),
('exp-3', 'Weekend Team Dinner at Barasat', 2400.00, 'Food', 'g1', 'm3', 'EQUAL', '2026-10-25', 'Project celebration dinner with group members'),
('exp-4', 'Digha Hotel Room Advance', 4500.00, 'Travel', 'g3', 'm1', 'EQUAL', '2026-10-26', 'Hotel Sea Hawk advance booking for 5 students'),
('exp-5', 'Flat Groceries & Vegetables', 1500.00, 'Living', 'g2', 'm5', 'EQUAL', '2026-10-27', 'Spices, oil, rice and fresh vegetables from local market'),
('exp-6', 'College Canteen Snacks & Coffee', 360.00, 'Food', 'g1', 'm4', 'EQUAL', '2026-10-28', 'Coffee and sandwich during project lab hours');

-- =====================================================================
-- TABLE 5: expense_splits
-- Stores individual breakdown of how much each member owes for an expense
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

-- exp-1 (800 / 4 = 200 each)
INSERT INTO `expense_splits` (`expense_id`, `user_id`, `share_amount`) VALUES
('exp-1', 'm1', 200.00), ('exp-1', 'm2', 200.00), ('exp-1', 'm3', 200.00), ('exp-1', 'm4', 200.00);

-- exp-2 (1200 / 3 = 400 each)
INSERT INTO `expense_splits` (`expense_id`, `user_id`, `share_amount`) VALUES
('exp-2', 'm1', 400.00), ('exp-2', 'm2', 400.00), ('exp-2', 'm5', 400.00);

-- exp-3 (2400 / 4 = 600 each)
INSERT INTO `expense_splits` (`expense_id`, `user_id`, `share_amount`) VALUES
('exp-3', 'm1', 600.00), ('exp-3', 'm2', 600.00), ('exp-3', 'm3', 600.00), ('exp-3', 'm4', 600.00);

-- exp-4 (4500 / 5 = 900 each)
INSERT INTO `expense_splits` (`expense_id`, `user_id`, `share_amount`) VALUES
('exp-4', 'm1', 900.00), ('exp-4', 'm2', 900.00), ('exp-4', 'm3', 900.00), ('exp-4', 'm4', 900.00), ('exp-4', 'm5', 900.00);

-- exp-5 (1500 / 3 = 500 each)
INSERT INTO `expense_splits` (`expense_id`, `user_id`, `share_amount`) VALUES
('exp-5', 'm1', 500.00), ('exp-5', 'm2', 500.00), ('exp-5', 'm5', 500.00);

-- exp-6 (360 / 4 = 90 each)
INSERT INTO `expense_splits` (`expense_id`, `user_id`, `share_amount`) VALUES
('exp-6', 'm1', 90.00), ('exp-6', 'm2', 90.00), ('exp-6', 'm3', 90.00), ('exp-6', 'm4', 90.00);

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

INSERT INTO `settlements` (`id`, `from_user_id`, `to_user_id`, `amount`, `settlement_date`, `notes`) VALUES
('set-1', 'm2', 'm1', 500.00, '2026-10-29', 'UPI payment via GPay for project binding share');

-- =====================================================================
-- USEFUL ANALYTICAL SQL QUERIES (FOR COLLEGE PROJECT VIVA)
-- =====================================================================
-- 1. Total spending by Category:
-- SELECT category, COUNT(*) AS total_bills, SUM(amount) AS total_spent
-- FROM expenses GROUP BY category ORDER BY total_spent DESC;
--
-- 2. Total amount paid by each student:
-- SELECT u.name, u.student_code, SUM(e.amount) AS total_paid_out_of_pocket
-- FROM expenses e JOIN users u ON e.paid_by = u.id GROUP BY u.id, u.name, u.student_code;
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
