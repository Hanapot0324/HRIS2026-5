# Quick Start Guide - Dynamic Page Access System

## 🚀 Quick Implementation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: DATABASE                         │
│  ⚠️  MUST DO THIS FIRST!                                    │
│                                                             │
│  1. Open your database (phpMyAdmin/MySQL Workbench)        │
│  2. Select database: earist_hris                            │
│  3. Run: SOURCE database_migration_add_component_identifier.sql; │
│                                                             │
│  ✅ Verify:                                                 │
│     SELECT id, page_name, component_identifier FROM pages;  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 2: BACKEND                          │
│                                                             │
│  ✅ Already done! Routes are updated                        │
│                                                             │
│  Just restart your backend:                                 │
│    npm start  (or your start command)                      │
│                                                             │
│  ✅ Test endpoint:                                          │
│     GET /pages/by-identifier/pds1                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 3: FRONTEND                         │
│                                                             │
│  ✅ Files already created:                                  │
│     - frontend/src/hooks/usePageAccess.js                  │
│     - frontend/src/utils/componentMapping.js               │
│                                                             │
│  ✅ PagesList already updated                                │
│                                                             │
│  ✅ PDS1 already updated (example)                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: UPDATE OTHER COMPONENTS                │
│                                                             │
│  For each component with hardcoded pageId:                  │
│                                                             │
│  1. Find: const pageId = X;                                 │
│  2. Replace with:                                           │
│     import usePageAccess from '../../hooks/usePageAccess';  │
│     const { hasAccess, loading } = usePageAccess('id');    │
│  3. Update loading checks                                   │
│  4. Test the component                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Detailed Steps

### STEP 1: Database Migration (CRITICAL - DO FIRST!)

**Option A: Using SQL File**
```bash
# In your database tool:
1. Open database: earist_hris
2. Go to SQL tab
3. Copy entire content of: database_migration_add_component_identifier.sql
4. Paste and execute
```

**Option B: Manual SQL**
```sql
-- Run these commands one by one:

-- 1. Add column
ALTER TABLE `pages` 
ADD COLUMN `component_identifier` VARCHAR(255) NULL DEFAULT NULL 
AFTER `page_url`,
ADD UNIQUE KEY `unique_component_identifier` (`component_identifier`);

-- 2. Add index
CREATE INDEX `idx_component_identifier` ON `pages` (`component_identifier`);

-- 3. Update existing pages (run all UPDATE statements)
UPDATE `pages` SET `component_identifier` = 'pages-list' WHERE `id` = 1;
UPDATE `pages` SET `component_identifier` = 'personalinfo' WHERE `id` = 2;
-- ... (continue with all UPDATE statements from migration file)
```

**Verify Migration:**
```sql
-- Should return rows with component_identifier populated
SELECT id, page_name, component_identifier 
FROM pages 
WHERE component_identifier IS NOT NULL;
```

### STEP 2: Backend Verification

**Check if routes are working:**
```bash
# Test the new endpoint (use Postman or curl)
GET http://localhost:5000/pages/by-identifier/pds1
Headers: Authorization: Bearer YOUR_TOKEN
```

**Expected Response:**
```json
{
  "id": 12,
  "page_name": "PDS1",
  "page_description": "Personal Data Sheets",
  "page_url": "pds1",
  "page_group": "administrator,superadmin,staff",
  "component_identifier": "pds1"
}
```

### STEP 3: Frontend Setup

**Files to verify exist:**
- ✅ `frontend/src/hooks/usePageAccess.js` - Already created
- ✅ `frontend/src/utils/componentMapping.js` - Already created
- ✅ `frontend/src/components/PagesList.jsx` - Already updated

**No action needed - files are ready!**

### STEP 4: Update Components

**For each component, follow this pattern:**

#### Example: Updating PDS2 Component

**1. Open the component file:**
```bash
frontend/src/components/PDS/PDS2.jsx
```

