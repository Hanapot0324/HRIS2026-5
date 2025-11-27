-- Migration: Create confidential password table for sensitive operations
-- This password is used for:
-- 1. Deleting payroll records in PayrollProcessed.jsx
-- 2. Viewing audit logs in AuditLogs.jsx
-- Only superadmin can create/update this password

CREATE TABLE IF NOT EXISTS `confidential_password` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Hashed password for confidential operations',
  `created_by` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Employee number of user who created the password',
  `updated_by` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Employee number of user who last updated the password',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores confidential password for sensitive operations (payroll deletion, audit log viewing)';

-- Note: Only one password record should exist. The application should enforce this.
-- Initial password can be set through the Settings page by superadmin.




