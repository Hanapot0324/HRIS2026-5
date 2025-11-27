const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
require('dotenv').config();

const db = require('./db');

// Import existing route modules
const childrenRouter = require('./dashboardRoutes/Children');
const EligibilityRoute = require('./dashboardRoutes/Eligibility');
const VoluntaryWork = require('./dashboardRoutes/Voluntary');
const CollegeRoute = require('./dashboardRoutes/College');
const VocationalRoute = require('./dashboardRoutes/Vocational');
const PersonalRoute = require('./dashboardRoutes/PersonalInfo');
const WorkExperienceRoute = require('./dashboardRoutes/WorkExperience');
const OtherInfo = require('./dashboardRoutes/OtherSkills');
const GraduateRoute = require('./dashboardRoutes/Graduate');
const AllData = require('./dashboardRoutes/DataRoute');
const Leave = require('./dashboardRoutes/Leave');
const Attendance = require('./dashboardRoutes/Attendance');
const SalaryGradeTable = require('./payrollRoutes/SalaryGradeTable');
const Remittance = require('./payrollRoutes/Remittance');
const SendPayslip = require('./payrollRoutes/SendPayslip');
const Payroll = require('./payrollRoutes/Payroll');
const PayrollReleased = require('./payrollRoutes/PayrollReleased');
const PayrollJO = require('./payrollRoutes/PayrollJO');
const EmployeeCategory = require('./dashboardRoutes/EmployeeCategory');

// Import new organized routes
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/password');
const settingsRoutes = require('./routes/settings');
const learningRoutes = require('./routes/learning');
const userRoutes = require('./routes/users');
const pageRoutes = require('./routes/pages');
const officialtimeRoutes = require('./routes/officialtime');
const remittanceRoutes = require('./routes/remittance');
const itemRoutes = require('./routes/item');
const salaryRoutes = require('./routes/salary');
const departmentRoutes = require('./routes/department');
const leaveRoutes = require('./routes/leave');
const holidayRoutes = require('./routes/holiday');
const philhealthRoutes = require('./routes/philhealth');
const profileRoutes = require('./routes/profile');
const announcementsRoutes = require('./routes/announcements');
const auditRoutes = require('./routes/audit');
const tasksRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const notesRoutes = require('./routes/notes');
const eventsRoutes = require('./routes/events');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const settingsExtendedRoutes = require('./routes/settings-extended');
const confidentialPasswordRoutes = require('./routes/confidential-password');

const app = express();

// Middleware
app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5137',
  'http://192.168.20.16:5137',
  'http://192.168.50.45:5137',
  'http://136.239.248.42:5137',
  'http://192.168.50.97:5137',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Static file serving
app.use('/uploads', express.static('uploads'));

