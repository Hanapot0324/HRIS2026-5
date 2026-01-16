import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AccessTime, CalendarToday, SearchOutlined } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Fade,
  IconButton,
  Paper,
  styled,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import earistLogo from '../../assets/earistLogo.png';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { alpha } from '@mui/material/styles';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import usePageAccess from '../../hooks/usePageAccess';
import AccessDenied from '../AccessDenied';
import CircularProgress from '@mui/material/CircularProgress';

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : '109, 35, 35';
};

// --- FIXED STYLED COMPONENTS (Removed Transforms to stop movement) ---

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  // REMOVED: transform: 'translateY(-4px)' on hover to prevent layout shift
  transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const ProfessionalButton = styled(Button)(
  ({ theme, variant, color = 'primary' }) => ({
    borderRadius: 12,
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'box-shadow 0.2s ease-in-out, background-color 0.2s', // Removed transform transition
    textTransform: 'none',
    fontSize: '0.95rem',
    letterSpacing: '0.025em',
    boxShadow:
      variant === 'contained' ? '0 4px 14px rgba(254, 249, 225, 0.25)' : 'none',
    '&:hover': {
      // REMOVED: transform: 'translateY(-2px)'
      boxShadow:
        variant === 'contained'
          ? '0 6px 20px rgba(254, 249, 225, 0.35)'
          : 'none',
    },
    '&:active': {
      // REMOVED: transform: 'translateY(0)'
      boxShadow: 'none',
    },
  })
);

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition:
      'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s', // Removed transform transition
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      // REMOVED: transform: 'translateY(-1px)'
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      // REMOVED: transform: 'translateY(-1px)'
      boxShadow: '0 4px 20px rgba(254, 249, 225, 0.25)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const DailyTimeRecord = () => {
  const { settings } = useSystemSettings();
  const [personID, setPersonID] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [officialTimes, setOfficialTimes] = useState({});
  const dtrRef = React.useRef(null);

  // Get colors from system settings
  const primaryColor = settings.accentColor || '#FEF9E1';
  const secondaryColor = settings.backgroundColor || '#FFF8E7';
  const accentColor = settings.primaryColor || '#6d2323';
  const accentDark = settings.secondaryColor || '#8B3333';
  const textPrimaryColor = settings.textPrimaryColor || '#6d2323';
  const textSecondaryColor = settings.textSecondaryColor || '#FEF9E1';
  const hoverColor = settings.hoverColor || '#6D2323';

  //ACCESSING
  // Dynamic page access control using component identifier
  // The identifier 'daily-time-record' should match the component_identifier in the pages table
  const {
    hasAccess,
    loading: accessLoading,
    error: accessError,
  } = usePageAccess('daily-time-record');
  // ACCESSING END

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

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

  const fetchRecords = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/api/view-attendance`,
        {
          personID,
          startDate,
          endDate,
        },
        getAuthHeaders()
      );

      const data = response.data;

      if (data.length > 0) {
        setRecords(data);
        const { firstName, lastName } = data[0];
        setEmployeeName(`${firstName} ${lastName}`);
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

  const fetchOfficialTimes = async (employeeID) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/officialtimetable/${employeeID}`,
        getAuthHeaders()
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

  const printPage = async () => {
    // 1. Check if the element exists
    if (!dtrRef.current) return;

    try {
      // 2. Initialize PDF (Same settings as downloadPDF)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4',
      });

      // 3. Capture the exact visual state using html2canvas
      const canvas = await html2canvas(dtrRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // 4. Convert to image & Calculate positions (Same math as downloadPDF)
      const imgData = canvas.toDataURL('image/png');
      const dtrWidth = 7;
      const dtrHeight = 7.5;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const baselineX = (pageWidth - dtrWidth) / 2;
      const yOffset = (pageHeight - dtrHeight) / 2;
      const adjustLeft = 0.2;
      const xOffset = baselineX + adjustLeft;

      // 5. Add image to PDF
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, dtrWidth, dtrHeight);

      // 6. Set PDF to Auto Print and Open it in a new tab
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
      const dtrWidth = 7;
      const dtrHeight = 7.5;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const baselineX = (pageWidth - dtrWidth) / 2;
      const yOffset = (pageHeight - dtrHeight) / 2;
      const adjustLeft = 0.2;
      const xOffset = baselineX + adjustLeft;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, dtrWidth, dtrHeight);
      pdf.save(`DTR-${employeeName}-${formatMonth(startDate)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const formatMonth = (dateString) => {
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
    const year = new Date().getFullYear();
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0));
    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(end.toISOString().substring(0, 10));
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

  // ACCESSING 2
  // Loading state
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
          <CircularProgress sx={{ color: '#6d2323', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6d2323' }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }
  // Access denied state - Now using the reusable component
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
  //ACCESSING END2

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
                  p: 5,
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
                      0.1
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
                      0.08
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
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CalendarToday sx={{ fontSize: '1.8rem', mr: 2 }} />
              <Box>
                <Typography variant="h7" sx={{ opacity: 0.9 }}>
                  Select date range to view records
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 4 }}>
              {/* Month Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 3,
                  justifyContent: 'center',
                }}
              >
                {months.map((month, index) => (
                  <ProfessionalButton
                    key={month}
                    variant="contained"
                    onClick={() => handleMonthClick(index)}
                    sx={{
                      backgroundColor: accentColor,
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
                    variant="outlined"
                    disabled
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

        {/* Records Table - Two Tables Side by Side */}
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
                      width: '8.5in',
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
                          style={{ textAlign: 'center', position: 'relative' }}
                        >
                          <tr>
                            <div
                              style={{
                                position: 'absolute',
                                paddingTop: '25px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontWeight: 'bold',
                                fontSize: '12px',
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
                                EULOGIO "AMANG" RODRIGUEZ <br /> INSTITUTE OF
                                SCIENCE & TECHNOLOGY
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
                            <td
                              colSpan="9"
                              style={{ padding: '2', lineHeight: '0' }}
                            >
                              <h4
                                style={{
                                  fontFamily: 'Arial, serif',
                                  textAlign: 'center',
                                  marginTop: '10px',
                                  fontWeight: 'bold',
                                  fontSize: '16px',
                                }}
                              >
                                DAILY TIME RECORD
                              </h4>
                            </td>
                          </tr>
                          <tr style={{ position: 'relative' }}>
                            <td
                              colSpan="5"
                              style={{ padding: '2', lineHeight: '0' }}
                            >
                              <p
                                style={{
                                  fontSize: '11px',
                                  margin: '0',
                                  height: '20px',
                                  textAlign: 'left',
                                  padding: '0 5px',
                                  marginTop: '6%',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                NAME: <b>{employeeName}</b>
                              </p>
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td
                              colSpan="9"
                              style={{ padding: '2', lineHeight: '0' }}
                            >
                              <p
                                style={{
                                  fontSize: '11px',
                                  margin: '0',
                                  height: '10px',
                                  paddingLeft: '5px',
                                  textAlign: 'Left',
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                Covered Dates:{' '}
                                <b>
                                  {formattedStartDate} - {formattedEndDate}
                                </b>
                              </p>
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
                                  fontFamily: 'Arial, serif',
                                }}
                              >
                                For the month of:{' '}
                                <b>{startDate ? formatMonth(startDate) : ''}</b>
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                fontSize: '10px',
                                margin: '0',
                                height: '10px',
                                position: 'absolute',
                                paddingLeft: '5px',
                                textAlign: 'left',
                                fontFamily: 'Arial, serif',
                              }}
                            >
                              Official hours for arrival (regular day) and
                              departure
                            </td>
                          </tr>
                          {Array.from({ length: 15 }, (_, i) => (
                            <tr key={`empty1-${i}`}>
                              <td colSpan="3"></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          ))}
                          <tr style={{ position: 'relative' }}>
                            <td></td>
                            <td></td>
                            <td
                              style={{
                                position: 'absolute',
                                display: 'flex',
                                flexDirection: 'column',
                                left: '5%',
                                gap: '1px',
                                paddingBottom: '5rem',
                                fontFamily: 'Arial, serif',
                                fontSize: '10px',
                                whiteSpace: 'nowrap',
                                top: '-10px',
                              }}
                            >
                              Regular days M-TH
                            </td>
                            <td></td>
                            <td></td>
                            {/* <td
                              style={{
                                position: 'absolute',
                                left: '60%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                paddingBottom: '2rem',
                                fontFamily: 'Arial, serif',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                width: '200px',
                                top: '-70px',
                              }}
                            >
                              {[
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                              ].map((d) => {
                                const shortDay =
                                  d === 'Thursday'
                                    ? 'TH'
                                    : d === 'Sunday'
                                    ? 'SUN'
                                    : d === 'Saturday'
                                    ? 'SAT'
                                    : d.charAt(0);
                                return (
                                  <div
                                    key={d}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'flex-start',
                                      gap: '5px',
                                    }}
                                  >
                                    <span style={{ width: '25px' }}>
                                      {shortDay} -
                                    </span>
                                    <span>
                                      {officialTimes[d]?.officialTimeIN ||
                                        '00:00:00'}{' '}
                                      -{' '}
                                      {officialTimes[d]?.officialTimeOUT ||
                                        '00:00:00'}
                                    </span>
                                  </div>
                                );
                              })}
                            </td> */}
                            <td></td>
                            <td></td>
                          </tr>
                          {Array.from({ length: 8 }, (_, i) => (
                            <tr key={`empty2-${i}`}>
                              <td colSpan="3"></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          ))}
                          <tr>
                            <td
                              style={{
                                position: 'absolute',
                                left: '5%',
                                fontSize: '10px',
                                fontFamily: 'Arial, serif',
                                top: '260px',
                              }}
                            >
                              Saturdays
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
                                const day = (i + 1).toString().padStart(2, '0');
                                const record = records.find((r) =>
                                  r.date.endsWith(`-${day}`)
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
                                      fontFamily: 'Arial, serif',
                                      margin: '5px 0',
                                    }}
                                  >
                                    I CERTIFY on my honor that the above is a
                                    true and correct report of the hours of work
                                    performed, record of which was made daily at
                                    the time of arrival and at the time of
                                    departure from office.
                                  </p>
                                  <hr
                                    style={{
                                      borderTop: '1px solid black',
                                      width: '50%',
                                      marginTop: '15px',
                                      marginLeft: '180px',
                                    }}
                                  />
                                  <p
                                    style={{
                                      textAlign: 'center',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                      marginLeft: '180px',
                                    }}
                                  >
                                    Signature
                                  </p>
                                  <hr
                                    style={{
                                      borderTop: '1px solid black',
                                      width: '100%',
                                      marginTop: '15px',
                                    }}
                                  />
                                  <p
                                    style={{
                                      paddingLeft: '30px',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                    }}
                                  >
                                    Verified as to prescribed office hours.
                                  </p>
                                  <hr
                                    style={{
                                      borderTop: '1px solid black',
                                      width: '60%',
                                      marginTop: '15px',
                                      marginLeft: '150px',
                                    }}
                                  />
                                  <p
                                    style={{
                                      paddingLeft: '250px',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                    }}
                                  >
                                    In-Charge
                                  </p>
                                  <p
                                    style={{
                                      paddingLeft: '200px',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                    }}
                                  >
                                    (Signature Over Printed Name)
                                  </p>
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
                                const day = (i + 1).toString().padStart(2, '0');
                                const record = records.find((r) =>
                                  r.date.endsWith(`-${day}`)
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
                                      fontFamily: 'Arial, serif',
                                      margin: '5px 0',
                                    }}
                                  >
                                    I CERTIFY on my honor that the above is a
                                    true and correct report of the hours of work
                                    performed, record of which was made daily at
                                    the time of arrival and at the time of
                                    departure from office.
                                  </p>
                                  <hr
                                    style={{
                                      borderTop: '1px solid black',
                                      width: '50%',
                                      marginTop: '15px',
                                      marginLeft: '180px',
                                    }}
                                  />
                                  <p
                                    style={{
                                      textAlign: 'center',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                      marginLeft: '180px',
                                    }}
                                  >
                                    Signature
                                  </p>
                                  <hr
                                    style={{
                                      borderTop: '1px solid black',
                                      width: '100%',
                                      marginTop: '15px',
                                    }}
                                  />
                                  <p
                                    style={{
                                      paddingLeft: '30px',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                    }}
                                  >
                                    Verified as to prescribed office hours.
                                  </p>
                                  <hr
                                    style={{
                                      borderTop: '1px solid black',
                                      width: '60%',
                                      marginTop: '15px',
                                      marginLeft: '150px',
                                    }}
                                  />
                                  <p
                                    style={{
                                      paddingLeft: '250px',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                    }}
                                  >
                                    In-Charge
                                  </p>
                                  <p
                                    style={{
                                      paddingLeft: '200px',
                                      fontSize: '9px',
                                      fontFamily: 'Arial, serif',
                                    }}
                                  >
                                    (Signature Over Printed Name)
                                  </p>
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

        {/* Print and Download Buttons */}
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
      </Box>
    </Container>
  );
};

export default DailyTimeRecord;
