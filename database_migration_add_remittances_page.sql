-- Migration: Add remittances page entry to pages table
-- This adds the missing page entry for the Remittances component
-- Date: 2025-01-XX

-- Check if the page already exists, if not, insert it
-- This uses a safe INSERT IGNORE approach or UPDATE if exists

-- Option 1: Insert if not exists (recommended)
INSERT INTO `pages` (`page_name`, `page_description`, `page_url`, `page_group`, `component_identifier`)
SELECT 
  'remittances',
  'Employee Remittance Management',
  '/remittance-table',
  'Payroll',
  'remittances'
WHERE NOT EXISTS (
  SELECT 1 FROM `pages` WHERE `component_identifier` = 'remittances'
);

-- Option 2: If the page exists but doesn't have the component_identifier, update it
UPDATE `pages` 
SET `component_identifier` = 'remittances'
WHERE `page_url` = '/remittance-table' 
  AND (`component_identifier` IS NULL OR `component_identifier` != 'remittances');

-- Verify the entry was created/updated
SELECT id, page_name, page_description, page_url, page_group, component_identifier
FROM `pages`
WHERE `component_identifier` = 'remittances';