// Ensure audit log table exists
const ensureAuditLogTableSQL = `
  CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeNumber VARCHAR(64) NULL,
    action VARCHAR(512) NOT NULL,
    table_name VARCHAR(128) NULL,
    record_id INT NULL,
    targetEmployeeNumber VARCHAR(64) NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(ensureAuditLogTableSQL, (err) => {
  if (err) {
    console.error('Failed to ensure audit_log table exists:', err);
  } else {
    console.log('Audit log table ready');
  }
});

// Mount existing dashboard and payroll routes
app.use('/ChildrenRoute', childrenRouter);
app.use('/VoluntaryRoute', VoluntaryWork);
app.use('/eligibilityRoute', EligibilityRoute);
app.use('/college', CollegeRoute);
app.use('/GraduateRoute', GraduateRoute);
app.use('/vocational', VocationalRoute);
app.use('/personalinfo', PersonalRoute);
app.use('/WorkExperienceRoute', WorkExperienceRoute);
app.use('/OtherInfo', OtherInfo);
app.use('/allData', AllData);
app.use('/attendance', Attendance);
app.use('/SalaryGradeTable', SalaryGradeTable);
app.use('/Remittance', Remittance);
app.use('/leaveRoute', Leave);
app.use('/SendPayslipRoute', SendPayslip);
app.use('/PayrollRoute', Payroll);
app.use('/PayrollReleasedRoute', PayrollReleased);
app.use('/PayrollJORoutes', PayrollJO);
app.use('/EmploymentCategoryRoutes', EmployeeCategory);

// Mount new organized routes
// Note: These routes are mounted at root to maintain compatibility with existing frontend
// The route files define routes like '/login', so mounting at '/' preserves the original paths
app.use('/', authRoutes);
app.use('/', passwordRoutes);
app.use('/', settingsRoutes);
app.use('/', learningRoutes);
app.use('/', userRoutes);
app.use('/', pageRoutes);
app.use('/', officialtimeRoutes);
app.use('/', remittanceRoutes);
app.use('/', itemRoutes);
app.use('/', salaryRoutes);
app.use('/', departmentRoutes);
app.use('/', leaveRoutes);
app.use('/', holidayRoutes);
app.use('/', philhealthRoutes);
app.use('/', profileRoutes);
app.use('/', announcementsRoutes);
app.use('/', auditRoutes);
app.use('/', tasksRoutes);
app.use('/', dashboardRoutes);
app.use('/', notesRoutes);
app.use('/', eventsRoutes);
app.use('/', notificationsRoutes);
app.use('/', reportsRoutes);
app.use('/', settingsExtendedRoutes);
app.use('/', confidentialPasswordRoutes);

// ============================================
// ROUTE ORGANIZATION STATUS
// ============================================
// All routes have been successfully organized into separate route files:
//
// DONE: routes/users.js
//   - POST /register
//   - POST /excel-register
//   - GET /users
//   - GET /users/:employeeNumber
//
// DONE: routes/pages.js
//   - GET /pages
//   - POST /pages
//   - PUT /pages/:id
//   - DELETE /pages/:id
//   - GET /page_access/:employeeNumber
//   - POST /page_access
//   - PUT /page_access/:employeeNumber/:pageId
//
// DONE: routes/learning.js
//   - GET /learning_and_development_table
//   - GET /learning_and_development_table/by-person/:person_id
//   - POST /learning_and_development_table
//   - PUT /learning_and_development_table/:id
//   - DELETE /learning_and_development_table/:id
//   - POST /upload_learning_and_development_table
//
// DONE: routes/officialtime.js
//   - GET /officialtimetable/:employeeID
//   - POST /officialtimetable
//   - POST /upload-excel-faculty-official-time
//
// DONE: routes/remittance.js
//   - GET /employee-remittance
//   - POST /employee-remittance
//   - PUT /employee-remittance/:id
//   - DELETE /employee-remittance/:id
//
// DONE: routes/item.js
//   - GET /api/item-table
//   - POST /api/item-table
//   - PUT /api/item-table/:id
//   - DELETE /api/item-table/:id
//
// DONE: routes/salary.js
//   - GET /api/salary-grade-status
//   - POST /api/salary-grade-status
//   - PUT /api/salary-grade-status/:id
//   - DELETE /api/salary-grade-status/:id
//
// DONE: routes/department.js
//   - GET /api/department-table
//   - GET /api/department-table/:id
//   - POST /api/department-table
//   - PUT /api/department-table/:id
//   - DELETE /api/department-table/:id
//   - GET /api/department-assignment
//   - GET /api/department-assignment/:id
//   - POST /api/department-assignment
//   - PUT /api/department-assignment/:id
//   - DELETE /api/department-assignment/:id
//
// DONE: routes/leave.js
//   - GET /leave
//   - POST /leave
//   - PUT /leave/:id
//   - DELETE /leave/:id
//   - POST /leave_assignment
//   - GET /leave_assignment
//   - PUT /leave_assignment/:id
//   - DELETE /leave_assignment/:id
//
// DONE: routes/holiday.js
//   - GET /holiday
//   - POST /holiday
//   - PUT /holiday/:id
//   - DELETE /holiday/:id
//
// DONE: routes/philhealth.js
//   - POST /api/philhealth
//   - GET /api/philhealth
//   - PUT /api/philhealth/:id
//   - DELETE /api/philhealth/:id
//
// DONE: routes/profile.js
//   - POST /upload-profile-picture/:employeeNumber
//
// DONE: routes/announcements.js
//   - GET /api/announcements
//   - POST /api/announcements
//   - PUT /api/announcements/:id
//   - DELETE /api/announcements/:id
//
// DONE: routes/audit.js
//   - GET /audit-logs
//
// DONE: routes/tasks.js
//   - GET /tasks
//   - POST /tasks
//   - PUT /tasks/:id/toggle
//   - DELETE /tasks/:id
//
// DONE: routes/dashboard.js
//   - GET /api/dashboard/stats
//   - GET /api/dashboard/attendance-overview
//   - GET /api/dashboard/department-distribution
//   - GET /api/dashboard/leave-stats
//   - GET /api/dashboard/recent-activities
//   - GET /api/dashboard/payroll-summary
//   - GET /api/dashboard/monthly-attendance
//   - GET /api/dashboard/employee-growth
//   - GET /api/dashboard/employee-stats/:employeeNumber
//
// DONE: routes/notes.js
//   - GET /api/notes/:employeeNumber
//   - POST /api/notes
//   - DELETE /api/notes/:id
//
// DONE: routes/events.js
//   - GET /api/events/:employeeNumber
//   - POST /api/events
//   - DELETE /api/events/:id
//
// DONE: routes/settings.js
//   - GET /api/system-settings
//   - GET /api/system-settings/:key
//   - PUT /api/system-settings
//   - PUT /api/system-settings/:key
//   - DELETE /api/system-settings/:key
//   - POST /api/system-settings/reset
//   - GET /api/settings
//   - POST /api/settings

// Server startup
const PORT = process.env.WEB_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

module.exports = app;
