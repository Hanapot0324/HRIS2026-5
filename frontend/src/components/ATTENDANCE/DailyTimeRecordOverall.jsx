/* full file with the name wrapping fix */
import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  AccessTime,
  CalendarToday,
  SearchOutlined,
  ArrowBack,
  ArrowForward,
  Close,
} from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress as MCircularProgress,
} from '@mui/material';
import earistLogo from '../../assets/earistLogo.png';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { alpha } from '@mui/material/styles';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import usePageAccess from '../../hooks/usePageAccess';
import AccessDenied from '../AccessDenied';

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16,
      )}`
    : '109, 35, 35';
};

// --- FIXED STYLED COMPONENTS (Removed Transforms to stop movement) ---

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const ProfessionalButton = styled(Button)(
  ({ theme, variant, color = 'primary' }) => ({
    borderRadius: 12,
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'box-shadow 0.2s ease-in-out, background-color 0.2s',
    textTransform: 'none',
    fontSize: '0.95rem',
    letterSpacing: '0.025em',
    boxShadow:
      variant === 'contained' ? '0 4px 14px rgba(254, 249, 225, 0.25)' : 'none',
    '&:hover': {
      boxShadow:
        variant === 'contained'
          ? '0 6px 20px rgba(254, 249, 225, 0.35)'
          : 'none',
    },
    '&:active': {
      boxShadow: 'none',
    },
  }),
);

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition:
      'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 20px rgba(254, 249, 225, 0.25)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const DailyTimeRecordFaculty = () => {
  const { settings } = useSystemSettings();
  const [personID, setPersonID] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [officialTimes, setOfficialTimes] = useState({});
  const dtrRef = React.useRef(null);

  // Bulk printing states
  const [allUsersDTR, setAllUsersDTR] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  // Replace surnameFilter with a free-text search query
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const bulkDTRRefs = React.useRef({});

  // Year / month selector (added like AttendanceDevice)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Modal states for carousel preview
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewUsers, setPreviewUsers] = useState([]);

  // Hide visible popup preview during printing
  const [printingAll, setPrintingAll] = useState(false);
  const [printingStatus, setPrintingStatus] = useState('');

  // View mode state: 'single' or 'multiple'
  const [viewMode, setViewMode] = useState('single');

  // Record filter: 'all' | 'has' | 'no'
  const [recordFilter, setRecordFilter] = useState('all');

  // Get colors from system settings
  const primaryColor = settings.accentColor || '#FEF9E1';
  const secondaryColor = settings.backgroundColor || '#FFF8E7';
  const accentColor = settings.primaryColor || '#6d2323';
  const accentDark = settings.secondaryColor || '#8B3333';
  const textPrimaryColor = settings.textPrimaryColor || '#6d2323';
  const textSecondaryColor = settings.textSecondaryColor || '#FEF9E1';
  const hoverColor = settings.hoverColor || '#6D2323';

  // ACCESS: page access control
  const {
    hasAccess,
    loading: accessLoading,
    error: accessError,
  } = usePageAccess('daily-time-record-faculty');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  // Mirror: set personID from token exactly like main component
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPersonID(decoded.employeeNumber);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Use a single constant width (in) for DTR rendering/capture so all variants match
  const DTR_WIDTH_IN = '8.7in'; // match main DailyTimeRecord table width

  /**
   * Formats a user's name to "SURNAME, Firstname M." (clean)
   * Accepts user objects from both /users and attendance responses.
   */
  const formatFullName = (user = {}) => {
    const last = (
      user.lastName ||
      user.surname ||
      user.familyName ||
      ''
    ).trim();
    const first = (user.firstName || user.givenName || '').trim();
    const middleRaw = (user.middleName || user.middleInitial || '').trim();

    const capitalize = (s) =>
      s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

    let middle = '';
    if (middleRaw) {
      // Use only initial if middle name is longer
      const initial = middleRaw.charAt(0).toUpperCase();
      middle = `${initial}.`;
    }

    const lastPart = last ? last.toUpperCase() : '';
    const firstPart = first ? capitalize(first) : '';
    const full = `${lastPart}${lastPart && firstPart ? ', ' : ''}${firstPart}${
      middle ? ' ' + middle : ''
    }`.trim();

    // Fallback to any available fullName or employee displayName
    if (!full) {
      return user.fullName || user.displayName || 'Unknown';
    }
    return full;
  };

  /**
   * Fetches the official working hours for a specific employee
   */
  const fetchOfficialTimes = async (employeeID) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/officialtimetable/${employeeID}`,
        getAuthHeaders(),
      );

      const data = response.data;

      const officialTimesMap = data.reduce((acc, record) => {
        acc[record.day] = {
          officialTimeIN: record.officialTimeIN,
          officialTimeOUT: record.officialTimeOUT,
          officialBreaktimeIN: record.officialBreaktimeIN,
          officialBreaktimeOUT: record.officialBreaktimeOUT,
        };
        return acc;
      }, {});

      setOfficialTimes(officialTimesMap);
    } catch (error) {
      console.error('Error fetching official times:', error);
      setOfficialTimes({});
    }
  };

  useEffect(() => {
    if (personID) {
      fetchOfficialTimes(personID);
    }
  }, [personID]);

  const fetchRecords = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/api/view-attendance`,
        {
          personID,
          startDate,
          endDate,
        },
        getAuthHeaders(),
      );

      const data = response.data;

      if (data.length > 0) {
        setRecords(data);
        const { firstName, lastName, middleName } = data[0];
        setEmployeeName(formatFullName({ firstName, lastName, middleName }));
        await fetchOfficialTimes(personID);
      } else {
        setRecords([]);
        setEmployeeName('No records found');
        setOfficialTimes({});
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all users and their DTR data
  const fetchAllUsersDTR = async () => {
    if (!startDate || !endDate) {
      alert('Please select start date and end date first');
      return;
    }

    setLoadingAllUsers(true);
    try {
      const usersResponse = await axios.get(
        `${API_BASE_URL}/users`,
        getAuthHeaders(),
      );

      const users = usersResponse.data || [];

      const dtrPromises = users.map(async (user) => {
        try {
          const dtrResponse = await axios.post(
            `${API_BASE_URL}/attendance/api/view-attendance`,
            {
              personID: user.employeeNumber,
              startDate,
              endDate,
            },
            getAuthHeaders(),
          );

          const dtrData = dtrResponse.data || [];
          const fullName = formatFullName(user);

          return {
            employeeNumber: user.employeeNumber,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            fullName,
            records: dtrData,
            hasRecords: dtrData.length > 0,
            rawUser: user,
          };
        } catch (error) {
          console.error(
            `Error fetching DTR for ${user.employeeNumber}:`,
            error,
          );
          const fullName = formatFullName(user);
          return {
            employeeNumber: user.employeeNumber,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            fullName,
            records: [],
            hasRecords: false,
            rawUser: user,
          };
        }
      });

      const allDTRData = await Promise.all(dtrPromises);
      allDTRData.sort((a, b) => {
        const lastNameA = (a.lastName || '').toUpperCase();
        const lastNameB = (b.lastName || '').toUpperCase();
        // Fallback to fullName compare if last names not available
        if (!lastNameA && !lastNameB)
          return a.fullName.localeCompare(b.fullName);
        return lastNameA.localeCompare(lastNameB);
      });

      setAllUsersDTR(allDTRData);
      // Reset pagination and selection when new dataset loads
      setSelectedUsers(new Set());
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching all users DTR:', error);
      alert('Error fetching users DTR data');
    } finally {
      setLoadingAllUsers(false);
    }
  };

  // Selection helpers
  const handleUserSelect = (employeeNumber) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(employeeNumber)) newSelected.delete(employeeNumber);
    else newSelected.add(employeeNumber);
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const filtered = getFilteredUsers();
      setSelectedUsers(new Set(filtered.map((user) => user.employeeNumber)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // New filter: free-text search that filters by name or employee number
  const getFilteredUsers = () => {
    let filtered = allUsersDTR.slice();

    // Apply record filter first
    if (recordFilter === 'has') {
      filtered = filtered.filter((u) => u.records && u.records.length > 0);
    } else if (recordFilter === 'no') {
      filtered = filtered.filter((u) => !u.records || u.records.length === 0);
    }

    if (!searchQuery || searchQuery.trim() === '') return filtered;
    const q = searchQuery.trim().toLowerCase();
    return filtered.filter((user) => {
      const full = (
        user.fullName || `${user.firstName || ''} ${user.lastName || ''}`
      ).toLowerCase();
      const last = (user.lastName || '').toLowerCase();
      const emp = (user.employeeNumber || '').toLowerCase();
      return full.includes(q) || last.includes(q) || emp.includes(q);
    });
  };

  // Pagination / scroller states for the records table
  const [rowsPerPage, setRowsPerPage] = useState(10); // user wants 10s, 20s, etc.
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    (currentPage - 1) * rowsPerPage + rowsPerPage,
  );

  // helper to change page safely
  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };

  // Auto-select helper for "first N" behavior
  const handleAutoSelectFirstN = (n) => {
    const filtered = getFilteredUsers(); // always use current filters
    if (!filtered || filtered.length === 0) {
      setSelectedUsers(new Set());
      return;
    }
    if (n === 'all') {
      setSelectedUsers(new Set(filtered.map((u) => u.employeeNumber)));
      return;
    }
    const count = Number(n) || 0;
    const toSelect = filtered.slice(0, count).map((u) => u.employeeNumber);
    setSelectedUsers(new Set(toSelect));
    // Optionally set the previewUsers to the same selection immediately
    const toPreview = filtered.slice(0, count);
    setPreviewUsers(toPreview);
    setCurrentPreviewIndex(0);
  };

  // Bulk print flow
  const handleBulkPrint = () => {
    const filtered = getFilteredUsers();
    const toPrint = filtered.filter((u) => selectedUsers.has(u.employeeNumber));
    if (toPrint.length === 0) {
      alert('Please select at least one user to print');
      return;
    }
    setPreviewUsers(toPrint);
    setCurrentPreviewIndex(0);
    setPreviewModalOpen(true);
  };

  const handlePrevious = () =>
    setCurrentPreviewIndex((p) => (p > 0 ? p - 1 : previewUsers.length - 1));
  const handleNext = () =>
    setCurrentPreviewIndex((p) => (p < previewUsers.length - 1 ? p + 1 : 0));

  // --- Mirror printPage & downloadPDF from DailyTimeRecord (single user) ---
  const printPage = async () => {
    if (!dtrRef.current) return;

    try {
      // Initialize PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4',
      });

      // Capture the visual state
      const canvas = await html2canvas(dtrRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // Fixed dimensions (same as downloadPDF in main)
      const dtrWidth = 8; // match DailyTimeRecord
      const dtrHeight = 9.5; // match DailyTimeRecord

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Center horizontally and vertically
      const xOffset = (pageWidth - dtrWidth) / 2;
      const yOffset = (pageHeight - dtrHeight) / 2;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, dtrWidth, dtrHeight);

      // Auto print and open in new tab
      pdf.autoPrint();
      const blobUrl = pdf.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error generating print view:', error);
    }
  };

  const downloadPDF = async () => {
    if (!dtrRef.current) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4',
      });

      const canvas = await html2canvas(dtrRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // Dimensions of the DTR content in inches (match main)
      const dtrWidth = 8;
      const dtrHeight = 10;

      // Get page size
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate centered positions
      const xOffset = (pageWidth - dtrWidth) / 2;
      const yOffset = (pageHeight - dtrHeight) / 2;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, dtrWidth, dtrHeight);
      pdf.save(`DTR-${employeeName}-${formatMonth(startDate)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  // --- end mirror ---

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const formatMonth = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'long' };
    return date.toLocaleDateString(undefined, options).toUpperCase();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.replace(/\s+/g, ' ').trim();
  };

  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  const handleMonthClick = (monthIndex) => {
    const start = new Date(Date.UTC(selectedYear, monthIndex, 1));
    const end = new Date(Date.UTC(selectedYear, monthIndex + 1, 0));
    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(end.toISOString().substring(0, 10));
    setSelectedMonth(monthIndex);
  };

  const formatStartDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatEndDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
    return `${day}, ${year}`;
  };

  const formattedStartDate = formatStartDate(startDate);
  const formattedEndDate = formatEndDate(endDate);

  // Helper to highlight matched text in user names
  const highlightMatch = (text, q) => {
    if (!q || !text) return text;
    const lower = text.toLowerCase();
    const qLower = q.toLowerCase();
    const idx = lower.indexOf(qLower);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <span>
        {before}
        <span
          style={{
            backgroundColor: alpha(accentColor, 0.25),
            padding: '0 3px',
            borderRadius: 2,
          }}
        >
          {match}
        </span>
        {after}
      </span>
    );
  };

  // ACCESSING UI states (loading / denied)
  if (accessLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <MCircularProgress sx={{ color: '#6d2323', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6d2323' }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (hasAccess === false) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have permission to access Daily Time Record. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  // Helper: visible modal DTR (keeps current layout)...
  const renderDTRForModal = (user) => {
    const dataFontSize = '10px';
    const rowHeight = '16px';

    const renderHeader = () => (
      <thead style={{ textAlign: 'center', position: 'relative' }}>
        <tr>
          <div
            style={{
              position: 'absolute',
              paddingTop: '25px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
              fontSize: '11px',
              fontFamily: 'Arial, "Times New Roman", serif',
              width: '100%',
              color: 'black',
            }}
          >
            Republic of the Philippines
          </div>
          <td
            colSpan="1"
            style={{
              position: 'relative',
              width: '60px',
            }}
          >
            <img
              src={earistLogo}
              alt="Logo"
              width="50"
              height="50"
              style={{
                position: 'absolute',
                top: '25px',
                right: '10px',
              }}
            />
          </td>
          <td
            colSpan="5"
            style={{
              verticalAlign: 'bottom',
              paddingBottom: '5px',
              paddingRight: '70px',
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '11.50px',
                fontWeight: 'bold',
                textAlign: 'center',
                width: '100%',
                fontFamily: 'Arial, "Times New Roman", serif',
                lineHeight: '1.2',
                paddingTop: '40px',
              }}
            >
              EULOGIO "AMANG" RODRIGUEZ <br /> INSTITUTE OF SCIENCE & TECHNOLOGY
            </p>
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colSpan="9">
            <p
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                marginTop: '-2%',
                fontFamily: 'Arial, serif',
              }}
            >
              Nagtahan, Sampaloc Manila
            </p>
          </td>
        </tr>
        <tr>
          <td colSpan="9">
            <p
              style={{
                fontSize: '8px',
                fontWeight: 'bold',
                paddingTop: '-2px',
                fontFamily: 'Arial, serif',
              }}
            >
              Civil Service Form No. 48
            </p>
          </td>
        </tr>
        <tr>
          <td colSpan="9" style={{ padding: '2', lineHeight: '0' }}>
            <h4
              style={{
                fontFamily: 'Times New Roman, serif',
                textAlign: 'center',
                marginTop: '2px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              DAILY TIME RECORD
            </h4>
          </td>
        </tr>
        <tr>
          <td
            colSpan="5"
            style={{
              paddingTop: '10px',
              paddingBottom: '5px',
              lineHeight: '1.1',
              verticalAlign: 'top',
            }}
          >
            <div
              style={{
                paddingLeft: '5px',
                marginTop: '0',
                fontFamily: 'Arial, serif',
                width: '100%',
                maxWidth: '250px',
              }}
            >
              <div
                style={{
                  borderBottom: '2px solid black',
                  width: '159%',
                  margin: '2px 0 3px 0',
                }}
              />
              {/* Employee Name */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  /* Allow full name to wrap and be visible instead of truncating */
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'unset',
                  wordBreak: 'break-word',
                  paddingLeft: '130px',
                  fontFamily: 'Times New Roman',
                }}
              >
                {user.fullName}
              </div>

              {/* Underline */}
              <div
                style={{
                  borderBottom: '2px solid black',
                  width: '159%',
                  margin: '2px 0 3px 0',
                }}
              />

              {/* Label */}
              <div
                style={{
                  fontSize: '9px',
                  textAlign: 'center',
                  paddingLeft: '130px',
                  fontFamily: 'Times New Roman',
                }}
              >
                NAME
              </div>
            </div>
          </td>

          <td></td>
        </tr>

        <tr>
          <td colSpan="9" style={{ padding: '2px 0', lineHeight: '1.1' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                paddingLeft: '5px',
                fontFamily: 'Times New Roman, serif',
                fontSize: '10px',
              }}
            >
              <span style={{ marginRight: '6px' }}>Covered Dates:</span>

              <div style={{ minWidth: '220px', flexGrow: 1 }}>
                {/* Value */}
                <div
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'left',
                    fontSize: '10px',
                    fontFamily: 'Times New Roman, serif',
                  }}
                >
                  {formattedStartDate} - {formattedEndDate}
                </div>
              </div>
            </div>
          </td>
        </tr>

        <tr>
          <td
            colSpan="9"
            style={{
              padding: '2',
              lineHeight: '2',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                margin: '0',
                paddingLeft: '5px',
                fontFamily: 'Times New Roman, serif',
              }}
            >
              For the month of: <b>{startDate ? formatMonth(startDate) : ''}</b>
            </p>
          </td>
        </tr>
        <tr>
          <td
            colSpan="9"
            style={{
              padding: '8px 5px 2px 5px',
              textAlign: 'left',
              fontSize: '10px',
              fontFamily: 'Arial, serif',
              lineHeight: '1.2',
            }}
          >
            Official hours for arrival (regular day) and departure
          </td>
        </tr>

        {/* Replace absolute-positioned "Regular Days" with a fixed-height table row
            to prevent shifting when data loads. */}
        <tr>
          <td colSpan="9" style={{ padding: '2px 5px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '5%',
                height: '14px',
                marginBottom: '0px',
                fontFamily: 'Arial, serif',
                fontSize: '10px',
              }}
            >
              <span style={{ marginRight: '8px' }}>Regular Days:</span>
              <span
                style={{
                  display: 'inline-block',
                  borderBottom: '1.5px solid black',
                  flexGrow: 1,
                  minWidth: '300px',
                }}
              ></span>
            </div>
          </td>
        </tr>

        {/* Spacer rows to preserve original visual spacing */}
        {Array.from({ length: 2 }, (_, i) => (
          <tr key={`empty2-${i}`}>
            <td colSpan="3"></td>
            <td></td>
          </tr>
        ))}

        {/* "Saturdays" label as a stable table row instead of absolute */}
        <tr>
          <td colSpan="9" style={{ padding: '4px 5px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '5%',
                height: '28px', // fixed height
                fontFamily: 'Arial, serif',
                fontSize: '10px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ marginRight: '8px' }}>Saturdays:</span>
              <span
                style={{
                  display: 'inline-block',
                  borderBottom: '1.5px solid black',
                  flexGrow: 1,
                  minWidth: '318px',
                }}
              ></span>
            </div>
          </td>
        </tr>

        {Array.from({ length: 2 }, (_, i) => (
          <tr key={`empty3-${i}`}>
            <td colSpan="3"></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        ))}
        <tr>
          <th
            rowSpan="2"
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
            }}
          >
            DAY
          </th>
          <th
            colSpan="2"
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
            }}
          >
            A.M.
          </th>
          <th
            colSpan="2"
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
            }}
          >
            P.M.
          </th>
          <th
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
            }}
          >
            Late
          </th>
          <th
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
            }}
          >
            Undertime
          </th>
        </tr>
        <tr style={{ textAlign: 'center' }}>
          <td
            style={{
              border: '1px solid black',
              fontSize: '9px',
              fontFamily: 'Arial, serif',
            }}
          >
            Arrival
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '9px',
              fontFamily: 'Arial, serif',
            }}
          >
            Departure
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '9px',
              fontFamily: 'Arial, serif',
            }}
          >
            Arrival
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '9px',
              fontFamily: 'Arial, serif',
            }}
          >
            Departure
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '9px',
              fontFamily: 'Arial, serif',
            }}
          >
            Min
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '9px',
              fontFamily: 'Arial, serif',
            }}
          >
            Min
          </td>
        </tr>
      </thead>
    );

    const cellStyle = {
      border: '1px solid black',
      textAlign: 'center',
      padding: '0 2px',
      fontFamily: 'Arial, serif',
      fontSize: '10px',
      height: rowHeight,
      whiteSpace: 'nowrap',
    };

    return (
      <div className="table-container">
        <div className="table-wrapper">
          <div
            style={{
              display: 'flex',
              gap: '2%',
              width: '8.7in',
              minWidth: '8.5in',
              margin: '0 auto',
              backgroundColor: 'white',
            }}
            className="table-side-by-side"
          >
            {/* ================= TABLE 1 ================= */}
            <table
              style={{
                position: 'relative',
                border: '1px solid black',
                borderCollapse: 'collapse',
                width: '49%',
                tableLayout: 'fixed',
              }}
              className="print-visble"
            >
              {renderHeader()}
              <tbody>
                {Array.from({ length: 31 }, (_, i) => {
                  const day = (i + 1).toString().padStart(2, '0');
                  const record = user.records.find((r) =>
                    r.date.endsWith(`-${day}`),
                  );
                  return (
                    <tr key={i}>
                      <td style={cellStyle}>{day}</td>
                      <td style={cellStyle}>
                        {formatTime(record?.timeIN || '')}
                      </td>
                      <td style={cellStyle}>
                        {formatTime(record?.breaktimeIN || '')}
                      </td>
                      <td style={cellStyle}>
                        {formatTime(record?.breaktimeOUT || '')}
                      </td>
                      <td style={cellStyle}>
                        {formatTime(record?.timeOUT || '')}
                      </td>
                      <td style={cellStyle}>{record?.minutes || ''}</td>
                      <td style={cellStyle}>{record?.minutes || ''}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="7" style={{ padding: '10px 5px' }}>
                    <hr
                      style={{
                        borderTop: '2px solid black',
                        width: '100%',
                      }}
                    />
                    <p
                      style={{
                        textAlign: 'justify',
                        fontSize: '9px',
                        lineHeight: '1.1',
                        fontFamily: 'Times New Roman, serif',
                        margin: '5px 0',
                      }}
                    >
                      I CERTIFY on my honor that the above is a true and correct
                      report of the hours of work performed, record of which was
                      made daily at the time of arrival and at the time of
                      departure from office.
                    </p>
                    <div
                      style={{
                        width: '50%',
                        marginLeft: 'auto',
                        textAlign: 'center',
                        marginTop: '15px',
                      }}
                    >
                      <hr
                        style={{
                          borderTop: '2px solid black',
                          margin: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: '9px',
                          fontFamily: 'Arial, serif',
                          margin: '5px 0 0 0',
                        }}
                      >
                        Signature
                      </p>
                    </div>
                    <div style={{ width: '100%', marginTop: '15px' }}>
                      <hr
                        style={{
                          borderTop: '1px solid black',
                          width: '100%',
                          margin: 0,
                        }}
                      />
                      <hr
                        style={{
                          borderTop: '1.5px solid black',
                          width: '100%',
                          margin: '2px 0 0 0',
                        }}
                      />
                      <p
                        style={{
                          paddingLeft: '30px',
                          fontSize: '9px',
                          fontFamily: 'Arial, serif',
                          margin: '5px 0 0 0',
                        }}
                      >
                        Verified as to prescribed office hours.
                      </p>
                    </div>

                    <div
                      style={{
                        width: '80%',
                        marginLeft: 'auto',
                        marginTop: '15px',
                        textAlign: 'center',
                      }}
                    >
                      <hr
                        style={{
                          borderTop: '2px solid black',
                          margin: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: '9px',
                          fontFamily: 'Times New Roman, serif',
                          margin: '2px 0 0 0',
                        }}
                      >
                        In-Charge
                      </p>
                      <p
                        style={{
                          fontSize: '9px',
                          fontFamily: 'Arial, serif',
                          margin: '0',
                        }}
                      >
                        (Signature Over Printed Name)
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ================= TABLE 2 ================= */}
            <table
              style={{
                position: 'relative',
                border: '1px solid black',
                borderCollapse: 'collapse',
                width: '49%',
                tableLayout: 'fixed',
              }}
              className="print-visble"
            >
              {renderHeader()}
              <tbody>
                {Array.from({ length: 31 }, (_, i) => {
                  const day = (i + 1).toString().padStart(2, '0');
                  const record = user.records.find((r) =>
                    r.date.endsWith(`-${day}`),
                  );
                  return (
                    <tr key={i}>
                      <td style={cellStyle}>{day}</td>
                      <td style={cellStyle}>
                        {formatTime(record?.timeIN || '')}
                      </td>
                      <td style={cellStyle}>
                        {formatTime(record?.breaktimeIN || '')}
                      </td>
                      <td style={cellStyle}>
                        {formatTime(record?.breaktimeOUT || '')}
                      </td>
                      <td style={cellStyle}>
                        {formatTime(record?.timeOUT || '')}
                      </td>
                      <td style={cellStyle}>{record?.hours || ''}</td>
                      <td style={cellStyle}>{record?.minutes || ''}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="7" style={{ padding: '10px 5px' }}>
                    <hr
                      style={{
                        borderTop: '2px solid black',
                        width: '100%',
                      }}
                    />
                    <p
                      style={{
                        textAlign: 'justify',
                        fontSize: '9px',
                        lineHeight: '1.1',
                        fontFamily: 'Times New Roman, serif',
                        margin: '5px 0',
                      }}
                    >
                      I CERTIFY on my honor that the above is a true and correct
                      report of the hours of work performed, record of which was
                      made daily at the time of arrival and at the time of
                      departure from office.
                    </p>
                    <div
                      style={{
                        width: '50%',
                        marginLeft: 'auto',
                        textAlign: 'center',
                        marginTop: '15px',
                      }}
                    >
                      <hr
                        style={{
                          borderTop: '2px solid black',
                          margin: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: '9px',
                          fontFamily: 'Arial, serif',
                          margin: '5px 0 0 0',
                        }}
                      >
                        Signature
                      </p>
                    </div>

                    <div style={{ width: '100%', marginTop: '15px' }}>
                      <hr
                        style={{
                          borderTop: '1px solid black',
                          width: '100%',
                          margin: 0,
                        }}
                      />
                      <hr
                        style={{
                          borderTop: '1.5px solid black',
                          width: '100%',
                          margin: '2px 0 0 0',
                        }}
                      />
                      <p
                        style={{
                          paddingLeft: '30px',
                          fontSize: '9px',
                          fontFamily: 'Arial, serif',
                          margin: '5px 0 0 0',
                        }}
                      >
                        Verified as to prescribed office hours.
                      </p>
                    </div>
                    <div
                      style={{
                        width: '80%',
                        marginLeft: 'auto',
                        marginTop: '15px',
                        textAlign: 'center',
                      }}
                    >
                      <hr
                        style={{
                          borderTop: '2px solid black',
                          margin: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: '9px',
                          fontFamily: 'Times New Roman, serif',
                          margin: '2px 0 0 0',
                        }}
                      >
                        In-Charge
                      </p>
                      <p
                        style={{
                          fontSize: '9px',
                          fontFamily: 'Arial, serif',
                          margin: '0',
                        }}
                      >
                        (Signature Over Printed Name)
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Hidden print-ready DTR (off-screen) for bulk printing — unchanged structure,
  // but we render these hidden elements inside the modal (off-screen) so they are available for html2canvas.
  const renderUserDTRTable = (user) => {
    return (
      <div
        ref={(el) => {
          if (el) bulkDTRRefs.current[user.employeeNumber] = el;
        }}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          visibility: 'hidden',
          width: DTR_WIDTH_IN,
          color: 'black',
        }}
        className="bulk-dtr-print"
      >
        {renderDTRForModal(user)}
      </div>
    );
  };

  // Printing helper for "Print All Selected" — hides visible preview, prints using off-screen DTRs, then closes modal.
  const handlePrintAllSelected = async () => {
    if (previewUsers.length === 0) {
      alert('No DTRs to print');
      return;
    }

    try {
      // Hide the visible popup preview to avoid confusion (the modal stays open, but the preview is replaced by a loading status)
      setPrintingAll(true);
      setPrintingStatus('Preparing DTRs...');

      // allow UI to update and ensure hidden off-screen elements have rendered
      await new Promise((res) => setTimeout(res, 300));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4',
      });

      // Use same centered dimensions as DailyTimeRecord
      const dtrWidth = 8;
      const dtrHeight = 9.5;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const xOffset = (pageWidth - dtrWidth) / 2;
      const yOffset = (pageHeight - dtrHeight) / 2;

      for (let i = 0; i < previewUsers.length; i++) {
        const user = previewUsers[i];
        const ref = bulkDTRRefs.current[user.employeeNumber];

        setPrintingStatus(`Capturing ${i + 1} of ${previewUsers.length}...`);

        if (!ref) {
          console.warn(`No ref found for ${user.employeeNumber}`);
          continue;
        }

        if (i > 0) pdf.addPage();

        // Show element for capture and ensure width equals DTR_WIDTH_IN
        const orig = {
          display: ref.style.display,
          position: ref.style.position,
          left: ref.style.left,
          top: ref.style.top,
          visibility: ref.style.visibility,
          width: ref.style.width,
          zIndex: ref.style.zIndex,
          backgroundColor: ref.style.backgroundColor,
          opacity: ref.style.opacity,
        };

        ref.style.display = 'block';
        ref.style.position = 'fixed';
        ref.style.left = '0';
        ref.style.top = '0';
        ref.style.width = DTR_WIDTH_IN;
        ref.style.zIndex = '9999';
        ref.style.backgroundColor = '#ffffff';
        ref.style.visibility = 'visible';
        ref.style.opacity = '1';

        // Allow render
        await new Promise((res) => setTimeout(res, 300));

        const canvas = await html2canvas(ref, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        // Restore original styles
        Object.keys(orig).forEach((k) => {
          try {
            ref.style[k] = orig[k] || '';
          } catch (e) {
            /* ignore restore errors */
          }
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, dtrWidth, dtrHeight);
      }

      setPrintingStatus('Opening print preview...');
      pdf.autoPrint();
      const blobUrl = pdf.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error printing DTRs:', error);
      alert('Error printing DTRs');
    } finally {
      // Restore preview and close modal after a short delay to avoid abrupt UI jump
      setPrintingStatus('');
      setPrintingAll(false);
      setPreviewModalOpen(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: -5 }}>
      <style>
        {`
          /* FIX: Force vertical scrollbar to prevent center-jump when data loads */
          html {
            overflow-y: scroll;
          }

          /* Frontend responsive styles (NOT for print) */
          .dtr-responsive-header,
          .dtr-responsive-cell,
          .dtr-time-cell {
            width: auto !important;
            max-width: none !important;
          }

          .dtr-time-cell {
            white-space: nowrap !important;
            word-break: keep-all !important;
          }

          table {
            table-layout: auto !important;
          }

          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            .no-print { display: none !important; }
            .header, .top-banner, .page-banner, header, footer, .MuiDrawer-root, .MuiAppBar-root { display: none !important; }
            html, body { width: 21cm; height: 29.7cm; margin: 0; padding: 0; background: white; }
            .MuiContainer-root { max-width: 100% !important; width: 21cm !important; margin: 0 auto !important; padding: 0 !important; display: flex !important; justify-content: center !important; align-items: center !important; background: white !important; }
            .MuiPaper-root, .MuiBox-root, .MuiCard-root { background: transparent !important; box-shadow: none !important; margin: 0 !important; }
            .table-container { width: 100% !important; height: auto !important; margin: 0 auto !important; padding: 0 !important; display: block !important; background: transparent !important; }
            .table-wrapper { width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; display: flex !important; justify-content: center !important; align-items: flex-start !important; box-sizing: border-box !important; }
            .table-side-by-side { display: flex !important; flex-direction: row !important; gap: 1.5% !important; width: 100% !important; height: auto !important; }
            .table-side-by-side table { width: 47% !important; border: 1px solid black !important; border-collapse: collapse !important; background: white !important; }
            table td, table th { background: white !important; font-family: Arial, "Times New Roman", serif !important; position: relative !important; }
            table thead div, table thead p, table thead h4 { font-family: Arial, "Times New Roman", serif !important; }
            table td div { position: relative !important; }
            table { page-break-inside: avoid !important; table-layout: fixed !important; }
            .dtr-responsive-header, .dtr-responsive-cell, .dtr-time-cell { width: auto !important; white-space: nowrap !important; word-break: keep-all !important; }
            table tbody tr:last-child td { padding-bottom: 20px !important; }
            .bulk-dtr-print { display: none !important; }
          }
        `}
      </style>

      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }} className="no-print">
            <GlassCard
              sx={{
                background: `rgba(${hexToRgb(primaryColor)}, 0.95)`,
                boxShadow: `0 8px 40px ${alpha(accentColor, 0.08)}`,
                border: `1px solid ${alpha(accentColor, 0.1)}`,
                '&:hover': {
                  boxShadow: `0 12px 48px ${alpha(accentColor, 0.15)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 10,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  color: textPrimaryColor,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: `radial-gradient(circle, ${alpha(
                      accentColor,
                      0.1,
                    )} 0%, ${alpha(accentColor, 0)} 70%)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: '30%',
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${alpha(
                      accentColor,
                      0.08,
                    )} 0%, ${alpha(accentColor, 0)} 70%)`,
                  }}
                />

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  position="relative"
                  zIndex={1}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha(accentColor, 0.15),
                        mr: 4,
                        width: 64,
                        height: 64,
                        boxShadow: `0 8px 24px ${alpha(accentColor, 0.15)}`,
                      }}
                    >
                      <AccessTime
                        sx={{ color: textPrimaryColor, fontSize: 32 }}
                      />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          lineHeight: 1.2,
                          color: textPrimaryColor,
                        }}
                      >
                        Daily Time Record
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.8,
                          fontWeight: 400,
                          color: textPrimaryColor,
                        }}
                      >
                        Filter your DTR records by date
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label="Faculty Records"
                      size="small"
                      sx={{
                        bgcolor: alpha(accentColor, 0.15),
                        color: textPrimaryColor,
                        fontWeight: 500,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                    <Tooltip title="Refresh Data">
                      <IconButton
                        onClick={() => window.location.reload()}
                        sx={{
                          bgcolor: alpha(accentColor, 0.1),
                          '&:hover': { bgcolor: alpha(accentColor, 0.2) },
                          color: textPrimaryColor,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <AccessTime sx={{ fontSize: 24 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Search Section */}
        <Fade in timeout={700}>
          <GlassCard
            className="no-print"
            sx={{
              mb: 4,
              background: `rgba(${hexToRgb(primaryColor)}, 0.95)`,
              boxShadow: `0 8px 40px ${alpha(accentColor, 0.08)}`,
              border: `1px solid ${alpha(accentColor, 0.1)}`,
              '&:hover': {
                boxShadow: `0 12px 48px ${alpha(accentColor, 0.15)}`,
              },
            }}
          >
            <Box
              sx={{
                p: 4,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                color: textPrimaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ fontSize: '1.8rem', mr: 2 }} />
                <Box>
                  <Typography variant="h7" sx={{ opacity: 0.9 }}>
                    Select date range to view records
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ProfessionalButton
                  variant={viewMode === 'single' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('single')}
                  sx={{
                    backgroundColor:
                      viewMode === 'single' ? accentColor : 'transparent',
                    color:
                      viewMode === 'single'
                        ? textSecondaryColor
                        : textPrimaryColor,
                    borderColor: accentColor,
                    '&:hover': {
                      backgroundColor:
                        viewMode === 'single'
                          ? hoverColor
                          : alpha(accentColor, 0.1),
                      borderColor: accentColor,
                    },
                    py: 0.75,
                    px: 2,
                  }}
                >
                  Single User
                </ProfessionalButton>
                <ProfessionalButton
                  variant={viewMode === 'multiple' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('multiple')}
                  sx={{
                    backgroundColor:
                      viewMode === 'multiple' ? accentColor : 'transparent',
                    color:
                      viewMode === 'multiple'
                        ? textSecondaryColor
                        : textPrimaryColor,
                    borderColor: accentColor,
                    '&:hover': {
                      backgroundColor:
                        viewMode === 'multiple'
                          ? hoverColor
                          : alpha(accentColor, 0.1),
                      borderColor: accentColor,
                    },
                    py: 0.75,
                    px: 2,
                  }}
                >
                  All Users
                </ProfessionalButton>
              </Box>
            </Box>

            <Box sx={{ p: 4 }}>
              {/* Month Buttons + Year Selector */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel sx={{ fontWeight: 600 }}>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="Year"
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: accentColor,
                      },
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    {yearOptions.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {months.map((month, index) => (
                  <ProfessionalButton
                    key={month}
                    variant={
                      selectedMonth === index ? 'contained' : 'contained'
                    }
                    onClick={() => handleMonthClick(index)}
                    sx={{
                      backgroundColor:
                        selectedMonth === index ? accentDark : accentColor,
                      color: textSecondaryColor,
                      '&:hover': { backgroundColor: hoverColor },
                      py: 0.5,
                      px: 1.5,
                      fontSize: '0.8rem',
                    }}
                  >
                    {month}
                  </ProfessionalButton>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ minWidth: 225 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 1, color: textPrimaryColor }}
                  >
                    Employee Number
                  </Typography>
                  <ModernTextField
                    value={personID}
                    onChange={(e) => setPersonID(e.target.value)}
                    variant="outlined"
                    fullWidth
                  />
                </Box>

                <Box sx={{ minWidth: 225 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 1, color: textPrimaryColor }}
                  >
                    Start Date
                  </Typography>
                  <ModernTextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>

                <Box sx={{ minWidth: 225 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 1, color: textPrimaryColor }}
                  >
                    End Date
                  </Typography>
                  <ModernTextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>

                <ProfessionalButton
                  variant="contained"
                  onClick={fetchRecords}
                  startIcon={<SearchOutlined />}
                  sx={{
                    backgroundColor: accentColor,
                    color: textSecondaryColor,
                    '&:hover': { backgroundColor: hoverColor },
                    py: 1.5,
                    px: 3,
                  }}
                >
                  Search
                </ProfessionalButton>
              </Box>
            </Box>
          </GlassCard>
        </Fade>

        {/* All Users DTR List Section - Show when viewMode is 'multiple' */}
        {viewMode === 'multiple' && (
          <Fade in timeout={1000}>
            <GlassCard
              className="no-print"
              sx={{
                mb: 4,
                background: `rgba(${hexToRgb(primaryColor)}, 0.95)`,
                boxShadow: `0 8px 40px ${alpha(accentColor, 0.08)}`,
                border: `1px solid ${alpha(accentColor, 0.1)}`,
                '&:hover': {
                  boxShadow: `0 12px 48px ${alpha(accentColor, 0.15)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  color: textPrimaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: textPrimaryColor,
                  }}
                >
                  All Users DTR List
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                  <ProfessionalButton
                    variant="contained"
                    onClick={fetchAllUsersDTR}
                    disabled={loadingAllUsers || !startDate || !endDate}
                    startIcon={
                      loadingAllUsers ? (
                        <MCircularProgress size={20} />
                      ) : (
                        <AccessTime />
                      )
                    }
                    sx={{
                      backgroundColor: accentColor,
                      color: textSecondaryColor,
                      '&:hover': { backgroundColor: hoverColor },
                      '&:disabled': {
                        backgroundColor: alpha(accentColor, 0.5),
                        color: alpha(textSecondaryColor, 0.5),
                      },
                    }}
                  >
                    {loadingAllUsers ? 'Loading...' : 'Load All Users DTR'}
                  </ProfessionalButton>

                  {/* Print limit selector: auto-select first N when changed */}
                  {allUsersDTR.length > 0 && (
                    <FormControl
                      sx={{ minWidth: 160, backgroundColor: 'white' }}
                    >
                      <InputLabel>Auto Select</InputLabel>
                      <Select
                        value={''}
                        label="Auto Select"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'none') return;
                          // If the user picks an option, auto select first N
                          if (val === 'all') handleAutoSelectFirstN('all');
                          else handleAutoSelectFirstN(Number(val));
                        }}
                        displayEmpty
                        renderValue={() => 'Print first...'}
                      >
                        <MenuItem value="none">
                          <em>Choose</em>
                        </MenuItem>
                        <MenuItem value={10}>First 10</MenuItem>
                        <MenuItem value={20}>First 20</MenuItem>
                        <MenuItem value={50}>First 50</MenuItem>
                        <MenuItem value="all">Select All (filtered)</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {allUsersDTR.length > 0 && (
                    <ProfessionalButton
                      variant="contained"
                      onClick={handleBulkPrint}
                      disabled={selectedUsers.size === 0}
                      startIcon={<PrintIcon />}
                      sx={{
                        backgroundColor: accentColor,
                        color: textSecondaryColor,
                        '&:hover': { backgroundColor: hoverColor },
                        '&:disabled': {
                          backgroundColor: alpha(accentColor, 0.5),
                          color: alpha(textSecondaryColor, 0.5),
                        },
                      }}
                    >
                      Bulk Printing ({selectedUsers.size})
                    </ProfessionalButton>
                  )}
                </Box>
              </Box>

              <Box sx={{ p: 4 }}>
                {allUsersDTR.length > 0 ? (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      {/* Replaced alphabetical dropdown with free-text search */}
                      <TextField
                        label="Search users"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          // reset to first page on search change
                          setCurrentPage(1);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchOutlined />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 300, backgroundColor: 'white' }}
                      />

                      {/* New dropdown for Has Records / No Records */}
                      <FormControl
                        sx={{ minWidth: 160, backgroundColor: 'white' }}
                      >
                        <InputLabel>Records</InputLabel>
                        <Select
                          value={recordFilter}
                          label="Records"
                          onChange={(e) => {
                            setRecordFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="has">Has Records</MenuItem>
                          <MenuItem value="no">No Records</MenuItem>
                        </Select>
                      </FormControl>

                      <ProfessionalButton
                        variant="outlined"
                        onClick={() =>
                          handleSelectAll(
                            selectedUsers.size !== getFilteredUsers().length,
                          )
                        }
                        sx={{ borderColor: accentColor, color: accentColor }}
                      >
                        {selectedUsers.size === getFilteredUsers().length
                          ? 'Deselect All'
                          : 'Select All'}
                      </ProfessionalButton>

                      {/* Rows per page selector */}
                      <FormControl
                        sx={{ minWidth: 140, backgroundColor: 'white' }}
                      >
                        <InputLabel>Rows</InputLabel>
                        <Select
                          value={rowsPerPage}
                          label="Rows"
                          onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Simple pagination controls */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <IconButton
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          sx={{ bgcolor: 'white' }}
                        >
                          <ArrowBack />
                        </IconButton>
                        <Typography sx={{ minWidth: 36, textAlign: 'center' }}>
                          {currentPage} / {totalPages}
                        </Typography>
                        <IconButton
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          sx={{ bgcolor: 'white' }}
                        >
                          <ArrowForward />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Table wrapped with fixed-height scrollable container */}
                    <Box
                      sx={{ maxHeight: 360, overflow: 'auto', borderRadius: 1 }}
                    >
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <Checkbox
                                checked={
                                  selectedUsers.size ===
                                    getFilteredUsers().length &&
                                  getFilteredUsers().length > 0
                                }
                                indeterminate={
                                  selectedUsers.size > 0 &&
                                  selectedUsers.size < getFilteredUsers().length
                                }
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
                              />
                            </TableCell>
                            <TableCell>Employee Number</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Records Count</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedUsers.map((user) => (
                            <TableRow key={user.employeeNumber}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedUsers.has(
                                    user.employeeNumber,
                                  )}
                                  onChange={() =>
                                    handleUserSelect(user.employeeNumber)
                                  }
                                />
                              </TableCell>
                              <TableCell>{user.employeeNumber}</TableCell>
                              <TableCell>
                                {/* highlight matched substring */}
                                {searchQuery
                                  ? highlightMatch(
                                      user.fullName || '',
                                      searchQuery,
                                    )
                                  : user.fullName}
                              </TableCell>
                              <TableCell>{user.lastName}</TableCell>
                              <TableCell>{user.records.length}</TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    user.records.length > 0
                                      ? 'Has Records'
                                      : 'No Records'
                                  }
                                  color={
                                    user.records.length > 0
                                      ? 'success'
                                      : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>

                    {/* Info & extra pagination at bottom */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: textPrimaryColor }}
                      >
                        Showing{' '}
                        {Math.min(
                          filteredUsers.length,
                          (currentPage - 1) * rowsPerPage + 1,
                        )}{' '}
                        -{' '}
                        {Math.min(
                          filteredUsers.length,
                          currentPage * rowsPerPage,
                        )}{' '}
                        of {filteredUsers.length} users
                      </Typography>

                      <Box
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        <ProfessionalButton
                          variant="outlined"
                          onClick={() => goToPage(1)}
                          disabled={currentPage === 1}
                        >
                          First
                        </ProfessionalButton>
                        <ProfessionalButton
                          variant="outlined"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Prev
                        </ProfessionalButton>
                        <ProfessionalButton
                          variant="outlined"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </ProfessionalButton>
                        <ProfessionalButton
                          variant="outlined"
                          onClick={() => goToPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          Last
                        </ProfessionalButton>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: textPrimaryColor,
                      opacity: 0.7,
                    }}
                  >
                    <Typography variant="body1">
                      Click "Load All Users DTR" to fetch all users' DTR data
                    </Typography>
                  </Box>
                )}

                {/* Hidden DTR tables for previewUsers will be rendered on-demand inside the modal */}
              </Box>
            </GlassCard>
          </Fade>
        )}

        {/* Records Table - Two Tables Side by Side - Show when viewMode is 'single' */}
        {viewMode === 'single' && (
          <Fade in timeout={900}>
            <Paper
              elevation={4}
              sx={{
                borderRadius: 2,
                overflowX: 'auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(109, 35, 35, 0.1)',
                mb: 4,
                width: '100%',
              }}
            >
              <Box sx={{ p: 5, minWidth: 'fit-content' }}>
                <div className="table-container" ref={dtrRef}>
                  <div className="table-wrapper">
                    <div
                      style={{
                        display: 'flex',
                        gap: '2%',
                        width: '8.7in',
                        minWidth: '8.5in',
                        margin: '0 auto',
                        backgroundColor: 'white',
                      }}
                      className="table-side-by-side"
                    >
                      {(() => {
                        const dataFontSize = '10px';
                        const rowHeight = '16px';

                        const renderHeader = () => (
                          <thead
                            style={{
                              textAlign: 'center',
                              position: 'relative',
                            }}
                          >
                            <tr>
                              <div
                                style={{
                                  position: 'absolute',
                                  paddingTop: '25px',
                                  left: '53%',
                                  transform: 'translateX(-50%)',
                                  fontWeight: 'bold',
                                  fontSize: '8px',
                                  fontFamily: 'Arial, "Times New Roman", serif',
                                  width: '100%',
                                }}
                              >
                                Republic of the Philippines
                              </div>
                              <td
                                colSpan="1"
                                style={{
                                  position: 'relative',
                                  width: '60px', // Fixed width for logo column
                                }}
                              >
                                <img
                                  src={earistLogo}
                                  alt="Logo"
                                  width="50"
                                  height="50"
                                  style={{
                                    position: 'absolute',
                                    top: '25px',
                                    left: '-5px',
                                  }}
                                />
                              </td>
                              <td
                                colSpan="5"
                                style={{
                                  verticalAlign: 'bottom',
                                  paddingBottom: '5px',
                                  paddingRight: '40px',
                                }}
                              >
                                <p
                                  style={{
                                    margin: '0',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    width: '100%',
                                    fontFamily:
                                      'Arial, "Times New Roman", serif',
                                    lineHeight: '1.15',
                                    paddingTop: '35px',
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  EULOGIO "AMANG" RODRIGUEZ
                                  <br />
                                  INSTITUTE OF SCIENCE &amp; TECHNOLOGY
                                </p>
                              </td>

                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colSpan="9">
                                <p
                                  style={{
                                    fontSize: '10px',
                                    marginTop: '-2%',
                                    fontFamily: 'Arial, serif',
                                    paddingLeft: '16px',
                                  }}
                                >
                                  Nagtahan, Sampaloc Manila
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="9">
                                <p
                                  style={{
                                    fontSize: '8px',
                                    fontWeight: 'bold',
                                    paddingTop: '-2px',
                                    fontFamily: 'Arial, serif',
                                  }}
                                >
                                  Civil Service Form No. 48
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td
                                colSpan="9"
                                style={{ padding: '2', lineHeight: '0' }}
                              >
                                <h4
                                  style={{
                                    fontFamily: 'Times New Roman, serif',
                                    textAlign: 'center',
                                    marginTop: '2px',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                  }}
                                >
                                  DAILY TIME RECORD
                                </h4>
                              </td>
                            </tr>
                            <tr>
                              <td
                                colSpan="5"
                                style={{
                                  paddingTop: '10px',
                                  paddingBottom: '5px',
                                  lineHeight: '1.1',
                                  verticalAlign: 'top',
                                }}
                              >
                                <div
                                  style={{
                                    paddingLeft: '5px',
                                    marginTop: '0',
                                    fontFamily: 'Arial, serif',
                                    width: '100%',
                                    maxWidth: '250px',
                                  }}
                                >
                                  <div
                                    style={{
                                      borderBottom: '2px solid black',
                                      width: '159%',
                                      margin: '2px 0 3px 0',
                                    }}
                                  />
                                  {/* Employee Name */}
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      textTransform: 'uppercase',
                                      /* Allow full name to wrap and be visible instead of truncating */
                                      whiteSpace: 'normal',
                                      overflow: 'visible',
                                      textOverflow: 'unset',
                                      wordBreak: 'break-word',
                                      paddingLeft: '130px',
                                      fontFamily: 'Times New Roman',
                                    }}
                                  >
                                    {employeeName}
                                  </div>

                                  {/* Underline */}
                                  <div
                                    style={{
                                      borderBottom: '2px solid black',
                                      width: '159%',
                                      margin: '2px 0 3px 0',
                                    }}
                                  />

                                  {/* Label */}
                                  <div
                                    style={{
                                      fontSize: '9px',
                                      textAlign: 'center',
                                      paddingLeft: '130px',
                                      fontFamily: 'Times New Roman',
                                    }}
                                  >
                                    NAME
                                  </div>
                                </div>
                              </td>

                              <td></td>
                            </tr>

                            <tr>
                              <td
                                colSpan="9"
                                style={{ padding: '2px 0', lineHeight: '1.1' }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    paddingLeft: '5px',
                                    fontFamily: 'Times New Roman, serif',
                                    fontSize: '10px',
                                  }}
                                >
                                  <span style={{ marginRight: '6px' }}>
                                    Covered Dates:
                                  </span>

                                  <div
                                    style={{ minWidth: '220px', flexGrow: 1 }}
                                  >
                                    {/* Value */}
                                    <div
                                      style={{
                                        fontWeight: 'bold',
                                        textAlign: 'left',
                                        fontSize: '10px',
                                        fontFamily: 'Times New Roman, serif',
                                      }}
                                    >
                                      {formattedStartDate} - {formattedEndDate}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            <tr>
                              <td
                                colSpan="9"
                                style={{
                                  padding: '2',
                                  lineHeight: '2',
                                  textAlign: 'left',
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: '11px',
                                    margin: '0',
                                    paddingLeft: '5px',
                                    fontFamily: 'Times New Roman, serif',
                                  }}
                                >
                                  For the month of:{' '}
                                  <b>
                                    {startDate ? formatMonth(startDate) : ''}
                                  </b>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td
                                colSpan="9"
                                style={{
                                  padding: '8px 5px 2px 5px',
                                  textAlign: 'left',
                                  fontSize: '10px',
                                  fontFamily: 'Arial, serif',
                                  lineHeight: '1.2',
                                }}
                              >
                                Official hours for arrival (regular day) and
                                departure
                              </td>
                            </tr>
                            {Array.from({ length: 6 }, (_, i) => (
                              <tr key={`empty1-${i}`}>
                                <td colSpan="3"></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                            ))}

                            {/* Use fixed-height rows for stability rather than absolute positioning */}
                            <tr>
                              <td colSpan="9" style={{ padding: '2px 5px' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '5%',
                                    height: '12px',
                                    marginBottom: '0px',
                                    fontFamily: 'Arial, serif',
                                    fontSize: '10px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <span style={{ marginRight: '8px' }}>
                                    Regular Days:
                                  </span>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      borderBottom: '1.5px solid black',
                                      flexGrow: 1,
                                      minWidth: '310px',
                                    }}
                                  ></span>
                                </div>
                              </td>
                            </tr>

                            {Array.from({ length: 2 }, (_, i) => (
                              <tr key={`empty2-${i}`}>
                                <td colSpan="3"></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                            ))}

                            <tr>
                              <td colSpan="9" style={{ padding: '4px 5px' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '5%',
                                    height: '14px',
                                    fontFamily: 'Arial, serif',
                                    fontSize: '10px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <span style={{ marginRight: '8px' }}>
                                    Saturdays:
                                  </span>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      borderBottom: '1.5px solid black',
                                      flexGrow: 1,
                                      minWidth: '318px',
                                    }}
                                  ></span>
                                </div>
                              </td>
                            </tr>

                            {Array.from({ length: 2 }, (_, i) => (
                              <tr key={`empty3-${i}`}>
                                <td colSpan="3"></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                            ))}
                            <tr>
                              <th
                                rowSpan="2"
                                style={{
                                  border: '1px solid black',
                                  fontFamily: 'Arial, serif',
                                  fontSize: dataFontSize,
                                }}
                              >
                                DAY
                              </th>
                              <th
                                colSpan="2"
                                style={{
                                  border: '1px solid black',
                                  fontFamily: 'Arial, serif',
                                  fontSize: dataFontSize,
                                }}
                              >
                                A.M.
                              </th>
                              <th
                                colSpan="2"
                                style={{
                                  border: '1px solid black',
                                  fontFamily: 'Arial, serif',
                                  fontSize: dataFontSize,
                                }}
                              >
                                P.M.
                              </th>
                              <th
                                style={{
                                  border: '1px solid black',
                                  fontFamily: 'Arial, serif',
                                  fontSize: dataFontSize,
                                }}
                              >
                                Late
                              </th>
                              <th
                                style={{
                                  border: '1px solid black',
                                  fontFamily: 'Arial, serif',
                                  fontSize: dataFontSize,
                                }}
                              >
                                Undertime
                              </th>
                            </tr>
                            <tr style={{ textAlign: 'center' }}>
                              <td
                                style={{
                                  border: '1px solid black',
                                  fontSize: '9px',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                Arrival
                              </td>
                              <td
                                style={{
                                  border: '1px solid black',
                                  fontSize: '9px',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                Departure
                              </td>
                              <td
                                style={{
                                  border: '1px solid black',
                                  fontSize: '9px',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                Arrival
                              </td>
                              <td
                                style={{
                                  border: '1px solid black',
                                  fontSize: '9px',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                Departure
                              </td>
                              <td
                                style={{
                                  border: '1px solid black',
                                  fontSize: '9px',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                Min
                              </td>
                              <td
                                style={{
                                  border: '1px solid black',
                                  fontSize: '9px',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                Min
                              </td>
                            </tr>
                          </thead>
                        );

                        const cellStyle = {
                          border: '1px solid black',
                          textAlign: 'center',
                          padding: '0 2px',
                          fontFamily: 'Arial, serif',
                          fontSize: dataFontSize,
                          height: rowHeight,
                          whiteSpace: 'nowrap',
                        };

                        return (
                          <>
                            {/* ================= TABLE 1 ================= */}
                            <table
                              style={{
                                border: '1px solid black',
                                borderCollapse: 'collapse',
                                width: '49%',
                                tableLayout: 'fixed',
                              }}
                              className="print-visble"
                            >
                              {renderHeader()}
                              <tbody>
                                {Array.from({ length: 31 }, (_, i) => {
                                  const day = (i + 1)
                                    .toString()
                                    .padStart(2, '0');
                                  const record = records.find((r) =>
                                    r.date.endsWith(`-${day}`),
                                  );
                                  return (
                                    <tr key={i}>
                                      <td style={cellStyle}>{day}</td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.timeIN || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.breaktimeIN || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.breaktimeOUT || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.timeOUT || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {record?.minutes || ''}
                                      </td>
                                      <td style={cellStyle}>
                                        {record?.minutes || ''}
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr>
                                  <td
                                    colSpan="7"
                                    style={{ padding: '10px 5px' }}
                                  >
                                    <hr
                                      style={{
                                        borderTop: '2px solid black',
                                        width: '100%',
                                      }}
                                    />
                                    <p
                                      style={{
                                        textAlign: 'justify',
                                        fontSize: '9px',
                                        lineHeight: '1.1',
                                        fontFamily: 'Times New Roman, serif',
                                        margin: '5px 0',
                                      }}
                                    >
                                      I CERTIFY on my honor that the above is a
                                      true and correct report of the hours of
                                      work performed, record of which was made
                                      daily at the time of arrival and at the
                                      time of departure from office.
                                    </p>
                                    <div
                                      style={{
                                        width: '50%',
                                        marginLeft: 'auto',
                                        textAlign: 'center',
                                        marginTop: '15px',
                                      }}
                                    >
                                      <hr
                                        style={{
                                          borderTop: '2px solid black',
                                          margin: 0,
                                        }}
                                      />
                                      <p
                                        style={{
                                          fontSize: '9px',
                                          fontFamily: 'Arial, serif',
                                          margin: '5px 0 0 0',
                                        }}
                                      >
                                        Signature
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        width: '100%',
                                        marginTop: '15px',
                                      }}
                                    >
                                      <hr
                                        style={{
                                          borderTop: '1px solid black',
                                          width: '100%',
                                          margin: 0,
                                        }}
                                      />
                                      <hr
                                        style={{
                                          borderTop: '1.5px solid black',
                                          width: '100%',
                                          margin: '2px 0 0 0',
                                        }}
                                      />
                                      <p
                                        style={{
                                          paddingLeft: '30px',
                                          fontSize: '9px',
                                          fontFamily: 'Arial, serif',
                                          margin: '5px 0 0 0',
                                        }}
                                      >
                                        Verified as to prescribed office hours.
                                      </p>
                                    </div>

                                    <div
                                      style={{
                                        width: '80%',
                                        marginLeft: 'auto',
                                        marginTop: '15px',
                                        textAlign: 'center',
                                      }}
                                    >
                                      <hr
                                        style={{
                                          borderTop: '2px solid black',
                                          margin: 0,
                                        }}
                                      />
                                      <p
                                        style={{
                                          fontSize: '9px',
                                          fontFamily: 'Times New Roman, serif',
                                          margin: '2px 0 0 0',
                                        }}
                                      >
                                        In-Charge
                                      </p>
                                      <p
                                        style={{
                                          fontSize: '9px',
                                          fontFamily: 'Arial, serif',
                                          margin: '0',
                                        }}
                                      >
                                        (Signature Over Printed Name)
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            {/* ================= TABLE 2 ================= */}
                            <table
                              style={{
                                border: '1px solid black',
                                borderCollapse: 'collapse',
                                width: '49%',
                                tableLayout: 'fixed',
                              }}
                              className="print-visble"
                            >
                              {renderHeader()}
                              <tbody>
                                {Array.from({ length: 31 }, (_, i) => {
                                  const day = (i + 1)
                                    .toString()
                                    .padStart(2, '0');
                                  const record = records.find((r) =>
                                    r.date.endsWith(`-${day}`),
                                  );
                                  return (
                                    <tr key={i}>
                                      <td style={cellStyle}>{day}</td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.timeIN || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.breaktimeIN || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.breaktimeOUT || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {formatTime(record?.timeOUT || '')}
                                      </td>
                                      <td style={cellStyle}>
                                        {record?.hours || ''}
                                      </td>
                                      <td style={cellStyle}>
                                        {record?.minutes || ''}
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr>
                                  <td
                                    colSpan="7"
                                    style={{ padding: '10px 5px' }}
                                  >
                                    <hr
                                      style={{
                                        borderTop: '2px solid black',
                                        width: '100%',
                                      }}
                                    />
                                    <p
                                      style={{
                                        textAlign: 'justify',
                                        fontSize: '9px',
                                        lineHeight: '1.1',
                                        fontFamily: 'Times New Roman, serif',
                                        margin: '5px 0',
                                      }}
                                    >
                                      I CERTIFY on my honor that the above is a
                                      true and correct report of the hours of
                                      work performed, record of which was made
                                      daily at the time of arrival and at the
                                      time of departure from office.
                                    </p>
                                    <div
                                      style={{
                                        width: '50%',
                                        marginLeft: 'auto',
                                        textAlign: 'center',
                                        marginTop: '15px',
                                      }}
                                    >
                                      <hr
                                        style={{
                                          borderTop: '2px solid black',
                                          margin: 0,
                                        }}
                                      />
                                      <p
                                        style={{
                                          fontSize: '9px',
                                          fontFamily: 'Arial, serif',
                                          margin: '5px 0 0 0',
                                        }}
                                      >
                                        Signature
                                      </p>
                                    </div>

                                    <div
                                      style={{
                                        width: '100%',
                                        marginTop: '15px',
                                      }}
                                    >
                                      <hr
                                        style={{
                                          borderTop: '1px solid black',
                                          width: '100%',
                                          margin: 0,
                                        }}
                                      />
                                      <hr
                                        style={{
                                          borderTop: '1.5px solid black',
                                          width: '100%',
                                          margin: '2px 0 0 0',
                                        }}
                                      />
                                      <p
                                        style={{
                                          paddingLeft: '30px',
                                          fontSize: '9px',
                                          fontFamily: 'Arial, serif',
                                          margin: '5px 0 0 0',
                                        }}
                                      >
                                        Verified as to prescribed office hours.
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        width: '80%',
                                        marginLeft: 'auto',
                                        marginTop: '15px',
                                        textAlign: 'center',
                                      }}
                                    >
                                      <hr
                                        style={{
                                          borderTop: '2px solid black',
                                          margin: 0,
                                        }}
                                      />
                                      <p
                                        style={{
                                          fontSize: '9px',
                                          fontFamily: 'Times New Roman, serif',
                                          margin: '2px 0 0 0',
                                        }}
                                      >
                                        In-Charge
                                      </p>
                                      <p
                                        style={{
                                          fontSize: '9px',
                                          fontFamily: 'Arial, serif',
                                          margin: '0',
                                        }}
                                      >
                                        (Signature Over Printed Name)
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </Box>
            </Paper>
          </Fade>
        )}

        {/* Print and Download Buttons - Show when viewMode is 'single' */}
        {viewMode === 'single' && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mt: 2,
              mb: 4,
            }}
          >
            <ProfessionalButton
              variant="contained"
              onClick={printPage}
              startIcon={<PrintIcon />}
              className="no-print"
              sx={{
                backgroundColor: accentColor,
                color: textSecondaryColor,
                '&:hover': { backgroundColor: accentDark },
                py: 1.5,
                px: 4,
              }}
            >
              Print
            </ProfessionalButton>
            <ProfessionalButton
              variant="contained"
              onClick={downloadPDF}
              startIcon={<PrintIcon />}
              className="no-print"
              sx={{
                backgroundColor: accentColor,
                color: textSecondaryColor,
                '&:hover': { backgroundColor: accentDark },
                py: 1.5,
                px: 4,
              }}
            >
              Download PDF
            </ProfessionalButton>
          </Box>
        )}

        {/* Bulk Print Preview Modal */}
        <Dialog
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: alpha(accentColor, 0.1),
              borderBottom: `2px solid ${alpha(accentColor, 0.2)}`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: textPrimaryColor,
              }}
            >
              DTR Preview - {previewUsers[currentPreviewIndex]?.fullName || ''}{' '}
              ({currentPreviewIndex + 1} of {previewUsers.length})
            </Typography>
            <IconButton
              onClick={() => setPreviewModalOpen(false)}
              sx={{
                color: textPrimaryColor,
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.2),
                },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              minHeight: '80vh',
              maxHeight: '90vh',
              position: 'relative',
              overflow: 'auto',
            }}
          >
            {/* Navigation Arrows */}
            {previewUsers.length > 1 && !printingAll && (
              <>
                <IconButton
                  onClick={handlePrevious}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 10,
                    '&:hover': {
                      backgroundColor: alpha(accentColor, 0.1),
                    },
                  }}
                >
                  <ArrowBack sx={{ color: textPrimaryColor, fontSize: 32 }} />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 10,
                    '&:hover': {
                      backgroundColor: alpha(accentColor, 0.1),
                    },
                  }}
                >
                  <ArrowForward
                    sx={{ color: textPrimaryColor, fontSize: 32 }}
                  />
                </IconButton>
              </>
            )}

            {/* DTR Preview Container (visible) */}
            {!printingAll && (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  overflow: 'auto',
                  py: 2,
                  flex: 1,
                }}
              >
                {previewUsers[currentPreviewIndex] && (
                  <Paper
                    elevation={8}
                    sx={{
                      p: 2,
                      backgroundColor: 'white',
                      borderRadius: 2,
                      width: 'fit-content',
                      maxWidth: '100%',
                      overflow: 'auto',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      '& .table-container': {
                        width: '100%',
                        overflow: 'auto',
                      },
                      '& .table-wrapper': {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                      },
                    }}
                  >
                    {renderDTRForModal(previewUsers[currentPreviewIndex])}
                  </Paper>
                )}
              </Box>
            )}

            {/* Printing/loading overlay shown while printingAll === true */}
            {printingAll && (
              <Box
                sx={{
                  width: '100%',
                  height: '60vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <MCircularProgress size={64} sx={{ color: accentColor }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {printingStatus || 'Preparing DTRs...'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Please wait — the DTRs are being captured and compiled. A new
                  tab will open when ready.
                </Typography>
              </Box>
            )}

            {/* Hidden print-ready DTR tables: render ONLY for previewUsers (on-demand) */}
            <Box
              sx={{
                position: 'absolute',
                left: '-9999px',
                top: 0,
                width: 0,
                height: 0,
                overflow: 'hidden',
              }}
            >
              {previewUsers.map((user) => renderUserDTRTable(user))}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mt: 2,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <ProfessionalButton
                variant="contained"
                onClick={handlePrintAllSelected}
                startIcon={<PrintIcon />}
                sx={{
                  backgroundColor: accentColor,
                  color: textSecondaryColor,
                  '&:hover': { backgroundColor: hoverColor },
                  py: 1.5,
                  px: 4,
                }}
              >
                Print All Selected DTRs ({previewUsers.length})
              </ProfessionalButton>
              <ProfessionalButton
                variant="outlined"
                onClick={() => setPreviewModalOpen(false)}
                sx={{
                  borderColor: accentColor,
                  color: textPrimaryColor,
                  '&:hover': {
                    borderColor: hoverColor,
                    backgroundColor: alpha(accentColor, 0.1),
                  },
                  py: 1.5,
                  px: 4,
                }}
              >
                Close
              </ProfessionalButton>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default DailyTimeRecordFaculty;
