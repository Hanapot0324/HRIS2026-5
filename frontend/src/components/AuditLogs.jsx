import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  CircularProgress,
  Container,
  Alert,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Fade,
  Backdrop,
  styled,
  alpha,
  CardHeader,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Remove as RemoveIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList,
  Security,
  Warning,
  Error,
  Home,
  Refresh,
  Person,
  ViewList,
  SupervisorAccount,
  AdminPanelSettings,
  Work,
  Info,
  Category,
  Assignment,
  Assessment,
  Payment,
  Description as FormIcon,
  Folder,
  FolderSpecial,
} from '@mui/icons-material';
import { getUserInfo } from '../utils/auth';

// Get auth headers function
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

// System Settings Hook
const useSystemSettings = () => {
  const [settings, setSettings] = useState({
    primaryColor: '#894444',
    secondaryColor: '#6d2323',
    accentColor: '#FEF9E1',
    textColor: '#FFFFFF',
    textPrimaryColor: '#6D2323', 
    textSecondaryColor: '#FEF9E1', 
    hoverColor: '#6D2323',
    backgroundColor: '#FFFFFF',
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('systemSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings && typeof parsedSettings === 'object') {
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error parsing stored settings:', error);
      }
    }

    const fetchSettings = async () => {
      try {
        const url = API_BASE_URL.includes('/api') 
          ? `${API_BASE_URL}/system-settings`
          : `${API_BASE_URL}/api/system-settings`;
        
        const response = await axios.get(url, getAuthHeaders());
        if (response.data && typeof response.data === 'object') {
          setSettings(response.data);
          localStorage.setItem('systemSettings', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error fetching system settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return settings;
};

const AuditLogs = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

  const settings = useSystemSettings();
  
  // Memoized styled components
  const GlassCard = useMemo(() => styled(Card)(({ theme }) => ({
    borderRadius: 20,
    background: `${settings?.accentColor || '#FEF9E1'}F2`,
    backdropFilter: "blur(10px)",
    boxShadow: `0 8px 40px ${settings?.primaryColor || '#894444'}14`,
    border: `1px solid ${settings?.primaryColor || '#894444'}1A`,
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      boxShadow: `0 12px 48px ${settings?.primaryColor || '#894444'}26`,
      transform: "translateY(-4px)",
    },
  })), [settings]);

  const ProfessionalButton = useMemo(() => styled(Button)(({ theme, variant }) => ({
    borderRadius: 12,
    fontWeight: 600,
    padding: "12px 24px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textTransform: "none",
    fontSize: "0.95rem",
    letterSpacing: "0.025em",
    boxShadow: variant === "contained" ? `0 4px 14px ${settings?.primaryColor || '#894444'}40` : "none",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: variant === "contained" ? `0 6px 20px ${settings?.primaryColor || '#894444'}59` : "none",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  })), [settings]);

  const ModernTextField = useMemo(() => styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      "&:hover": {
        transform: "translateY(-1px)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
      },
      "&.Mui-focused": {
        transform: "translateY(-1px)",
        boxShadow: `0 4px 20px ${settings?.primaryColor || '#894444'}40`,
        backgroundColor: "rgba(255, 255, 255, 1)",
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
    },
  })), [settings]);

  // Session management
  const isSessionValid = () => {
    const sessionData = sessionStorage.getItem('auditLogsSession');
    if (!sessionData) return false;
    
    try {
      const { timestamp } = JSON.parse(sessionData);
      const now = Date.now();
      const sessionAge = now - timestamp;
      return sessionAge < SESSION_DURATION;
    } catch (error) {
      return false;
    }
  };

  const storeSession = () => {
    const sessionData = {
      timestamp: Date.now(),
      authenticated: true
    };
    sessionStorage.setItem('auditLogsSession', JSON.stringify(sessionData));
  };

  const clearSession = () => {
    sessionStorage.removeItem('auditLogsSession');
    setIsAuthenticated(false);
    setPasswordDialogOpen(true);
  };

  // Get current user
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setCurrentUser(userInfo);
      setUserRole(userInfo.role);
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    if (isSessionValid()) {
      setIsAuthenticated(true);
      setPasswordDialogOpen(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Load audit logs
  const loadAuditLogs = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/audit-logs`, getAuthHeaders());
      
      if (response.data && Array.isArray(response.data)) {
        setAuditLogs(response.data);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setAuditLogs([]);
      setToast({ message: 'Failed to load audit logs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAuditLogs();
    }
  }, [isAuthenticated]);

  // Filter logs
  useEffect(() => {
    let filtered = [...auditLogs];

    if (userRole && userRole !== 'administrator' && userRole !== 'superadmin') {
      filtered = filtered.filter((log) => log.employeeNumber === currentUser?.employeeNumber);
    }

    if (actionFilter) {
      filtered = filtered.filter((log) => 
        log.action?.toLowerCase().includes(actionFilter.toLowerCase())
      );
    }

    if (moduleFilter) {
      filtered = filtered.filter((log) => 
        log.table_name?.toLowerCase().includes(moduleFilter.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((log) => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === dateFilter;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });

    setFilteredLogs(filtered);
  }, [actionFilter, moduleFilter, dateFilter, auditLogs, userRole, currentUser]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle password submit - verify confidential password
  const handlePasswordSubmit = async () => {
    if (!passwordInput) {
      setPasswordError('Please enter the confidential password.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/confidential-password/verify`,
        { password: passwordInput },
        getAuthHeaders()
      );

      if (response.data.verified) {
        setPasswordError('');
        setPasswordDialogOpen(false);
        setIsAuthenticated(true);
        storeSession();
        setToast({ message: 'Access granted', type: 'success' });
        setPasswordInput('');
      } else {
        setPasswordError('Incorrect password. Please try again.');
        setPasswordInput('');
      }
    } catch (error) {
      console.error('Error verifying confidential password:', error);
      setPasswordError(error.response?.data?.error || 'Failed to verify password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleCloseDialog = () => {
    setPasswordDialogOpen(false);
    navigate(-1);
  };

  // ENHANCED: Get action color with distinct colors for each action type
  const getActionColor = (action) => {
    if (!action) return '#6b7280';
    const actionUpper = action.toUpperCase();
    const colors = {
      // Creation actions - Green shades
      CREATE: '#10b981',     // Emerald green
      INSERT: '#059669',     // Darker green
      
      // Modification actions - Blue shades
      UPDATE: '#3b82f6',     // Blue
      EDIT: '#2563eb',       // Darker blue
      
      // Deletion actions - Red shades
      DELETE: '#ef4444',     // Red
      REMOVE: '#dc2626',     // Darker red
      
      // Authentication actions - Purple shades
      LOGIN: '#8b5cf6',      // Purple
      LOGOUT: '#7c3aed',     // Darker purple
      
      // View/Read actions - Cyan shades
      VIEW: '#06b6d4',       // Cyan
      SEARCH: '#0891b2',     // Darker cyan
      
      // Export/Report actions - Orange shades
      EXPORT: '#f59e0b',     // Orange
      REPORT: '#d97706',     // Darker orange
      
      // Default
      DEFAULT: '#6b7280',    // Gray
    };
    return colors[actionUpper] || colors.DEFAULT;
  };

  // ENHANCED: Get action icon for each action type
  const getActionIcon = (action) => {
    if (!action) return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    const actionUpper = action.toUpperCase();
    const icons = {
      CREATE: <AddIcon sx={{ fontSize: 16 }} />,
      INSERT: <AddIcon sx={{ fontSize: 16 }} />,
      UPDATE: <EditIcon sx={{ fontSize: 16 }} />,
      EDIT: <EditIcon sx={{ fontSize: 16 }} />,
      DELETE: <RemoveIcon sx={{ fontSize: 16 }} />,
      REMOVE: <DeleteIcon sx={{ fontSize: 16 }} />,
      LOGIN: <LockOpenIcon sx={{ fontSize: 16 }} />,
      LOGOUT: <LockIcon sx={{ fontSize: 16 }} />,
      VIEW: <VisibilityIcon sx={{ fontSize: 16 }} />,
      SEARCH: <SearchIcon sx={{ fontSize: 16 }} />,
      EXPORT: <FileDownloadIcon sx={{ fontSize: 16 }} />,
      REPORT: <Assessment sx={{ fontSize: 16 }} />,
    };
    return icons[actionUpper] || <CheckCircleIcon sx={{ fontSize: 16 }} />;
  };

  // Format audit log entry with color-coded action
  const formatAuditLog = (log) => {
    const timestamp = new Date(log.timestamp);
    const formattedTime = `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`;
    const employeeNumber = log.employeeNumber || 'Unknown';
    const action = log.action?.toUpperCase() || 'UNKNOWN';
    const actionColor = getActionColor(log.action);
    const module = log.table_name?.toUpperCase() || 'UNKNOWN';
    const recordId = log.record_id ? ` #${log.record_id}` : '';
    const targetEmployee = log.targetEmployeeNumber ? ` (Target: ${log.targetEmployeeNumber})` : '';

    let logString = `[${formattedTime}] - `;
    logString += `<strong>Employee ${employeeNumber}</strong> `;
    logString += `performed <strong style="color: ${actionColor};">${action}</strong> `;
    logString += `on <strong>${module}${recordId}</strong>${targetEmployee}.`;

    return logString;
  };

  // Export audit log
  const handleExportLog = () => {
    let csv = 'Timestamp,Employee Number,Action,Table Name,Record ID,Target Employee\n';

    filteredLogs.forEach((log) => {
      const timestamp = new Date(log.timestamp || log.created_at).toLocaleString();
      csv += `"${timestamp}","${log.employeeNumber || 'Unknown'}","${log.action || 'N/A'}","${log.table_name || 'N/A'}","${log.record_id || 'N/A'}","${log.targetEmployeeNumber || 'N/A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setToast({ message: 'Audit trail exported successfully!', type: 'success' });
  };

  // Refresh logs
  const handleRefresh = () => {
    setRefreshing(true);
    loadAuditLogs();
    setToast({ message: 'Logs refreshed', type: 'success' });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (logId) => {
    setDeleteLogId(logId);
    setDeleteConfirmed(false);
    setDeleteDialog(true);
  };

  // Handle delete audit log
  const handleDeleteLog = async () => {
    if (!deleteLogId) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/audit-logs/${deleteLogId}`,
        getAuthHeaders()
      );

      if (response.status === 200 || response.status === 204) {
        setToast({ message: 'Audit log deleted successfully', type: 'success' });
        await loadAuditLogs();
        setDeleteDialog(false);
        setDeleteLogId(null);
        setDeleteConfirmed(false);
      } else {
        setToast({ message: 'Failed to delete audit log', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting audit log:', error);
      setToast({
        message: error.response?.data?.error || 'Failed to delete audit log',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique actions for filter
  const getUniqueActions = () => {
    const actions = [...new Set(auditLogs.map(log => log.action).filter(Boolean))];
    return actions.sort();
  };

  // Get unique modules for filter
  const getUniqueModules = () => {
    const modules = [...new Set(auditLogs.map(log => log.table_name).filter(Boolean))];
    return modules.sort();
  };

  // Show password dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog
        open={passwordDialogOpen}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: settings?.accentColor || '#FEF9E1',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${settings?.primaryColor || '#A31D1D'} 0%, ${settings?.secondaryColor || '#8a4747'} 100%)`,
            color: settings?.accentColor || '#FEF9E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            fontWeight: 700,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <LockIcon sx={{ mr: 1 }} />
            Audit Logs Access
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: settings?.accentColor || '#FEF9E1',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center', color: settings?.primaryColor || '#A31D1D' }}
          >
            This section contains sensitive audit information. Please enter the
            access password.
          </Typography>
          <ModernTextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Access Password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5) }}>
          <ProfessionalButton
            onClick={handlePasswordSubmit}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: settings?.primaryColor || '#A31D1D',
              color: settings?.accentColor || '#FEF9E1',
              "&:hover": {
                bgcolor: settings?.secondaryColor || '#8a1a1a',
              },
            }}
          >
            Access Audit Logs
          </ProfessionalButton>
        </DialogActions>
      </Dialog>
    );
  }

  if (loading && auditLogs.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: settings?.primaryColor || '#A31D1D', mb: 2 }} />
          <Typography variant="h6" sx={{ color: settings?.primaryColor || '#A31D1D' }}>
            Loading audit logs...
          </Typography>
        </Box>
      </Container>
    );
  }

  const isAdmin = userRole === 'administrator' || userRole === 'superadmin';
  const pageTitle = isAdmin ? 'Audit Trail (All Users)' : 'My Activity Log';

  return (
    <Box
      sx={{
        py: 4,
        borderRadius: "14px",
        width: "100vw",
        mx: "auto",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
        minHeight: "92vh",
      }}
    >
      <Box sx={{ px: 6, mx: "auto", maxWidth: "1600px" }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <GlassCard>
              <Box
                sx={{
                  p: 5,
                  background: `linear-gradient(135deg, ${settings?.accentColor || '#FEF9E1'} 0%, ${alpha(settings?.accentColor || '#FEF9E1', 0.9)} 100%)`,
                  color: settings?.primaryColor || '#A31D1D',
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: `radial-gradient(circle, ${alpha(settings?.primaryColor || '#A31D1D', 0.1)} 0%, ${alpha(settings?.primaryColor || '#A31D1D', 0)} 70%)`,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -30,
                    left: "30%",
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${alpha(settings?.primaryColor || '#A31D1D', 0.08)} 0%, ${alpha(settings?.primaryColor || '#A31D1D', 0)} 70%)`,
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
                        bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.15),
                        mr: 4,
                        width: 64,
                        height: 64,
                        boxShadow: `0 8px 24px ${alpha(settings?.primaryColor || '#A31D1D', 0.15)}`,
                      }}
                    >
                      <Security sx={{ fontSize: 32, color: settings?.primaryColor || '#A31D1D' }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          lineHeight: 1.2,
                          color: settings?.primaryColor || '#A31D1D',
                        }}
                      >
                        {pageTitle}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.8,
                          fontWeight: 400,
                          color: settings?.textPrimaryColor || '#6D2323',
                        }}
                      >
                        {isAdmin ? 'System-wide activity tracking and security monitoring' : 'Your personal activity history and access logs'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={`${filteredLogs.length} Logs`}
                      size="small"
                      sx={{
                        bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.15),
                        color: settings?.primaryColor || '#A31D1D',
                        fontWeight: 500,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    <Tooltip title="Refresh Logs">
                      <IconButton
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{
                          bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.1),
                          "&:hover": { bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.2) },
                          color: settings?.primaryColor || '#A31D1D',
                          width: 48,
                          height: 48,
                          "&:disabled": {
                            bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.05),
                            color: alpha(settings?.primaryColor || '#A31D1D', 0.3),
                          },
                        }}
                      >
                        {loading ? (
                          <CircularProgress
                            size={24}
                            sx={{ color: settings?.primaryColor || '#A31D1D' }}
                          />
                        ) : (
                          <Refresh />
                        )}
                      </IconButton>
                    </Tooltip>

                    {isAdmin && (
                      <ProfessionalButton
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportLog}
                        sx={{
                          bgcolor: settings?.primaryColor || '#A31D1D',
                          color: settings?.accentColor || '#FEF9E1',
                          "&:hover": {
                            bgcolor: settings?.secondaryColor || '#8a1a1a',
                          },
                        }}
                      >
                        Export
                      </ProfessionalButton>
                    )}
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Toast Messages */}
        {toast && toast.type === 'success' && (
          <Backdrop
            open={true}
            sx={{
              zIndex: 9999,
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={() => setToast(null)}
          >
            <Fade in timeout={300}>
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: "relative",
                  minWidth: "400px",
                  maxWidth: "600px",
                }}
              >
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.4)",
                    fontSize: "1.1rem",
                    p: 3,
                    "& .MuiAlert-message": { fontWeight: 500 },
                    "& .MuiAlert-icon": { fontSize: "2rem" },
                  }}
                  icon={<CheckCircleIcon />}
                  onClose={() => setToast(null)}
                >
                  {toast.message}
                </Alert>
              </Box>
            </Fade>
          </Backdrop>
        )}

        {toast && toast.type === 'error' && (
          <Backdrop
            open={true}
            sx={{
              zIndex: 9999,
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={() => setToast(null)}
          >
            <Fade in timeout={300}>
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: "relative",
                  minWidth: "400px",
                  maxWidth: "600px",
                }}
              >
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.4)",
                    fontSize: "1.1rem",
                    p: 3,
                    "& .MuiAlert-message": { fontWeight: 500 },
                    "& .MuiAlert-icon": { fontSize: "2rem" },
                  }}
                  icon={<Error />}
                  onClose={() => setToast(null)}
                >
                  {toast.message}
                </Alert>
              </Box>
            </Fade>
          </Backdrop>
        )}

        {/* Search & Filter */}
        <Fade in timeout={700}>
          <GlassCard sx={{ mb: 4 }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.8),
                      color: settings?.textPrimaryColor || '#6D2323',
                    }}
                  >
                    <FilterList />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                    >
                      Search & Filter
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                    >
                      Find and filter audit logs by various criteria
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{
                bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5),
                pb: 2,
                borderBottom: `1px solid ${alpha(settings?.primaryColor || '#A31D1D', 0.1)}`,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <ModernTextField
                    select
                    fullWidth
                    label="All Actions"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <MenuItem value="">All Actions</MenuItem>
                    {getUniqueActions().map((action) => (
                      <MenuItem key={action} value={action}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getActionIcon(action)}
                          <span style={{ color: getActionColor(action), fontWeight: 600 }}>
                            {action}
                          </span>
                        </Box>
                      </MenuItem>
                    ))}
                  </ModernTextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ModernTextField
                    select
                    fullWidth
                    label="All Modules"
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                  >
                    <MenuItem value="">All Modules</MenuItem>
                    {getUniqueModules().map((module) => (
                      <MenuItem key={module} value={module}>
                        {module}
                      </MenuItem>
                    ))}
                  </ModernTextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ModernTextField
                    type="date"
                    fullWidth
                    label="Filter by Date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </GlassCard>
        </Fade>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: settings?.accentColor || '#FEF9E1',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading && !refreshing}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: settings?.accentColor || '#FEF9E1' }}>
              Loading audit logs...
            </Typography>
          </Box>
        </Backdrop>

        {/* Audit Log Entries */}
        {!loading && (
          <Fade in timeout={900}>
            <GlassCard>
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${settings?.accentColor || '#FEF9E1'} 0%, ${alpha(settings?.accentColor || '#FEF9E1', 0.9)} 100%)`,
                  color: settings?.primaryColor || '#A31D1D',
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `1px solid ${alpha(settings?.primaryColor || '#A31D1D', 0.1)}`,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: settings?.primaryColor || '#A31D1D' }}
                  >
                    {isAdmin ? 'System Activity Log' : 'My Activity History'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.8, color: settings?.textPrimaryColor || '#6D2323' }}
                  >
                    {actionFilter || moduleFilter || dateFilter
                      ? `Showing ${filteredLogs.length} of ${auditLogs.length} logs matching filters`
                      : `Total: ${auditLogs.length} registered logs`}
                  </Typography>
                </Box>
              </Box>

              {/* Scrollable container for log entries */}
              <Box
                sx={{
                  height: '500px',
                  overflowY: 'auto',
                  p: 3,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(settings?.accentColor || '#FEF9E1', 0.2),
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(settings?.primaryColor || '#A31D1D', 0.5),
                    borderRadius: '4px',
                    '&:hover': {
                      background: alpha(settings?.primaryColor || '#A31D1D', 0.7),
                    },
                  },
                }}
              >
                {filteredLogs.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      color: '#666',
                    }}
                  >
                    <Info
                      sx={{
                        fontSize: 80,
                        color: alpha(settings?.primaryColor || '#A31D1D', 0.3),
                        mb: 3,
                      }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, color: settings?.primaryColor || '#A31D1D' }}>
                      No audit logs found
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(settings?.primaryColor || '#A31D1D', 0.6) }}>
                      {isAdmin ? 'System activities will be logged here' : 'Your activities will be logged here'}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {filteredLogs.map((log, index) => {
                      const actionColor = getActionColor(log.action);

                      return (
                        <Box
                          key={log.id || index}
                          sx={{
                            p: 2,
                            mb: 1.5,
                            backgroundColor: '#f9fafb',
                            borderLeft: `4px solid ${actionColor}`,
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            lineHeight: 1.8,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(settings?.accentColor || '#FEF9E1', 0.3),
                              transform: 'translateX(4px)',
                              boxShadow: `0 2px 8px ${alpha(actionColor, 0.2)}`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              color: '#1f2937',
                              '& strong': {
                                fontWeight: 600,
                              },
                            }}
                            dangerouslySetInnerHTML={{ __html: formatAuditLog(log) }}
                          />
                          <Box
                            sx={{
                              mt: 1,
                              pt: 1,
                              borderTop: '1px solid #e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                              fontSize: '11px',
                              color: '#6b7280',
                              fontFamily: 'sans-serif',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                icon={getActionIcon(log.action)}
                                label={log.action?.toUpperCase() || 'UNKNOWN'}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '10px',
                                  backgroundColor: actionColor,
                                  color: 'white',
                                  fontWeight: 600,
                                  '& .MuiChip-icon': {
                                    color: 'white',
                                  },
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                                <Typography sx={{ fontSize: '11px' }}>
                                  Status: Success
                                </Typography>
                              </Box>
                            </Box>
                            {isAdmin && (
                              <Tooltip title="Delete Log">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteConfirm(log.id)}
                                  sx={{
                                    color: '#ef4444',
                                    '&:hover': {
                                      bgcolor: alpha('#ef4444', 0.1),
                                    },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  mt: 0,
                  pt: 2,
                  pb: 2,
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 3,
                  backgroundColor: alpha(settings?.accentColor || '#FEF9E1', 0.5),
                }}
              >
                <Typography sx={{ color: '#666', fontSize: '14px' }}>
                  <strong>Total Logs:</strong> {filteredLogs.length}{' '}
                  <span style={{ color: '#999' }}>
                    | {actionFilter || moduleFilter || dateFilter ? `Showing ${filteredLogs.length} of ${auditLogs.length} entries` : 'Showing all entries'}
                  </span>
                </Typography>
              </Box>
            </GlassCard>
          </Fade>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => {
            setDeleteDialog(false);
            setDeleteConfirmed(false);
            setDeleteLogId(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: settings?.accentColor || '#FEF9E1',
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${settings?.primaryColor || '#A31D1D'} 0%, ${settings?.secondaryColor || '#8a4747'} 100%)`,
              color: settings?.accentColor || '#FEF9E1',
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 3,
              fontWeight: 700,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: `radial-gradient(circle, ${alpha('#ffffff', 0.1)} 0%, transparent 70%)`,
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 1 }}>
              <Avatar
                sx={{
                  bgcolor: alpha('#ffffff', 0.2),
                  width: 48,
                  height: 48,
                }}
              >
                <Warning sx={{ fontSize: 28, color: settings?.accentColor || '#FEF9E1' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Confirm Deletion
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.85rem" }}>
                  This action requires confirmation
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => {
                setDeleteDialog(false);
                setDeleteConfirmed(false);
                setDeleteLogId(null);
              }}
              sx={{
                color: settings?.accentColor || '#FEF9E1',
                position: "relative",
                zIndex: 1,
                "&:hover": {
                  bgcolor: alpha('#ffffff', 0.1),
                },
              }}
            >
              <CancelIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Error sx={{ fontSize: 48, color: settings?.primaryColor || '#A31D1D' }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: settings?.textPrimaryColor || '#6D2323',
                  fontWeight: 600,
                  mb: 1.5,
                }}
              >
                Are you sure you want to delete this audit log?
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(settings?.textPrimaryColor || '#6D2323', 0.7),
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                This action cannot be undone. Deleting this audit log will permanently remove it
                from the system. This may affect compliance and audit trail integrity.
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.08),
                border: `2px solid ${alpha(settings?.primaryColor || '#A31D1D', 0.2)}`,
                transition: "all 0.3s ease",
                ...(deleteConfirmed && {
                  bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.12),
                  border: `2px solid ${settings?.primaryColor || '#A31D1D'}`,
                }),
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                    sx={{
                      color: settings?.primaryColor || '#A31D1D',
                      '&.Mui-checked': {
                        color: settings?.primaryColor || '#A31D1D',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 28,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: settings?.textPrimaryColor || '#6D2323',
                      fontSize: "1rem",
                      fontWeight: deleteConfirmed ? 600 : 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    I understand this action cannot be undone
                  </Typography>
                }
                sx={{
                  m: 0,
                  alignItems: "center",
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              p: 3,
              bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5),
              borderTop: `1px solid ${alpha(settings?.primaryColor || '#A31D1D', 0.1)}`,
              gap: 2,
            }}
          >
            <ProfessionalButton
              onClick={() => {
                setDeleteDialog(false);
                setDeleteConfirmed(false);
                setDeleteLogId(null);
              }}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: settings?.primaryColor || '#A31D1D',
                color: settings?.primaryColor || '#A31D1D',
                "&:hover": {
                  borderColor: settings?.secondaryColor || '#8a4747',
                  bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.05),
                },
              }}
            >
              Cancel
            </ProfessionalButton>
            <ProfessionalButton
              onClick={handleDeleteLog}
              variant="contained"
              fullWidth
              disabled={loading || !deleteConfirmed}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: "#ffffff" }} /> : <DeleteIcon />}
              sx={{
                bgcolor: deleteConfirmed
                  ? settings?.primaryColor || '#A31D1D'
                  : alpha(settings?.primaryColor || '#A31D1D', 0.3),
                color: "#ffffff",
                "&:hover": {
                  bgcolor: deleteConfirmed
                    ? settings?.secondaryColor || '#8a4747'
                    : alpha(settings?.primaryColor || '#A31D1D', 0.3),
                },
                "&:disabled": {
                  bgcolor: alpha(settings?.primaryColor || '#A31D1D', 0.2),
                  color: alpha("#ffffff", 0.5),
                },
              }}
            >
              {loading ? "Deleting..." : "Delete Log"}
            </ProfessionalButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AuditLogs