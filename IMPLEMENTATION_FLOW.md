# Dynamic Page Access System - Implementation Flow

## Overview
This guide walks you through the complete flow of implementing the dynamic page access system, from database setup to component integration.

## Prerequisites Checklist
- [ ] Database access (MySQL/MariaDB)
- [ ] Backend server running
- [ ] Frontend development environment
- [ ] Admin access to the system

---

## Step-by-Step Implementation Flow

### STEP 1: Database Migration ⚠️ **DO THIS FIRST**

**What:** Add the `component_identifier` column to your `pages` table

**How:**
1. Open your database management tool (phpMyAdmin, MySQL Workbench, etc.)
2. Select your database (e.g., `earist_hris`)
3. Run the migration script:
   ```sql
   -- Execute the entire migration script
   SOURCE database_migration_add_component_identifier.sql;
   ```
   
   OR manually run these commands:
   ```sql
   -- Add the column
   ALTER TABLE `pages` 
   ADD COLUMN `component_identifier` VARCHAR(255) NULL DEFAULT NULL 
   AFTER `page_url`,
   ADD UNIQUE KEY `unique_component_identifier` (`component_identifier`);
   
   -- Add index
   CREATE INDEX `idx_component_identifier` ON `pages` (`component_identifier`);
   
   -- Update existing pages
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
   ```

**Verify:**
```sql
-- Check if column was added
DESCRIBE pages;

-- Check if data was updated
SELECT id, page_name, component_identifier FROM pages;
```

**Expected Result:** You should see the `component_identifier` column with values populated.

---

### STEP 2: Backend Setup ✅

**What:** Ensure backend endpoints are updated

**How:**
1. The backend routes are already updated in `backend/routes/pages.js`
2. Restart your backend server:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm start
   # or
   node backend/index.js
   ```

**Verify:**
Test the new endpoint:
```bash
# Using curl or Postman
GET http://localhost:5000/pages/by-identifier/pds1
Authorization: Bearer YOUR_TOKEN
```

**Expected Result:** Should return page data with `component_identifier` field.

---

### STEP 3: Frontend Hook Setup ✅

**What:** The `usePageAccess` hook is already created

**Location:** `frontend/src/hooks/usePageAccess.js`

**Verify:**
- File exists: `frontend/src/hooks/usePageAccess.js`
- No errors in the file

---

### STEP 4: Component Mapping Setup ✅

**What:** Component mapping utility is already created

**Location:** `frontend/src/utils/componentMapping.js`

**Verify:**
- File exists: `frontend/src/utils/componentMapping.js`
- Contains mappings for your components

---

### STEP 5: Update Components (One by One)

**What:** Replace hardcoded page IDs with the dynamic hook

**Flow for Each Component:**

#### 5.1 Identify the Component
- Find components with hardcoded `pageId = X`
- Check which component identifier it should use

#### 5.2 Update the Component

**Before:**
```jsx
const pageId = 12; // Hardcoded
const [hasAccess, setHasAccess] = useState(null);

useEffect(() => {
  // Manual access checking code...
  const checkAccess = async () => {
    // ... lots of code
  };
  checkAccess();
}, []);
```

**After:**
```jsx
import usePageAccess from '../../hooks/usePageAccess';

// Replace all the above with:
const { hasAccess, loading, error } = usePageAccess('pds1');
```

#### 5.3 Update Loading/Access Checks

**Before:**
```jsx
if (hasAccess === null) {
  return <Loading />;
}
if (!hasAccess) {
  return <AccessDenied />;
}
```

**After:**
```jsx
if (loading) {
  return <Loading />;
}
if (hasAccess === false) {
  return <AccessDenied />;
}
```

#### 5.4 Test the Component
1. Navigate to the component route
2. Verify access checking works
3. Test with users who have/don't have access

---

### STEP 6: Update PagesList Component ✅

**What:** The PagesList component is already updated to show component connections

**Verify:**
1. Navigate to `/pages-list`
2. You should see the new "Component Identifier" column
3. Hover over chips to see component connections

---

## Complete Migration Checklist

### Database
- [ ] Run migration script
- [ ] Verify `component_identifier` column exists
- [ ] Verify existing pages have identifiers
- [ ] Test database queries

### Backend
- [ ] Backend routes updated (already done)
- [ ] Restart backend server
- [ ] Test `/pages/by-identifier/:identifier` endpoint
- [ ] Test `/pages` endpoint returns `component_identifier`

### Frontend
- [ ] `usePageAccess` hook exists
- [ ] `componentMapping.js` exists
- [ ] PagesList shows component identifiers
- [ ] Update PDS1 component (already done as example)
- [ ] Update other components one by one

### Components to Update (Priority Order)

**High Priority (Most Used):**
1. ✅ PDS1 - Already updated
2. [ ] PDS2, PDS3, PDS4
3. [ ] Registration
4. [ ] BulkRegister
5. [ ] UsersList (if needed)

**Medium Priority:**
6. [ ] PersonTable
7. [ ] Children
8. [ ] College
9. [ ] GraduateStudies
10. [ ] Vocational

**Lower Priority:**
11. [ ] LearningAndDevelopment
12. [ ] Eligibility
13. [ ] Voluntary
14. [ ] WorkExperience
15. [ ] OtheInformation

---

## Quick Start Guide (TL;DR)

1. **Database First:**
   ```sql
   -- Run migration script
   SOURCE database_migration_add_component_identifier.sql;
   ```

2. **Restart Backend:**
   ```bash
   # Stop and restart your backend server
   ```

3. **Update Components:**
   ```jsx
   // Replace hardcoded pageId with:
   import usePageAccess from '../../hooks/usePageAccess';
   const { hasAccess, loading } = usePageAccess('your-identifier');
   ```

4. **Test:**
   - Navigate to component
   - Verify access checking works
   - Check PagesList to see connections

---

## Common Issues & Solutions

### Issue: "Page not found for identifier"
**Solution:** 
- Check database: `SELECT * FROM pages WHERE component_identifier = 'your-identifier';`
- Verify identifier matches exactly (case-sensitive)
- Run migration if not done

### Issue: Access always denied
**Solution:**
- Check user has page_access record
- Verify `page_privilege` is not '0'
- Check employeeNumber matches

### Issue: Component mapping not found
**Solution:
- Add entry to `componentMapping.js`
- Verify identifier spelling matches database

### Issue: Backend endpoint not working
**Solution:**
- Restart backend server
- Check route is registered in `backend/index.js`
- Verify authentication token is valid

---

## Testing Flow

1. **Test Database:**
   ```sql
   SELECT id, page_name, component_identifier FROM pages WHERE component_identifier IS NOT NULL;
   ```

2. **Test Backend:**
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://localhost:5000/pages/by-identifier/pds1
   ```

3. **Test Frontend:**
   - Open browser console
   - Navigate to component
   - Check for errors
   - Verify access checking works

4. **Test Access:**
   - Login as user with access → Should see component
   - Login as user without access → Should see AccessDenied

---

## Next Steps After Implementation

1. **Update All Components:** Migrate remaining components one by one
2. **Add New Mappings:** When creating new pages, add to `componentMapping.js`
3. **Documentation:** Update team documentation with new system
4. **Training:** Train administrators on using PagesList to manage identifiers

---

## Support

If you encounter issues:
1. Check the error message
2. Verify database migration completed
3. Check browser console for frontend errors
4. Check backend logs for API errors
5. Refer to `DYNAMIC_PAGE_ACCESS_GUIDE.md` for detailed documentation


