import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  createTheme,
  ThemeProvider,
  Typography,
  Box,
} from '@mui/material';
import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';
import {
  SystemSettingsProvider,
  useSystemSettings,
} from './contexts/SystemSettingsContext';
import '@fontsource/poppins';
import earistLogo from './assets/earistLogo.jpg';
import hrisLogo from './assets/hrisLogo.png';
import API_BASE_URL from './apiConfig';

import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import LoadingOverlay from './components/LoadingOverlay';
import SuccessfulOverlay from './components/SuccessfulOverlay';
import AccessDenied from './components/AccessDenied';
import SystemSetting from './SystemSettings';

import Home from './components/Home';
import Sidebar from './components/Sidebar';
import AdminHome from './components/HomeAdmin';
import ForgotPassword from './components/ForgotPassword';
import AnnouncementForm from './components/Announcement';
import Profile from './components/DASHBOARD/Profile';
import BulkRegister from './components/BulkRegister';
import Registration from './components/Registration';
import Reports from './components/Reports';
import EmployeeReports from './components/EmployeeReports';

import PersonalTable from './components/DASHBOARD/PersonTable';
import Children from './components/DASHBOARD/Children';
import College from './components/DASHBOARD/College';
import OtherSkills from './components/DASHBOARD/OtheInformation';
import WorkExperience from './components/DASHBOARD/WorkExperience';
import Vocational from './components/DASHBOARD/Vocational';
import LearningAndDevelopment from './components/DASHBOARD/LearningAndDevelopment';
import VoluntaryWork from './components/DASHBOARD/Voluntary';
import Eligibility from './components/DASHBOARD/Eligibility';
import GraduateTable from './components/DASHBOARD/GraduateStudies';

import ViewAttendanceRecord from './components/ATTENDANCE/AttendanceDevice';
import AttendanceModification from './components/ATTENDANCE/AttendanceModification';
import AttendanceUserState from './components/ATTENDANCE/AttendanceUserState';
import DailyTimeRecord from './components/ATTENDANCE/DailyTimeRecord';
import DailyTimeRecordFaculty from './components/ATTENDANCE/DailyTimeRecordOverall';
import AttendanceForm from './components/ATTENDANCE/AttendanceState';
import AttendanceModule from './components/ATTENDANCE/AttendanceModuleNonTeaching';
import AttendanceModuleFaculty from './components/ATTENDANCE/AttendanceModuleFaculty30hrs';
import AttendanceModuleFaculty40 from './components/ATTENDANCE/AttendanceModuleFacultyDesignated';
import OverallAttendancePage from './components/ATTENDANCE/AttendanceSummary';
import OfficialTimeForm from './components/ATTENDANCE/OfficialTimeForm';

import Remittances from './components/PAYROLL/Remittances';
import ItemTable from './components/PAYROLL/ItemTable';
import SalaryGradeTable from './components/PAYROLL/SalaryGradeTable';
import DepartmentTable from './components/PAYROLL/DepartmentTable';
import DepartmentAssignment from './components/PAYROLL/DepartmentAssignment';
import Holiday from './components/PAYROLL/Holiday';
import PhilHealthTable from './components/PAYROLL/PhilHealth';
import PayrollProcess from './components/PAYROLL/PayrollProcessing';
import PayrollProcessed from './components/PAYROLL/PayrollProcessed';
import PayrollReleased from './components/PAYROLL/PayrollReleased';

import AssessmentClearance from './components/FORMS/AssessmentClearance';
import Clearance from './components/FORMS/Clearance';
import ClearanceBack from './components/FORMS/ClearanceBack';
import FacultyClearance from './components/FORMS/FacultyClearance';
import FacultyClearance70Days from './components/FORMS/FacultyClearance70Days';
import InServiceTraining from './components/FORMS/InServiceTraining';
import LeaveCard from './components/FORMS/LeaveCard';
import LeaveCardBack from './components/FORMS/LeaveCardBack';
import LocatorSlip from './components/FORMS/LocatorSlip';
import PermissionToTeach from './components/FORMS/PermissionToTeach';
import RequestForID from './components/FORMS/RequestForID';
import SalnFront from './components/FORMS/SalnFront';
import SalnBack from './components/FORMS/SalnBack';
import ScholarshipAgreement from './components/FORMS/ScholarshipAgreement';
import SubjectStillToBeTaken from './components/FORMS/SubjectStillToBeTaken';
import IndividualFacultyLoading from './components/FORMS/IndividualFacultyLoading';
import HrmsRequestForms from './components/FORMS/HRMSRequestForms';
import EmploymentCategoryManagement from './components/EmploymentCategory';

import PDS1 from './components/PDS/PDS1';
import PDS2 from './components/PDS/PDS2';
import PDS3 from './components/PDS/PDS3';
import PDS4 from './components/PDS/PDS4';

import Payslip from './components/PAYROLL/Payslip';
import PayslipOverall from './components/PAYROLL/PayslipOverall';
import PayslipDistribution from './components/PAYROLL/PayslipDistribution';

