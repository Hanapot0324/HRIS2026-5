-- Migration: Create Contact Us table for storing user contact messages
-- Run this SQL to create the necessary table for Contact Us functionality

-- Contact Us Table
CREATE TABLE IF NOT EXISTS `contact_us` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Name of the person contacting',
  `email` VARCHAR(255) NOT NULL COMMENT 'Email address of the person',
  `subject` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Subject of the message',
  `message` TEXT NOT NULL COMMENT 'The contact message',
  `employee_number` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Employee number if logged in user',
  `status` ENUM('new', 'read', 'replied', 'resolved') NOT NULL DEFAULT 'new' COMMENT 'Status of the contact message',
  `admin_notes` TEXT NULL DEFAULT NULL COMMENT 'Admin notes about the message',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_employee_number` (`employee_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores contact us messages from users';