**2. Find and remove hardcoded code:**
```jsx
// REMOVE THIS:
const pageId = 13; // Hardcoded
const [hasAccess, setHasAccess] = useState(null);

useEffect(() => {
  const userId = localStorage.getItem('employeeNumber');
  if (!userId) {
    setHasAccess(false);
    return;
  }
  const checkAccess = async () => {
    // ... lots of manual checking code
  };
  checkAccess();
}, []);
```

**3. Add the hook:**
```jsx
// ADD THIS:
import usePageAccess from '../../hooks/usePageAccess';

// In your component:
const { hasAccess, loading: accessLoading, error: accessError } = usePageAccess('pds2');
```

**4. Update loading/access checks:**
```jsx
// CHANGE FROM:
if (hasAccess === null) {
  return <Loading />;
}
if (!hasAccess) {
  return <AccessDenied />;
}

// TO:
if (accessLoading) {
  return <Loading />;
}
if (hasAccess === false) {
  return <AccessDenied />;
}
```

**5. Test:**
- Navigate to `/pds2`
- Verify access checking works
- Test with different user roles

## 🎯 Priority Order for Component Updates

### Phase 1: Critical Components (Do First)
1. ✅ PDS1 - **Already done!**
2. [ ] PDS2
3. [ ] PDS3
4. [ ] PDS4
5. [ ] Registration

### Phase 2: Important Components
6. [ ] BulkRegister
7. [ ] PersonTable
8. [ ] UsersList (if it has hardcoded pageId)

### Phase 3: Dashboard Components
9. [ ] Children
10. [ ] College
11. [ ] GraduateStudies
12. [ ] Vocational
13. [ ] LearningAndDevelopment
14. [ ] Eligibility
15. [ ] Voluntary
16. [ ] WorkExperience
17. [ ] OtheInformation

## ✅ Verification Checklist

After each step, verify:

### Database
- [ ] `component_identifier` column exists in `pages` table
- [ ] Existing pages have identifiers populated
- [ ] Can query: `SELECT * FROM pages WHERE component_identifier = 'pds1';`

### Backend
- [ ] Backend server restarted
- [ ] Endpoint `/pages/by-identifier/pds1` returns data
- [ ] Endpoint `/pages` includes `component_identifier` in response

### Frontend
- [ ] Hook file exists: `usePageAccess.js`
- [ ] Mapping file exists: `componentMapping.js`
- [ ] PagesList shows component identifier column
- [ ] Updated component works correctly

## 🐛 Troubleshooting

### Problem: "Page not found for identifier"
**Solution:**
1. Check database: `SELECT * FROM pages WHERE component_identifier = 'your-id';`
2. If empty, run migration UPDATE statements
3. Verify identifier spelling matches exactly

### Problem: Component shows "Access Denied" always
**Solution:**
1. Check user has page_access: 
   ```sql
   SELECT * FROM page_access 
   WHERE employeeNumber = 'USER_ID' AND page_id = 12;
   ```
2. Verify `page_privilege` is '1' not '0'
3. Check component identifier matches database

### Problem: Backend endpoint returns 404
**Solution:**
1. Verify route is registered in `backend/index.js` (line 139)
2. Restart backend server
3. Check authentication token is valid

## 📝 Notes

- **Always run database migration FIRST** before updating components
- Update components **one at a time** and test each
- Use PagesList interface to verify component connections
- Add new component mappings to `componentMapping.js` when needed

## 🎉 Success Indicators

You'll know it's working when:
- ✅ PagesList shows component identifiers with green checkmarks
- ✅ Components load without hardcoded page IDs
- ✅ Access checking works correctly
- ✅ No console errors related to page access

---

**Need Help?** Refer to:
- `IMPLEMENTATION_FLOW.md` - Detailed step-by-step guide
- `DYNAMIC_PAGE_ACCESS_GUIDE.md` - Complete documentation
- `COMPONENT_CONNECTION_FEATURE.md` - Component mapping details