import LeaveRequestUser from './components/LEAVE/LeaveRequestUser';
import LeaveTable from './components/LEAVE/LeaveTable';
import LeaveRequest from './components/LEAVE/LeaveRequest';
import LeaveDatePickerModal from './components/LEAVE/LeaveDatePicker';
import LeaveAssignment from './components/LEAVE/LeaveAssignment';
import LeaveCredits from './components/LEAVE/LeaveCredits';

import UsersList from './components/UsersList';
import PagesList from './components/PagesList';
import AuditLogs from './components/AuditLogs';
import Settings from './components/Settings';
import PayrollJO from './components/PAYROLL/PayrollJO';
import UnderConstruction from './components/UnderConstruction';

function App() {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const [open5, setOpen5] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const location = useLocation();
  const [open6, setOpen6] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Use the system settings from context
  const { settings: systemSettings } = useSystemSettings();

  const handleClick = () => setOpen(!open);
  const handleClickAttendance = () => setOpen2(!open2);
  const handleClickPayroll = () => setOpen3(!open3);
  const handleClickForms = () => setOpen4(!open4);
  const handleClickPDSFiles = () => setOpen5(!open5);

  const handleDrawerStateChange = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  const handleMainContentClick = (e) => {
    if (isLocked && drawerOpen) {
      setDrawerOpen(false);
      setIsLocked(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const drawerWidth = 270;
  const collapsedWidth = 60;

  const dynamicTheme = createTheme({
    typography: {
      fontFamily: 'Poppins, sans-serif',
      body1: { fontSize: '13px' },
    },
    palette: {
      primary: {
        main: systemSettings.primaryColor,
        dark: systemSettings.hoverColor,
        light: systemSettings.accentColor,
      },
      secondary: {
        main: systemSettings.secondaryColor,
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: {
            backgroundColor: systemSettings.primaryColor,
            color: systemSettings.textColor,
            '&:hover': {
              backgroundColor: systemSettings.hoverColor,
            },
          },
          outlined: {
            borderColor: systemSettings.primaryColor,
            color: systemSettings.primaryColor,
            '&:hover': {
              borderColor: systemSettings.hoverColor,
              backgroundColor: `${systemSettings.accentColor}33`,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: systemSettings.primaryColor,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: systemSettings.primaryColor,
              color: systemSettings.textColor,
              fontWeight: 'bold',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          filled: {
            backgroundColor: systemSettings.accentColor,
            color: '#000000',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: systemSettings.primaryColor,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: `${systemSettings.accentColor}88`,
          },
          bar: {
            backgroundColor: systemSettings.primaryColor,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '10vh',
          overflow: 'hidden',
        }}
      >
        {}
        <AppBar
          position="fixed"
          sx={{
            zIndex: 1201,
            bgcolor: systemSettings.secondaryColor,
            height: '62px',
            overflow: 'hidden',
          }}
        >
          <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
            <>
              <img
                src={systemSettings.institutionLogo || earistLogo}
                alt="Institution Logo"
                width="45"
                height="45"
                style={{
                  marginRight: '10px',
                  border: '1px solid white',
                  borderRadius: '50px',
                  marginLeft: '-15px',
                }}
              />
            </>

            <Box>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  lineHeight: 1.2,
                  color: systemSettings.textColor,
                  marginTop: '8px',
                }}
              >
                {systemSettings.institutionName}
              </Typography>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{
                  color: systemSettings.textColor,
                  fontWeight: 'bold',
                  marginTop: '-5px',
                }}
              >
                {systemSettings.systemName}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {!['/', '/login', '/register', '/forgot-password'].includes(
          location.pathname
        ) && (
          <Sidebar
            open={open}
            handleClick={handleClick}
            open2={open2}
            handleClickAttendance={handleClickAttendance}
            open3={open3}
            handleClickPayroll={handleClickPayroll}
            open4={open4}
            handleClickForms={handleClickForms}
            open5={open5}
            handleClickPDSFiles={handleClickPDSFiles}
            onDrawerStateChange={handleDrawerStateChange}
            systemSettings={systemSettings}
          />
        )}

        {}
        <Box
          component="main"
          onClick={handleMainContentClick}
          sx={{
            flexGrow: 1,
            bgcolor: 'transparent',
            p: 5,
            marginLeft: drawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px`,
            transition: 'margin-left 0.3s ease',
            fontFamily: 'Poppins, sans-serif',
            minHeight: '100vh',

            '& .MuiPaper-root': {
              borderColor: systemSettings.primaryColor,
            },
            '& .MuiButton-contained': {
              backgroundColor: systemSettings.primaryColor,
              '&:hover': {
                backgroundColor: systemSettings.hoverColor,
              },
            },
            '& .MuiTableHead-root': {
              '& .MuiTableCell-head': {
                backgroundColor: systemSettings.primaryColor,
                color: systemSettings.textColor,
                fontWeight: 'bold',
              },
            },
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/bulk-register" element={<BulkRegister />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/reset-password"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ResetPassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/home"
              element={
                <ProtectedRoute
                  allowedRoles={['administrator', 'superadmin', 'staff']}
                >
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/children"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Children />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voluntarywork"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <VoluntaryWork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learningdev"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LearningAndDevelopment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eligibility"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Eligibility />
                </ProtectedRoute>
              }
            />
            <Route
              path="/college"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <College />
                </ProtectedRoute>
              }
            />
            <Route
              path="/graduate"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <GraduateTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vocational"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Vocational />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workexperience"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <WorkExperience />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personalinfo"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PersonalTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/other-information"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <OtherSkills />
                </ProtectedRoute>
              }
            />

            <Route
              path="/view_attendance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ViewAttendanceRecord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search_attendance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceModification />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance-user-state"
              element={
                <ProtectedRoute
                  allowedRoles={['administrator', 'superadmin', 'staff']}
                >
                  <AttendanceUserState />
                </ProtectedRoute>
              }
            />

            <Route
              path="/daily_time_record"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <DailyTimeRecord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily_time_record_faculty"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <DailyTimeRecordFaculty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance_form"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <AttendanceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance_module"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance_module_faculty"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceModuleFaculty />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance_module_faculty_40hrs"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceModuleFaculty40 />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance_summary"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <OverallAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/official_time"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <OfficialTimeForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pds1"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pds2"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pds3"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS3 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pds4"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS4 />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PayrollProcess />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll-processed"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PayrollProcessed />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll-released"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PayrollReleased />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll-jo"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PayrollJO />
                </ProtectedRoute>
              }
            />

            <Route
              path="/remittance-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Remittances />
                </ProtectedRoute>
              }
            />

            <Route
              path="/philhealth-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PhilHealthTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/item-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ItemTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/salary-grade"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SalaryGradeTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <DepartmentTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-assignment"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <DepartmentAssignment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/holiday"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Holiday />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessment-clearance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AssessmentClearance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clearance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Clearance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clearance-back"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ClearanceBack />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty-clearance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <FacultyClearance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty-clearance-70-days"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <FacultyClearance70Days />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hrms-request-forms"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <HrmsRequestForms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/individual-faculty-loading"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <IndividualFacultyLoading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/in-service-training"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <InServiceTraining />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave-card"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LeaveCard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave-card-back"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LeaveCardBack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/locator-slip"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LocatorSlip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/permission-to-teach"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PermissionToTeach />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-for-id"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <RequestForID />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saln-front"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SalnFront />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saln-back"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SalnBack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scholarship-agreement"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ScholarshipAgreement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subject"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SubjectStillToBeTaken />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/announcement"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <AnnouncementForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payslip"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <Payslip />
                </ProtectedRoute>
              }
            />

            <Route
              path="/overall-payslip"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PayslipOverall />
                </ProtectedRoute>
              }
            />

            <Route
              path="/distribution-payslip"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PayslipDistribution />
                </ProtectedRoute>
              }
            />

            <Route
              path="/loading-overlay"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <LoadingOverlay />
                </ProtectedRoute>
              }
            />

            <Route
              path="/successful-overlay"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <SuccessfulOverlay />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin-home"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <AdminHome />
                </ProtectedRoute>
              }
            />

            <Route
              path="employee-category"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <EmploymentCategoryManagement />
                </ProtectedRoute>
              }
            />

            <Route path="/leave-table" element={<UnderConstruction />} />

            <Route path="/leave-request" element={<UnderConstruction />} />

            <Route path="/leave-request-user" element={<UnderConstruction />} />

            <Route path="/leave-assignment" element={<UnderConstruction />} />

            <Route path="/leave-date-picker" element={<UnderConstruction />} />

            <Route path="/leave-credits" element={<UnderConstruction />} />

            <Route
              path="/users-list"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <UsersList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pages-list"
              element={
                <ProtectedRoute
                  allowedRoles={['administrator', 'superadmin', 'staff']}
                >
                  <PagesList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-reports"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <EmployeeReports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/system-settings"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SystemSetting />
                </ProtectedRoute>
              }
            />

            <Route path="/under-construction" element={<UnderConstruction />} />
            <Route path="/access-denied" element={<AccessDenied />} />
          </Routes>
        </Box>

        {}
        <Box
          component="footer"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: systemSettings.secondaryColor,
            color: systemSettings.textColor,
            textAlign: 'center',
            padding: '20px',
            height: '10px',
            overflow: 'hidden',
          }}
        >
          <Typography variant="body2" sx={{ zIndex: 1, position: 'relative' }}>
            {systemSettings.footerText}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function WrappedApp() {
  return (
    <SystemSettingsProvider>
      <Router>
        <App />
      </Router>
    </SystemSettingsProvider>
  );
}
