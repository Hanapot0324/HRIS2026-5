-- Migration: Add component_identifier field to pages table
-- This allows dynamic page access checking without hardcoding page IDs
-- Date: 2025-11-23

-- Add component_identifier column to pages table
ALTER TABLE `pages` 
ADD COLUMN `component_identifier` VARCHAR(255) NULL DEFAULT NULL 
AFTER `page_url`,
ADD UNIQUE KEY `unique_component_identifier` (`component_identifier`);

-- Add index for faster lookups
CREATE INDEX `idx_component_identifier` ON `pages` (`component_identifier`);

-- Update existing pages with component identifiers based on their routes/components
-- These identifiers should match the route paths or component names used in the frontend

UPDATE `pages` SET `component_identifier` = 'pages-list' WHERE `id` = 1;
UPDATE `pages` SET `component_identifier` = 'personalinfo' WHERE `id` = 2;
UPDATE `pages` SET `component_identifier` = 'children' WHERE `id` = 3;
UPDATE `pages` SET `component_identifier` = 'college' WHERE `id` = 4;
UPDATE `pages` SET `component_identifier` = 'graduate' WHERE `id` = 5;
UPDATE `pages` SET `component_identifier` = 'vocational' WHERE `id` = 6;
UPDATE `pages` SET `component_identifier` = 'learningdev' WHERE `id` = 7;
UPDATE `pages` SET `component_identifier` = 'eligibility' WHERE `id` = 8;
UPDATE `pages` SET `component_identifier` = 'voluntarywork' WHERE `id` = 9;
UPDATE `pages` SET `component_identifier` = 'workexperience' WHERE `id` = 10;
UPDATE `pages` SET `component_identifier` = 'other-information' WHERE `id` = 11;
UPDATE `pages` SET `component_identifier` = 'pds1' WHERE `id` = 12;
UPDATE `pages` SET `component_identifier` = 'pds2' WHERE `id` = 13;
UPDATE `pages` SET `component_identifier` = 'pds3' WHERE `id` = 14;
UPDATE `pages` SET `component_identifier` = 'pds4' WHERE `id` = 15;
UPDATE `pages` SET `component_identifier` = 'registration' WHERE `id` = 16;
UPDATE `pages` SET `component_identifier` = 'bulk-register' WHERE `id` = 17;

-- Add comment to the column
ALTER TABLE `pages` 
MODIFY COLUMN `component_identifier` VARCHAR(255) NULL DEFAULT NULL 
COMMENT 'Unique identifier for the component/route (e.g., "pds1", "registration", "users-list")';


