/**
 * Component Identifier Mapping
 *
 * This file maps component identifiers (used in usePageAccess hook)
 * to their actual component file paths and route paths.
 *
 * This helps administrators see which components are connected to which pages.
 */

export const componentMapping = {
  pds1: {
    componentPath: 'components/PDS/PDS1.jsx',
    routePath: '/pds1',
    componentName: 'PDS1',
    description: 'Personal Data Sheet Page 1',
  },
  pds2: {
    componentPath: 'components/PDS/PDS2.jsx',
    routePath: '/pds2',
    componentName: 'PDS2',
    description: 'Personal Data Sheet Page 2',
  },
  pds3: {
    componentPath: 'components/PDS/PDS3.jsx',
    routePath: '/pds3',
    componentName: 'PDS3',
    description: 'Personal Data Sheet Page 3',
  },
  pds4: {
    componentPath: 'components/PDS/PDS4.jsx',
    routePath: '/pds4',
    componentName: 'PDS4',
    description: 'Personal Data Sheet Page 4',
  },
  registration: {
    componentPath: 'components/Registration.jsx',
    routePath: '/registration',
    componentName: 'Registration',
    description: 'Single User Registration',
  },
  'bulk-register': {
    componentPath: 'components/BulkRegister.jsx',
    routePath: '/bulk-register',
    componentName: 'BulkRegister',
    description: 'Bulk User Registration',
  },
  'pages-list': {
    componentPath: 'components/PagesList.jsx',
    routePath: '/pages-list',
    componentName: 'PagesList',
    description: 'Pages Management Library',
  },
  'users-list': {
    componentPath: 'components/UsersList.jsx',
    routePath: '/users-list',
    componentName: 'UsersList',
    description: 'User Management',
  },
  personalinfo: {
    componentPath: 'components/DASHBOARD/PersonTable.jsx',
    routePath: '/personalinfo',
    componentName: 'PersonTable',
    description: 'Personal Information Dashboard',
  },
  children: {
    componentPath: 'components/DASHBOARD/Children.jsx',
    routePath: '/children',
    componentName: 'Children',
    description: 'Children Information Dashboard',
  },
  college: {
    componentPath: 'components/DASHBOARD/College.jsx',
    routePath: '/college',
    componentName: 'College',
    description: 'College Information Dashboard',
  },
  graduate: {
    componentPath: 'components/DASHBOARD/GraduateStudies.jsx',
    routePath: '/graduate',
    componentName: 'GraduateStudies',
    description: 'Graduate Studies Dashboard',
  },
  vocational: {
    componentPath: 'components/DASHBOARD/Vocational.jsx',
    routePath: '/vocational',
    componentName: 'Vocational',
    description: 'Vocational Studies Dashboard',
  },
  learningdev: {
    componentPath: 'components/DASHBOARD/LearningAndDevelopment.jsx',
    routePath: '/learningdev',
    componentName: 'LearningAndDevelopment',
    description: 'Learning and Development Dashboard',
  },
  eligibility: {
    componentPath: 'components/DASHBOARD/Eligibility.jsx',
    routePath: '/eligibility',
    componentName: 'Eligibility',
    description: 'Eligibility Dashboard',
  },
  voluntarywork: {
    componentPath: 'components/DASHBOARD/Voluntary.jsx',
    routePath: '/voluntarywork',
    componentName: 'Voluntary',
    description: 'Voluntary Work Dashboard',
  },
  workexperience: {
    componentPath: 'components/DASHBOARD/WorkExperience.jsx',
    routePath: '/workexperience',
    componentName: 'WorkExperience',
    description: 'Work Experience Dashboard',
  },
  'other-information': {
    componentPath: 'components/DASHBOARD/OtheInformation.jsx',
    routePath: '/other-information',
    componentName: 'OtheInformation',
    description: 'Other Information Dashboard',
  },
  'view-attendance': {
    componentPath: 'components/ATTENDANCE/AttendanceDevice.jsx',
    routePath: '/view_attendance',
    componentName: 'AttendanceDevice',
    description: 'View Attendance Dashboard',
  },
  'search-attendance': {
    componentPath: 'components/ATTENDANCE/AttendanceModification.jsx',
    routePath: '/search_attendance',
    componentName: 'AttendanceModification',
    description: 'Attendance Modification and Search',
  },
  'attendance-user-state': {
    componentPath: 'components/ATTENDANCE/AttendanceUserState.jsx',
    routePath: '/attendance-user-state',
    componentName: 'AttendanceUserState',
    description: 'Attendance User State Management',
  },
  'daily-time-record': {
    componentPath: 'components/ATTENDANCE/DailyTimeRecord.jsx',
    routePath: '/daily-time-record',
    componentName: 'DailyTimeRecord',
    description: 'Daily Time Record',
  },
  'daily-time-record-faculty': {
    componentPath: 'components/ATTENDANCE/DailyTimeRecordOverall.jsx',
    routePath: '/daily_time_record_faculty',
    componentName: 'DailyTimeRecordOverall',
    description: 'Daily Time Record for Faculty',
  },
  'attendance-form': {
    componentPath: 'components/ATTENDANCE/AttendanceState.jsx',
    routePath: '/attendance_form',
    componentName: 'AttendanceState',
    description: 'Attendance Form',
  },
  'attendance-module': {
    componentPath: 'components/ATTENDANCE/AttendanceModuleNonTeaching.jsx',
    routePath: '/attendance_module',
    componentName: 'AttendanceModuleNonTeaching',
    description: 'Attendance Module for Non-Teaching Staff',
  },
  'attendance-module-faculty': {
    componentPath: 'components/ATTENDANCE/AttendanceModuleFaculty30hrs.jsx',
    routePath: '/attendance_module_faculty',
    componentName: 'AttendanceModuleFaculty30hrs',
    description: 'Attendance Module for Faculty (30 hours)',
  },
  'attendance-module-faculty-40hrs': {
    componentPath:
      'components/ATTENDANCE/AttendanceModuleFacultyDesignated.jsx',
    routePath: '/attendance_module_faculty_40hrs',
    componentName: 'AttendanceModuleFacultyDesignated',
    description: 'Attendance Module for Faculty (40 hours/Designated)',
  },
  'attendance-summary': {
    componentPath: 'components/ATTENDANCE/AttendanceSummary.jsx',
    routePath: '/attendance_summary',
    componentName: 'AttendanceSummary',
    description: 'Attendance Summary',
  },
  'official-time': {
    componentPath: 'components/ATTENDANCE/OfficialTimeForm.jsx',
    routePath: '/official_time',
    componentName: 'OfficialTimeForm',
    description: 'Official Time Form',
  },
  'payroll-table': {
    componentPath: 'components/PAYROLL/PayrollProcessing.jsx',
    routePath: '/payroll-table',
    componentName: 'PayrollProcessing',
    description: 'Payroll Processing',
  },
  'payroll-processed': {
    componentPath: 'components/PAYROLL/PayrollProcessed.jsx',
    routePath: '/payroll-processed',
    componentName: 'PayrollProcessed',
    description: 'Payroll Processed Records',
  },
  'payroll-released': {
    componentPath: 'components/PAYROLL/PayrollReleased.jsx',
    routePath: '/payroll-released',
    componentName: 'PayrollReleased',
    description: 'Payroll Released Records',
  },
  'payroll-jo': {
    componentPath: 'components/PAYROLL/PayrollJO.jsx',
    routePath: '/payroll-jo',
    componentName: 'PayrollJO',
    description: 'Payroll Job Order',
  },
  remittances: {
    componentPath: 'components/PAYROLL/Remittances.jsx',
    routePath: '/remittance-table',
    componentName: 'Remittances',
    description: 'Remittances Management',
  },
  'item-table': {
    componentPath: 'components/PAYROLL/ItemTable.jsx',
    routePath: '/item-table',
    componentName: 'ItemTable',
    description: 'Item Table Management',
  },
  'salary-grade': {
    componentPath: 'components/PAYROLL/SalaryGradeTable.jsx',
    routePath: '/salary-grade',
    componentName: 'SalaryGradeTable',
    description: 'Salary Grade Table',
  },
  'department-table': {
    componentPath: 'components/PAYROLL/DepartmentTable.jsx',
    routePath: '/department-table',
    componentName: 'DepartmentTable',
    description: 'Department Table Management',
  },
  'department-assignment': {
    componentPath: 'components/PAYROLL/DepartmentAssignment.jsx',
    routePath: '/department-assignment',
    componentName: 'DepartmentAssignment',
    description: 'Department Assignment',
  },
  holiday: {
    componentPath: 'components/PAYROLL/Holiday.jsx',
    routePath: '/holiday',
    componentName: 'Holiday',
    description: 'Holiday Management',
  },
  payslip: {
    componentPath: 'components/PAYROLL/Payslip.jsx',
    routePath: '/payslip',
    componentName: 'Payslip',
    description: 'Payslip Generation',
  },
  'overall-payslip': {
    componentPath: 'components/PAYROLL/PayslipOverall.jsx',
    routePath: '/overall-payslip',
    componentName: 'PayslipOverall',
    description: 'Overall Payslip',
  },
  'distribution-payslip': {
    componentPath: 'components/PAYROLL/PayslipDistribution.jsx',
    routePath: '/distribution-payslip',
    componentName: 'PayslipDistribution',
    description: 'Payslip Distribution',
  },
  philhealth: {
    componentPath: 'components/PAYROLL/PhilHealth.jsx',
    routePath: '/philhealth-table',
    componentName: 'PhilHealth',
    description: 'PhilHealth Management',
  },
};

/**
 * Get component information by identifier
 * @param {string} identifier - Component identifier
 * @returns {Object|null} Component info or null if not found
 */
export const getComponentInfo = (identifier) => {
  return componentMapping[identifier] || null;
};

/**
 * Get all component identifiers
 * @returns {string[]} Array of component identifiers
 */
export const getAllIdentifiers = () => {
  return Object.keys(componentMapping);
};

/**
 * Check if an identifier exists
 * @param {string} identifier - Component identifier
 * @returns {boolean} True if identifier exists
 */
export const hasIdentifier = (identifier) => {
  return identifier in componentMapping;
};
