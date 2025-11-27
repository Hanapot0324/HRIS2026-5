-- Migration: Create Policy table for storing privacy policy and terms of service
-- Run this SQL to create the necessary table for Policy functionality

-- Policy Table
CREATE TABLE IF NOT EXISTS `policy` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL DEFAULT 'Privacy Policy & Terms of Service' COMMENT 'Title of the policy',
  `privacy_policy` LONGTEXT NOT NULL COMMENT 'Privacy policy content (HTML supported)',
  `terms_of_service` LONGTEXT NOT NULL COMMENT 'Terms of service content (HTML supported)',
  `last_updated_by` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Employee number of last updater',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores privacy policy and terms of service content';

-- Insert default policy content
INSERT INTO `policy` (`title`, `privacy_policy`, `terms_of_service`) 
VALUES (
  'Privacy Policy & Terms of Service',
  '<h2>Privacy Policy</h2>
  <p>This Human Resources Information System (HRIS) is designed to protect your personal information and ensure data security.</p>
  <h3>Data Collection</h3>
  <p>We collect and store only the information necessary for HR management purposes, including employee profiles, attendance records, and payroll information.</p>
  <h3>Data Security</h3>
  <p>All data is stored securely and access is restricted to authorized personnel only. We implement industry-standard security measures to protect your information.</p>
  <h3>Data Usage</h3>
  <p>Your information is used solely for HR management purposes, including payroll processing, attendance tracking, and employee record management.</p>
  <h3>Data Retention</h3>
  <p>We retain your data for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.</p>
  <h3>Your Rights</h3>
  <p>You have the right to access, update, or request deletion of your personal information. Please contact the HR department for assistance.</p>',
  '<h2>Terms of Service</h2>
  <p>By using this HRIS, you agree to the following terms:</p>
  <h3>User Responsibilities</h3>
  <ul>
    <li>Maintain the confidentiality of your account credentials</li>
    <li>Report any security breaches or suspicious activity immediately</li>
    <li>Use the system only for authorized purposes</li>
    <li>Keep your personal information up to date</li>
    <li>Do not share your login credentials with others</li>
  </ul>
  <h3>System Usage</h3>
  <p>This system is intended for official HR management purposes only. Unauthorized access, data manipulation, or misuse of the system is strictly prohibited.</p>
  <h3>Compliance</h3>
  <p>All users must comply with institutional policies and applicable data protection regulations.</p>
  <h3>Account Security</h3>
  <p>You are responsible for maintaining the security of your account. Notify the HR department immediately if you suspect unauthorized access.</p>
  <h3>System Availability</h3>
  <p>We strive to maintain system availability but do not guarantee uninterrupted access. Scheduled maintenance may occur periodically.</p>'
) ON DUPLICATE KEY UPDATE `title` = `title`;


