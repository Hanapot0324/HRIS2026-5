# Dynamic Page Access System Guide

## Overview

This system replaces hardcoded page IDs with a dynamic, database-driven approach. Components can now check page access using a component identifier (like 'pds1', 'registration') instead of hardcoded numeric IDs.

## Benefits

1. **No Hardcoding**: Page IDs are fetched dynamically from the database
2. **Easy Maintenance**: Update page mappings in the database without code changes
3. **Reusable**: One hook works for all components
4. **Type-Safe**: Component identifiers are strings, easier to track and maintain

## Database Changes

### Migration Script

Run the migration script: `database_migration_add_component_identifier.sql`

This adds:
- `component_identifier` column to `pages` table
- Unique constraint on `component_identifier`
- Index for faster lookups
- Updates existing pages with their identifiers

### Component Identifiers

Each page in the database should have a unique `component_identifier` that matches:
- The route path (e.g., `/pds1` → `'pds1'`)
- Or a component name (e.g., `PDS1` → `'pds1'`)

**Current Mappings:**
- `pages-list` → Pages Library
- `personalinfo` → Personal Information
- `children` → Children Information
- `college` → College Information
- `graduate` → Graduate Studies
- `vocational` → Vocational Studies
- `learningdev` → Learning and Development
- `eligibility` → Eligibility
- `voluntarywork` → Voluntary Work
- `workexperience` → Work Experience
- `other-information` → Other Information
- `pds1` → PDS1
- `pds2` → PDS2
- `pds3` → PDS3
- `pds4` → PDS4
- `registration` → Single Registration
- `bulk-register` → Bulk Registration

## Backend Changes

### New Endpoint

**GET `/pages/by-identifier/:identifier`**
- Fetches page information by component identifier
- Returns page ID, name, description, etc.
- Used by frontend to get page ID dynamically

### Updated Endpoints

- **GET `/pages`** - Now includes `component_identifier` in response
- **POST `/pages`** - Accepts `component_identifier` in request body
- **PUT `/pages/:id`** - Can update `component_identifier`

## Frontend Usage

### Using the Hook

```jsx
import usePageAccess from '../../hooks/usePageAccess';

const MyComponent = () => {
  // Use component identifier instead of hardcoded page ID
  const { hasAccess, pageId, loading, error } = usePageAccess('pds1');

  if (loading) {
    return <Loading />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return <YourComponent />;
};
```

### Hook Parameters

- **componentIdentifier** (required): String matching the `component_identifier` in database
- **options** (optional):
  - `autoCheck`: Whether to check access on mount (default: true)
  - `employeeNumber`: Override employee number (default: from localStorage)

### Hook Returns

- **hasAccess**: `boolean | null` - true if access granted, false if denied, null if checking
- **pageId**: `number | null` - The page ID from database
- **loading**: `boolean` - Whether check is in progress
- **error**: `string | null` - Error message if something went wrong

## Migration Steps

### 1. Run Database Migration

```sql
-- Execute the migration script
SOURCE database_migration_add_component_identifier.sql;
```

Or manually run the SQL commands from the migration file.

### 2. Update Existing Components

Replace hardcoded page IDs with the hook:

**Before:**
```jsx
const pageId = 12; // Hardcoded
// ... manual access checking code
```

**After:**
```jsx
const { hasAccess, loading } = usePageAccess('pds1');
// ... automatic access checking
```

### 3. Add Component Identifiers to New Pages

When creating new pages in the database, always include a `component_identifier`:

```sql
INSERT INTO pages (page_name, page_description, page_url, page_group, component_identifier)
VALUES ('New Page', 'Description', '/new-page', 'staff', 'new-page');
```

## Example: PDS1 Component

**Before (Hardcoded):**
```jsx
const pageId = 12; // Hardcoded
useEffect(() => {
  // Manual access checking...
}, []);
```

**After (Dynamic):**
```jsx
const { hasAccess, loading } = usePageAccess('pds1');
```

## Best Practices

1. **Use Route Paths**: Use the route path as the component identifier (e.g., `/pds1` → `'pds1'`)
2. **Consistent Naming**: Use lowercase, hyphenated names (e.g., `'bulk-register'` not `'BulkRegister'`)
3. **Document Mappings**: Keep a list of component identifiers in your documentation
4. **Error Handling**: Always check for `loading` and `error` states
5. **Fallback**: If a page doesn't have a component_identifier, you can still use the old method temporarily

## Troubleshooting

### "Page not found for identifier"
- Check that the component_identifier exists in the database
- Verify the identifier matches exactly (case-sensitive)
- Run the migration script if you haven't

### Access Always Denied
- Verify the user has page_access record in database
- Check that page_privilege is not '0' or empty
- Ensure employeeNumber matches

### Hook Not Working
- Verify the hook is imported correctly
- Check that API_BASE_URL is configured
- Ensure authentication token is present

## Future Enhancements

- Add component identifier validation
- Create admin UI for managing component identifiers
- Add TypeScript types for component identifiers
- Create migration tool for bulk updates


