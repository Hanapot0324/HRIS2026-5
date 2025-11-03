import API_BASE_URL from '../../apiConfig';
import React, { useRef, forwardRef, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import Search from '@mui/icons-material/Search';

import WorkIcon from '@mui/icons-material/Work';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import logo from '../../assets/logo.png';
import hrisLogo from '../../assets/hrisLogo.png';
import SuccessfulOverlay from '../SuccessfulOverlay';

const PayslipOverall = forwardRef(({ employee }, ref) => {
  const payslipRef = ref || useRef();

  const [allPayroll, setAllPayroll] = useState([]);
  const [displayEmployee, setDisplayEmployee] = useState(employee || null);
  const [loading, setLoading] = useState(!employee);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: '', // "success" or "error"
    action: '', // "create", "edit", "delete", "send"
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log(
      'Token from localStorage:',
      token ? 'Token exists' : 'No token found'
    );
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filteredPayroll, setFilteredPayroll] = useState([]);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Fetch payroll data
  useEffect(() => {
    if (!employee) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${API_BASE_URL}/PayrollReleasedRoute/released-payroll-detailed`,
            getAuthHeaders()
          );
          setAllPayroll(res.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching payroll:', err);
          setError('Failed to fetch payroll data. Please try again.');
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [employee]);

  const downloadPDF = async () => {
    if (!displayEmployee) return;

    // 1. Identify current month/year from displayEmployee
    const currentStart = new Date(displayEmployee.startDate);
    const currentMonth = currentStart.getMonth(); // 0-11
    const currentYear = currentStart.getFullYear();

    // 2. Collect last 3 months (current, prev, prev-1)
    const monthsToGet = [0, 1, 2].map((i) => {
      const d = new Date(currentYear, currentMonth - i, 1);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      };
    });

    // 3. Find payroll records (or null if missing)
    const records = monthsToGet.map(({ month, year, label }) => {
      const payroll = allPayroll.find(
        (p) =>
          p.employeeNumber === displayEmployee.employeeNumber &&
          new Date(p.startDate).getMonth() === month &&
          new Date(p.startDate).getFullYear() === year
      );
      return { payroll, label };
    });

    // 4. PDF setup
    const pdf = new jsPDF('l', 'in', 'a4');
    const contentWidth = 3.5;
    const contentHeight = 7.1;
    const gap = 0.2;

    const totalWidth = contentWidth * 3 + gap * 2;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const yOffset = (pageHeight - contentHeight) / 2;

    const positions = [
      (pageWidth - totalWidth) / 2,
      (pageWidth - totalWidth) / 2 + contentWidth + gap,
      (pageWidth - totalWidth) / 2 + (contentWidth + gap) * 2,
    ];

    // 5. Render each of the 3 slots
    for (let i = 0; i < records.length; i++) {
      const { payroll, label } = records[i];

      let imgData;

      if (payroll) {
        // ✅ Normal payslip
        setDisplayEmployee(payroll);
        await new Promise((resolve) => setTimeout(resolve, 300)); // wait DOM update

        const input = payslipRef.current;
        const canvas = await html2canvas(input, { scale: 2, useCORS: true });
        imgData = canvas.toDataURL('image/png');
      } else {
        // ❌ Missing → create "No Data" placeholder
        const placeholderCanvas = document.createElement('canvas');
        placeholderCanvas.width = 600;
        placeholderCanvas.height = 1200;
        const ctx = placeholderCanvas.getContext('2d');

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);

        ctx.fillStyle = '#6D2323';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Data', placeholderCanvas.width / 2, 500);
        ctx.font = '20px Arial';
        ctx.fillText(`for ${label}`, placeholderCanvas.width / 2, 550);

        imgData = placeholderCanvas.toDataURL('image/png');
      }

      // Add to PDF
      pdf.addImage(
        imgData,
        'PNG',
        positions[i],
        yOffset,
        contentWidth,
        contentHeight
      );
    }

    // 6. Save file
    pdf.save(`${displayEmployee.name || 'EARIST'}-Payslips-3Months.pdf`);

    setModal({
      open: true,
      type: 'success',
      action: 'download',
    });

    // Restore current employee in UI
    setDisplayEmployee(employee); // Restore to original employee prop
  };

  // Send Payslip via Gmail
  const sendPayslipViaGmail = async () => {
    if (!displayEmployee) return;

    setSending(true);
    try {
      // 1. Identify current month/year
      const currentStart = new Date(displayEmployee.startDate);
      const currentMonth = currentStart.getMonth();
      const currentYear = currentStart.getFullYear();

      // 2. Collect last 3 months (current + 2 previous)
      const monthsToGet = [0, 1, 2].map((i) => {
        const d = new Date(currentYear, currentMonth - i, 1);
        return {
          month: d.getMonth(),
          year: d.getFullYear(),
          label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        };
      });

      // 3. Find records
      const records = monthsToGet.map(({ month, year, label }) => {
        const payroll = allPayroll.find(
          (p) =>
            p.employeeNumber === displayEmployee.employeeNumber &&
            new Date(p.startDate).getMonth() === month &&
            new Date(p.startDate).getFullYear() === year
        );
        return { payroll, label };
      });

      // 4. PDF setup
      const pdf = new jsPDF('l', 'in', 'a4');
      const contentWidth = 3.5;
      const contentHeight = 7.1;
      const gap = 0.2;

      const totalWidth = contentWidth * 3 + gap * 2;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const yOffset = (pageHeight - contentHeight) / 2;

      const positions = [
        (pageWidth - totalWidth) / 2,
        (pageWidth - totalWidth) / 2 + contentWidth + gap,
        (pageWidth - totalWidth) / 2 + (contentWidth + gap) * 2,
      ];

      // 5. Render each slot (same as downloadPDF)
      for (let i = 0; i < records.length; i++) {
        const { payroll, label } = records[i];
        let imgData;

        if (payroll) {
          setDisplayEmployee(payroll);
          await new Promise((resolve) => setTimeout(resolve, 300));
          const input = payslipRef.current;
          const canvas = await html2canvas(input, { scale: 2, useCORS: true });
          imgData = canvas.toDataURL('image/png');
        } else {
          // No Data placeholder
          const placeholderCanvas = document.createElement('canvas');
          placeholderCanvas.width = 600;
          placeholderCanvas.height = 1200;
          const ctx = placeholderCanvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);
          ctx.fillStyle = '#6D2323';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('No Data', placeholderCanvas.width / 2, 500);
          ctx.font = '20px Arial';
          ctx.fillText(`for ${label}`, placeholderCanvas.width / 2, 550);
          imgData = placeholderCanvas.toDataURL('image/png');
        }

        pdf.addImage(
          imgData,
          'PNG',
          positions[i],
          yOffset,
          contentWidth,
          contentHeight
        );
      }

      // 6. Convert PDF to Blob
      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `${displayEmployee.name}_payslip.pdf`);
      formData.append('name', displayEmployee.name);
      formData.append('employeeNumber', displayEmployee.employeeNumber);

      // 7. Send to backend
      const res = await axios.post(
        `${API_BASE_URL}/SendPayslipRoute/send-payslip`,
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data.success) {
        setModal({
          open: true,
          type: 'success',
          action: 'gmail',
        });
      } else {
        setModal({
          open: true,
          type: 'error',
          message: res.data.error || 'Failed to send payslip.',
        });
      }
    } catch (err) {
      console.error('Error sending payslip:', err);
      setModal({
        open: true,
        type: 'error',
        message: 'An error occurred while sending the payslip.',
      });
    } finally {
      setDisplayEmployee(employee); // Restore to original employee prop
      setSending(false);
    }
  };

  // For Search
  const handleSearch = () => {
    if (!search.trim()) return;

    const result = allPayroll.filter(
      (emp) =>
        emp.employeeNumber.toString().includes(search.trim()) ||
        emp.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    if (result.length > 0) {
      setFilteredPayroll(result);
      setDisplayEmployee(null); // don't auto-display
      setSelectedMonth(''); // reset month filter
      setHasSearched(true);
    } else {
      setFilteredPayroll([]);
      setDisplayEmployee(null);
      setSelectedMonth('');
      setHasSearched(true);
    }
  };

  // For Clear / Reset
  const clearSearch = () => {
    setSearch('');
    setHasSearched(false);
    setSelectedMonth('');
    setFilteredPayroll([]);
    if (employee) {
      setDisplayEmployee(employee);
    } else {
      setDisplayEmployee(null);
    }
  };

  // 📅 Month filter
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    const monthIndex = months.indexOf(month);

    const result = allPayroll.filter(
      // Filter from allPayroll, not filteredPayroll
      (emp) =>
        (hasSearched
          ? emp.employeeNumber.toString().includes(search.trim()) ||
            emp.name.toLowerCase().includes(search.trim().toLowerCase())
          : true) && // Apply search filter if present
        new Date(emp.startDate).getMonth() === monthIndex
    );

    setDisplayEmployee(result.length > 0 ? result[0] : null);
  };

  // Helper function to format currency, returning blank if 0 or falsy
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num !== 0 ? `₱${num.toLocaleString()}` : '';
  };

  // Helper function to format rendered days/hours, returning blank if 0 or falsy
  const formatRenderedDays = (value) => {
    const totalHours = Number(value);
    if (!isNaN(totalHours) && totalHours > 0) {
      const days = Math.floor(totalHours / 8);
      const hours = totalHours % 8;
      return `${days} days${hours > 0 ? ` & ${hours} hrs` : ''}`;
    }
    return '';
  };

  return (
    <Container maxWidth="10%">
      {/* Header Bar */}
      <Paper
        elevation={6}
        sx={{
          backgroundColor: 'rgb(109, 35, 35)',
          color: '#fff',
          p: 3,
          borderRadius: 3,
          borderEndEndRadius: '0',
          borderEndStartRadius: '0',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <WorkIcon fontSize="large" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Payslip Records
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Generate and manage all employee payslip records
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box
        mb={2}
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{
          backgroundColor: 'white',
          border: '2px solid #6D2323',
          borderRadius: 2,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          p: 3,
        }}
      >
        {/* Search Bar */}
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search by Employee # or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#6D2323', marginRight: 1 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              flex: 1,
            }}
          />
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!search.trim()}
              sx={{
                backgroundColor: '#6D2323',
                '&:hover': { backgroundColor: '#B22222' },
                '&:disabled': { backgroundColor: '#ccc' },
              }}
            >
              Search Employee
            </Button>
            <Button
              variant="outlined"
              onClick={clearSearch}
              sx={{
                borderColor: '#6D2323',
                color: '#6D2323',
                '&:hover': {
                  borderColor: '#B22222',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* Month Filter */}
        <Typography
          variant="subtitle2"
          color={hasSearched ? 'textSecondary' : 'textDisabled'}
        >
          Filter By Month {!hasSearched && '(Search for an employee first)'}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {months.map((m) => (
            <Button
              key={m}
              variant={m === selectedMonth ? 'contained' : 'outlined'}
              size="small"
              disabled={!hasSearched}
              sx={{
                backgroundColor: m === selectedMonth ? '#6D2323' : '#fff',
                color:
                  m === selectedMonth
                    ? '#fff'
                    : hasSearched
                    ? '#6D2323'
                    : '#ccc',
                borderColor: hasSearched ? '#6D2323' : '#ccc',
                '&:hover': {
                  backgroundColor: hasSearched
                    ? m === selectedMonth
                      ? '#B22222'
                      : '#f5f5f5'
                    : '#fff',
                },
                '&:disabled': {
                  backgroundColor: '#f5f5f5',
                  color: '#ccc',
                  borderColor: '#ccc',
                },
              }}
              onClick={() => handleMonthSelect(m)}
            >
              {m}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Payslip Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress sx={{ color: '#6D2323' }} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : displayEmployee ? (
        <Paper
          ref={payslipRef}
          elevation={4}
          sx={{
            p: 4,
            mt: 2,
            border: '2px solid black',
            borderRadius: 1,
            backgroundColor: '#fff',
            fontFamily: 'Arial, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={hrisLogo}
            alt="Watermark"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.07,
              width: '100%',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
          
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
            sx={{
              background: 'linear-gradient(to right, #6d2323, #a31d1d)',
              borderRadius: '2px',
              p: 2,
            }}
          >
            <Box>
              <img
                src={logo}
                alt="Logo"
                style={{ width: '60px', marginLeft: '10px' }}
              />
            </Box>
            <Box textAlign="center" flex={1} sx={{ color: 'white' }}>
              <Typography variant="subtitle2" sx={{ fontStyle: 'italic', fontSize: '14px' }}>
                Republic of the Philippines
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ fontSize: '16px' }}
              >
                EULOGIO "AMANG" RODRIGUEZ INSTITUTE OF SCIENCE AND TECHNOLOGY
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '12px' }}>
                Nagtahan, Sampaloc Manila
              </Typography>
            </Box>
            <Box>
              <img src={hrisLogo} alt="HRIS Logo" style={{ width: '80px' }} />
            </Box>
          </Box>

          {/* Employee Information Section */}
          <Box
            sx={{
              border: '2px solid black',
              mb: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#6D2323',
                color: 'white',
                p: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              EMPLOYEE INFORMATION
            </Box>
            <Box sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  PERIOD:
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(() => {
                    if (!displayEmployee.startDate || !displayEmployee.endDate)
                      return '—';
                    const start = new Date(displayEmployee.startDate);
                    const end = new Date(displayEmployee.endDate);
                    const month = start
                      .toLocaleString('en-US', { month: 'long' })
                      .toUpperCase();
                    return `${month} ${start.getDate()}-${end.getDate()} ${end.getFullYear()}`;
                  })()}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  EMPLOYEE NUMBER:
                </Typography>
                <Typography sx={{ fontSize: '14px', color: 'red', fontWeight: 'bold' }}>
                  {displayEmployee.employeeNumber
                    ? `${parseFloat(displayEmployee.employeeNumber)}`
                    : ''}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  NAME:
                </Typography>
                <Typography sx={{ fontSize: '14px', color: 'red', fontWeight: 'bold' }}>
                  {displayEmployee.name ? `${displayEmployee.name}` : ''}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  RENDERED DAYS:
                </Typography>
                <Typography sx={{ fontSize: '14px' }}>
                  {formatRenderedDays(displayEmployee.rh)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Salary Section */}
          <Box
            sx={{
              border: '2px solid black',
              mb: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#6D2323',
                color: 'white',
                p: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              SALARY DETAILS
            </Box>
            <Box sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  GROSS SALARY:
                </Typography>
                <Typography sx={{ fontSize: '14px' }}>
                  {formatCurrency(displayEmployee.grossSalary)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  TOTAL DEDUCTIONS:
                </Typography>
                <Typography sx={{ fontSize: '14px' }}>
                  {formatCurrency(displayEmployee.totalDeductions)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                sx={{
                  borderTop: '2px solid black',
                  pt: 1,
                  mt: 1,
                }}
              >
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                  NET SALARY:
                </Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#6D2323' }}>
                  {formatCurrency(displayEmployee.netSalary)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Deductions Section */}
          <Box
            sx={{
              border: '2px solid black',
              mb: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#6D2323',
                color: 'white',
                p: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              DEDUCTIONS
            </Box>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {[
                  { label: 'Withholding Tax', value: displayEmployee.withholdingTax },
                  { label: 'L. Ret', value: displayEmployee.personalLifeRetIns },
                  { label: 'GSIS Salary Loan', value: displayEmployee.gsisSalaryLoan },
                  { label: 'Policy', value: displayEmployee.gsisPolicyLoan },
                  { label: 'Housing Loan', value: displayEmployee.gsisHousingLoan },
                  { label: 'GSIS Arrears', value: displayEmployee.gsisArrears },
                  { label: 'GFAL', value: displayEmployee.gfal },
                  { label: 'CPL', value: displayEmployee.cpl },
                  { label: 'MPL', value: displayEmployee.mpl },
                  { label: 'MPL Lite', value: displayEmployee.mplLite },
                  { label: 'ELA', value: displayEmployee.ela },
                  { label: 'SSS', value: displayEmployee.sss },
                  { label: 'Pag-IBIG', value: displayEmployee.pagibigFundCont },
                  { label: 'PhilHealth', value: displayEmployee.PhilHealthContribution },
                  { label: 'PhilHealth (Diff)', value: displayEmployee.philhealthDiff },
                  { label: 'Pag-IBIG 2', value: displayEmployee.pagibig2 },
                  { label: 'LBP Loan', value: displayEmployee.lbpLoan },
                  { label: 'MTSLAI', value: displayEmployee.mtslai },
                  { label: 'ECC', value: displayEmployee.ecc },
                  { label: 'To Be Refunded', value: displayEmployee.toBeRefunded },
                  { label: 'FEU', value: displayEmployee.feu },
                  { label: 'ESLAI', value: displayEmployee.eslai },
                  { label: 'ABS', value: displayEmployee.abs },
                ].map((item, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5, mb: 0.5 }}
                  >
                    <Typography sx={{ fontSize: '12px' }}>{item.label}:</Typography>
                    <Typography sx={{ fontSize: '12px' }}>
                      {formatCurrency(item.value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Payment Section */}
          <Box
            sx={{
              border: '2px solid black',
              mb: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#6D2323',
                color: 'white',
                p: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              PAYMENT BREAKDOWN
            </Box>
            <Box sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  1st Quincena:
                </Typography>
                <Typography sx={{ fontSize: '14px' }}>
                  {formatCurrency(displayEmployee.pay1st)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                  2nd Quincena:
                </Typography>
                <Typography sx={{ fontSize: '14px' }}>
                  {formatCurrency(displayEmployee.pay2nd)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box textAlign="center" mt={3}>
            <Typography sx={{ fontSize: '14px', fontWeight: 'bold', mb: 1 }}>
              Certified Correct:
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
              GIOVANNI L. AHUNIN
            </Typography>
            <Typography sx={{ fontSize: '12px' }}>
              Director, Administrative Services
            </Typography>
          </Box>
        </Paper>
      ) : selectedMonth ? (
        <Alert
          severity="info"
          sx={{
            mt: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #6d2323',
            color: '#6d2323',
            '& .MuiAlert-icon': { color: '#6D2323' },
          }}
        >
          There's no payslip saved for the month of <b>{selectedMonth}.</b>
        </Alert>
      ) : hasSearched ? (
        <Alert
          severity="info"
          sx={{
            mt: 3,
            backgroundColor: 'rgba(109, 35, 35, 0.1)',
            color: '#6D2323',
            '& .MuiAlert-icon': { color: '#6D2323' },
          }}
        >
          Please select a month to view your payslip.
        </Alert>
      ) : null}

      {/* Action Buttons */}
      {displayEmployee && (
        <Box display="flex" justifyContent="center" mt={2} gap={2} mb={3}>
          <Button
            variant="contained"
            onClick={downloadPDF}
            sx={{
              backgroundColor: '#6D2323',
              '&:hover': { backgroundColor: '#B22222' },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            Download Payslip | PDF
          </Button>

          <Button
            variant="contained"
            onClick={sendPayslipViaGmail}
            disabled={sending}
            sx={{
              backgroundColor: '#000000',
              '&:hover': { backgroundColor: '#2f2f2f' },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            {sending ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Send via Gmail'
            )}
          </Button>
        </Box>
      )}
      <Dialog
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
      >
        <SuccessfulOverlay
          open={modal.open && modal.type === 'success'}
          action={modal.action}
          onClose={() => setModal({ ...modal, open: false })}
        />

        {modal.type === 'error' && (
          <div style={{ color: 'red', padding: '20px' }}>
            {modal.message || 'An error occurred'}
          </div>
        )}
      </Dialog>
    </Container>
  );
});

export default PayslipOverall;