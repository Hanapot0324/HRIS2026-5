# Component Connection Feature

## Overview

This feature allows administrators to see which frontend components are connected to which page identifiers in the PagesList management interface. This makes it easy to track and manage the dynamic page access system.

## What Was Added

### 1. Component Mapping Utility (`frontend/src/utils/componentMapping.js`)

A centralized mapping file that connects component identifiers to their actual component information:

- **Component Path**: Where the component file is located
- **Route Path**: The URL route for the component
- **Component Name**: The React component name
- **Description**: Human-readable description

**Example:**
```javascript
'pds1': {
  componentPath: 'components/PDS/PDS1.jsx',
  routePath: '/pds1',
  componentName: 'PDS1',
  description: 'Personal Data Sheet Page 1'
}
```

### 2. Enhanced PagesList Component

The PagesList component now displays:

#### New Table Column: "Component Identifier"
- Shows the component identifier for each page
- **Green chip with checkmark**: Component is mapped and connected
- **Orange chip with warning**: Identifier exists but no mapping found
- **Gray chip**: No identifier set

#### Tooltip Information
When hovering over a component identifier chip, you'll see:
- **Component Name**: The React component that uses this identifier
- **Component Path**: File location of the component
- **Route Path**: URL route for the component

#### Edit/Add Dialog Enhancement
- New field: "Component Identifier"
- Real-time validation showing if identifier is connected to a component
- Visual feedback:
  - ✅ Green checkmark = Component mapping found
  - ⚠️ Orange warning = No mapping found
- Helper text shows connected component name when valid

## How to Use

### Viewing Component Connections

1. Navigate to **Pages Library** (`/pages-list`)
2. Look at the **"Component Identifier"** column
3. Hover over any chip to see component connection details
4. Green chips indicate successfully connected components

### Adding/Editing Component Identifiers

1. Click **Edit** or **Add New Page**
2. Fill in the **Component Identifier** field
3. As you type, the system will:
   - Show a green checkmark if the identifier is mapped
   - Show an orange warning if not mapped
   - Display the connected component name in helper text
4. Save the page

### Adding New Component Mappings

To add a new component to the mapping:

1. Open `frontend/src/utils/componentMapping.js`
2. Add a new entry to the `componentMapping` object:

```javascript
'your-identifier': {
  componentPath: 'components/YourComponent.jsx',
  routePath: '/your-route',
  componentName: 'YourComponent',
  description: 'Description of your component'
}
```

3. The mapping will automatically appear in the PagesList interface

## Component Identifiers Currently Mapped

- `pds1`, `pds2`, `pds3`, `pds4` - PDS forms
- `registration`, `bulk-register` - Registration components
- `pages-list`, `users-list` - Management pages
- `personalinfo`, `children`, `college`, `graduate`, `vocational` - Dashboard components
- `learningdev`, `eligibility`, `voluntarywork`, `workexperience`, `other-information` - Additional dashboards

## Benefits

1. **Visual Tracking**: See at a glance which pages have connected components
2. **Easy Management**: Edit component identifiers directly in the UI
3. **Validation**: Real-time feedback when adding/editing identifiers
4. **Documentation**: Tooltips provide component details without leaving the page
5. **Maintenance**: Centralized mapping makes updates easy

## Future Enhancements

- Auto-suggest component identifiers when typing
- Click to navigate to component file
- Bulk update component identifiers
- Export component mapping report
- Visual diagram of component connections


