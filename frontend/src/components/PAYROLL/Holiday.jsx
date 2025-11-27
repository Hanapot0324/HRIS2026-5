import API_BASE_URL from "../../apiConfig";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Button, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Container, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Alert, Card, CardContent, CardHeader, Avatar,
  Fade, Backdrop, CircularProgress, Chip, Tooltip,
  IconButton, styled, alpha, Breadcrumbs, Link,
  Grid, InputAdornment, FormHelperText, Paper,
  FormControl, InputLabel, Select,
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Save as SaveIcon, Cancel as CancelIcon, Cancel,
  Event as EventIcon, Reorder as ReorderIcon,
  Search as SearchIcon, Close as CloseIcon, Home,
  FilterList, Refresh, CheckCircle, Error, Info, Warning
} from "@mui/icons-material";
import usePageAccess from '../../hooks/usePageAccess';
import AccessDenied from '../AccessDenied';

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

// System Settings Hook (same as UsersList)
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

const Holiday = () => {
  const [data, setData] = useState([]);
  const [newHoliday, setNewHoliday] = useState({
    description: "",
    date: "",
    status: "Active",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [openEditModal, setOpenEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemDescription, setDeleteItemDescription] = useState("");

  const statusOptions = ["Active", "Inactive"];

  // Use system settings
  const settings = useSystemSettings();

  //ACCESSING
  // Dynamic page access control using component identifier
  // The identifier 'holiday' should match the component_identifier in the pages table
  const {
    hasAccess,
    loading: accessLoading,
    error: accessError,
  } = usePageAccess('holiday');
  // ACCESSING END
  
  // Memoize styled components to prevent recreation on every render
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

  const PremiumTableContainer = useMemo(() => styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: `0 4px 24px ${settings?.primaryColor || '#894444'}0F`,
    border: `1px solid ${settings?.primaryColor || '#894444'}14`,
    background: "rgba(255, 255, 255, 0.9)",
    width: "100%",
  })), [settings]);

  const PremiumTableCell = useMemo(() => styled(TableCell)(({ theme, isHeader = false }) => ({
    fontWeight: isHeader ? 600 : 500,
    padding: "18px 20px",
    borderBottom: isHeader
      ? `2px solid ${settings?.primaryColor || '#894444'}4D`
      : `1px solid ${settings?.primaryColor || '#894444'}0F`,
    fontSize: "0.95rem",
    letterSpacing: "0.025em",
  })), [settings]);

  const filteredData = data.filter(
    (item) =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchHoliday();
  }, []);

  const fetchHoliday = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await axios.get(`${API_BASE_URL}/holiday`, getAuthHeaders());
      setData(response.data);
      
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
        
        if (refreshing && data.length > 0) {
          setSuccessMessage('Holiday records refreshed successfully');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      }, 1000);
    } catch (err) {
      console.error("Error fetching holiday data", err.message);
      setLoading(false);
      setRefreshing(false);
      setError("Failed to fetch holiday data");
    }
  };

  const handleNewChange = (e) => {
    setNewHoliday({ ...newHoliday, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setLoading(true);
      
      if (!newHoliday.description || !newHoliday.date || !newHoliday.status) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      await axios.post(`${API_BASE_URL}/holiday`, newHoliday, getAuthHeaders());
      fetchHoliday();
      setNewHoliday({ description: "", date: "", status: "Active" });
      setSuccessMessage("Holiday added successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (error) {
      console.error("Error adding holiday data", error);
      setError("Failed to add holiday");
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      description: item.description,
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      status: item.status,
    });
    setOpenEditModal(true);
    setError("");
  };

  const handleSaveEdit = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setLoading(true);
      
      await axios.put(`${API_BASE_URL}/holiday/${editingId}`, editForm, getAuthHeaders());
      setOpenEditModal(false);
      setEditingId(null);
      fetchHoliday();
      setSuccessMessage("Holiday updated successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (error) {
      console.error("Error updating holiday record", error);
      setError("Failed to update record");
      setLoading(false);
    }
  };

  const handleDelete = (id, description) => {
    setDeleteItemId(id);
    setDeleteItemDescription(description);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/holiday/${deleteItemId}`, getAuthHeaders());
      fetchHoliday();
      setSuccessMessage("Holiday deleted successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeleteItemId(null);
      setDeleteItemDescription("");
    } catch (error) {
      console.error("Error deleting holiday record", error);
      setError("Failed to delete record");
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteItemId(null);
    setDeleteItemDescription("");
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          sx: { bgcolor: alpha(settings?.primaryColor || '#894444', 0.15), color: settings?.primaryColor || '#894444' },
          icon: <CheckCircle />,
        };
      case 'inactive':
        return {
          sx: { bgcolor: alpha(settings?.secondaryColor || '#6d2323', 0.15), color: settings?.secondaryColor || '#6d2323' },
          icon: <Cancel />,
        };
      default:
        return {
          sx: { bgcolor: alpha(settings?.primaryColor || '#894444', 0.15), color: settings?.primaryColor || '#894444' },
          icon: <Info />,
        };
    }
  };

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
  if (!accessLoading && hasAccess !== true) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have permission to access Holiday Management. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }
  //ACCESSING END2

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
                  color: settings?.primaryColor || '#894444',
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
                    background: `radial-gradient(circle, ${alpha(settings?.primaryColor || '#894444', 0.1)} 0%, ${alpha(settings?.primaryColor || '#894444', 0)} 70%)`,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -30,
                    left: "30%",
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${alpha(settings?.primaryColor || '#894444', 0.08)} 0%, ${alpha(settings?.primaryColor || '#894444', 0)} 70%)`,
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
                        bgcolor: alpha(settings?.primaryColor || '#894444', 0.15),
                        mr: 4,
                        width: 64,
                        height: 64,
                        boxShadow: `0 8px 24px ${alpha(settings?.primaryColor || '#894444', 0.15)}`,
                      }}
                    >
                      <EventIcon sx={{ fontSize: 32, color: settings?.primaryColor || '#894444' }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          lineHeight: 1.2,
                          color: settings?.primaryColor || '#894444',
                        }}
                      >
                        Holiday Management
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.8,
                          fontWeight: 400,
                          color: settings?.textPrimaryColor || '#6D2323',
                        }}
                      >
                        Manage and track official holidays each year
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={`${data.length} Holidays`}
                      size="small"
                      sx={{
                        bgcolor: alpha(settings?.primaryColor || '#894444', 0.15),
                        color: settings?.primaryColor || '#894444',
                        fontWeight: 500,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    <Tooltip title="Refresh Holidays">
                      <IconButton
                        onClick={fetchHoliday}
                        disabled={loading}
                        sx={{
                          bgcolor: alpha(settings?.primaryColor || '#894444', 0.1),
                          "&:hover": { bgcolor: alpha(settings?.primaryColor || '#894444', 0.2) },
                          color: settings?.primaryColor || '#894444',
                          width: 48,
                          height: 48,
                          "&:disabled": {
                            bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                            color: alpha(settings?.primaryColor || '#894444', 0.3),
                          },
                        }}
                      >
                        {loading ? (
                          <CircularProgress
                            size={24}
                            sx={{ color: settings?.primaryColor || '#894444' }}
                          />
                        ) : (
                          <Refresh />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Success Message - Center Modal Overlay */}
        {successMessage && (
          <Backdrop
            open={true}
            sx={{
              zIndex: 9999,
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={() => setSuccessMessage("")}
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
                  icon={<CheckCircle />}
                  onClose={() => setSuccessMessage("")}
                >
                  {successMessage}
                </Alert>
              </Box>
            </Fade>
          </Backdrop>
        )}

        {/* Error Alert - Center Modal Overlay */}
        {error && (
          <Backdrop
            open={true}
            sx={{
              zIndex: 9999,
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={() => setError("")}
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
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </Box>
            </Fade>
          </Backdrop>
        )}

        {/* Add Form */}
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
                    <AddIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                    >
                      Add New Holiday
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                    >
                      Create a new holiday record
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{
                bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5),
                pb: 2,
                borderBottom: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.1)}`,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ModernTextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={newHoliday.description}
                    onChange={handleNewChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <ModernTextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    value={newHoliday.date}
                    onChange={handleNewChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel
                      sx={{
                        fontWeight: 500,
                        color: settings?.textPrimaryColor || '#6D2323',
                        "&.Mui-focused": { color: settings?.primaryColor || '#894444' },
                      }}
                    >
                      Status
                    </InputLabel>
                    <Select
                      name="status"
                      value={newHoliday.status}
                      onChange={handleNewChange}
                      label="Status"
                      sx={{
                        borderRadius: 3,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                        },
                        "&.Mui-focused": {
                          boxShadow: `0 4px 20px ${settings?.primaryColor || '#894444'}40`,
                          backgroundColor: "rgba(255, 255, 255, 1)",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(settings?.primaryColor || '#894444', 0.3),
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(settings?.primaryColor || '#894444', 0.5),
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: settings?.primaryColor || '#894444',
                        },
                      }}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <ProfessionalButton
                    onClick={handleAdd}
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={loading}
                    fullWidth
                    sx={{
                      bgcolor: settings?.primaryColor || '#894444',
                      color: settings?.accentColor || '#FEF9E1',
                      "&:hover": { bgcolor: settings?.secondaryColor || '#6d2323' },
                    }}
                  >
                    {loading ? 'Adding...' : 'Add Holiday'}
                  </ProfessionalButton>
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
              Processing holiday...
            </Typography>
          </Box>
        </Backdrop>

        {/* Holiday Table */}
        {!loading && (
          <Fade in timeout={900}>
            <GlassCard>
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${settings?.accentColor || '#FEF9E1'} 0%, ${alpha(settings?.accentColor || '#FEF9E1', 0.9)} 100%)`,
                  color: settings?.primaryColor || '#894444',
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.1)}`,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: settings?.primaryColor || '#894444' }}
                  >
                    Holiday Records
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.8, color: settings?.accentColor || '#FEF9E1' }}
                  >
                    {searchQuery
                      ? `Showing ${filteredData.length} of ${data.length} holidays matching "${searchQuery}"`
                      : `Total: ${data.length} holidays`}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ModernTextField
                    size="small"
                    variant="outlined"
                    placeholder="Search by Holiday"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: "300px" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: settings?.primaryColor || '#894444' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ width: "100%" }}>
                <PremiumTableContainer elevation={0}>
                  <Table sx={{ minWidth: 800, width: "100%" }}>
                    <TableHead sx={{ bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.7) }}>
                      <TableRow>
                        <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323', width: "10%" }}>
                          No.
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323', width: "35%" }}>
                          Description
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323', width: "20%" }}>
                          Date
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323', width: "15%" }}>
                          Status
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323', width: "20%", textAlign: "center" }}>
                          Actions
                        </PremiumTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            sx={{ textAlign: "center", py: 8 }}
                          >
                            <Box sx={{ textAlign: "center" }}>
                              <Info
                                sx={{
                                  fontSize: 80,
                                  color: alpha(settings?.primaryColor || '#894444', 0.3),
                                  mb: 3,
                                }}
                              />
                              <Typography
                                variant="h5"
                                color={alpha(settings?.primaryColor || '#894444', 0.6)}
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                No Holidays Found
                              </Typography>
                              <Typography
                                variant="body1"
                                color={alpha(settings?.primaryColor || '#894444', 0.4)}
                              >
                                {searchQuery
                                  ? "Try adjusting your search criteria"
                                  : "No holidays available"}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((item, index) => (
                          <TableRow
                            key={item.id}
                            sx={{
                              "&:nth-of-type(even)": {
                                bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.3),
                              },
                              "&:hover": { bgcolor: alpha(settings?.primaryColor || '#894444', 0.05) },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <PremiumTableCell sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323', width: "10%" }}>
                              {index + 1}
                            </PremiumTableCell>
                            <PremiumTableCell sx={{ color: settings?.textPrimaryColor || '#6D2323', width: "35%" }}>
                              {item.description}
                            </PremiumTableCell>
                            <PremiumTableCell sx={{ color: settings?.textPrimaryColor || '#6D2323', width: "20%" }}>
                              {formatDateForDisplay(item.date)}
                            </PremiumTableCell>
                            <PremiumTableCell sx={{ width: "15%" }}>
                              <Chip
                                label={item.status}
                                size="small"
                                icon={getStatusColor(item.status).icon}
                                sx={{
                                  ...getStatusColor(item.status).sx,
                                  fontWeight: 600,
                                  padding: "4px 8px",
                                }}
                              />
                            </PremiumTableCell>
                            <PremiumTableCell sx={{ textAlign: "center", width: "20%" }}>
                              <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                                <Tooltip title="Edit Holiday">
                                  <ProfessionalButton
                                    onClick={() => handleEdit(item)}
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    sx={{
                                      bgcolor: settings?.primaryColor || '#894444',
                                      color: settings?.accentColor || '#FEF9E1',
                                      "&:hover": { bgcolor: settings?.secondaryColor || '#6d2323' },
                                    }}
                                  >
                                    Edit
                                  </ProfessionalButton>
                                </Tooltip>
                                <Tooltip title="Delete Holiday">
                                  <ProfessionalButton
                                    onClick={() => handleDelete(item.id, item.description)}
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                    sx={{
                                      bgcolor: "#000000",
                                      color: "#ffffff",
                                      "&:hover": { bgcolor: "#333333" },
                                    }}
                                  >
                                    Delete
                                  </ProfessionalButton>
                                </Tooltip>
                              </Box>
                            </PremiumTableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </PremiumTableContainer>
              </Box>
            </GlassCard>
          </Fade>
        )}

        {/* Edit Modal */}
        <Dialog
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: settings?.accentColor || '#FEF9E1',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${settings?.primaryColor || '#894444'} 0%, ${settings?.secondaryColor || '#6d2323'} 100%)`,
              color: settings?.accentColor || '#FEF9E1',
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 3,
              fontWeight: 700,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EditIcon sx={{ fontSize: 30 }} />
              Edit Holiday
            </Box>
            <IconButton onClick={() => setOpenEditModal(false)} sx={{ color: settings?.accentColor || '#FEF9E1' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ModernTextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  sx={{ marginTop: 5}}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={editForm.date || ""}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      fontWeight: 500,
                      color: settings?.textPrimaryColor || '#6D2323',
                      "&.Mui-focused": { color: settings?.primaryColor || '#894444' },
                    }}
                  >
                    Status
                  </InputLabel>
                  <Select
                    name="status"
                    value={editForm.status || ""}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    label="Status"
                    sx={{
                      borderRadius: 3,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                      },
                      "&.Mui-focused": {
                        boxShadow: `0 4px 20px ${settings?.primaryColor || '#894444'}40`,
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(settings?.primaryColor || '#894444', 0.3),
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(settings?.primaryColor || '#894444', 0.5),
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: settings?.primaryColor || '#894444',
                      },
                    }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5) }}>
            <ProfessionalButton
              onClick={handleSaveEdit}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{
                bgcolor: settings?.primaryColor || '#894444',
                color: settings?.accentColor || '#FEF9E1',
                "&:hover": { bgcolor: settings?.secondaryColor || '#6d2323' },
              }}
            >
              {loading ? 'Saving...' : 'Save'}
            </ProfessionalButton>
            <ProfessionalButton
              onClick={() => setOpenEditModal(false)}
              variant="outlined"
              startIcon={<CancelIcon />}
              sx={{
                borderColor: settings?.primaryColor || '#894444',
                color: settings?.primaryColor || '#894444',
                "&:hover": {
                  borderColor: settings?.secondaryColor || '#6d2323',
                  bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                },
              }}
            >
              Cancel
            </ProfessionalButton>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDelete}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: settings?.accentColor || '#FEF9E1',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${settings?.primaryColor || '#894444'} 0%, ${settings?.secondaryColor || '#6d2323'} 100%)`,
              color: settings?.accentColor || '#FEF9E1',
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              fontWeight: 700,
            }}
          >
            <Warning sx={{ fontSize: 30 }} />
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Typography sx={{ color: settings?.textPrimaryColor || '#6D2323', fontSize: "1.1rem", mt: 3 }}>
              Are you sure you want to delete this holiday?
            </Typography>
            {deleteItemDescription && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: alpha(settings?.primaryColor || '#894444', 0.1), 
                borderRadius: 2,
                border: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.2)}`
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}>
                  {deleteItemDescription}
                </Typography>
              </Box>
            )}
            <Typography sx={{ color: settings?.textPrimaryColor || '#6D2323', mt: 2, fontSize: "0.9rem" }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5) }}>
            <ProfessionalButton
              onClick={cancelDelete}
              variant="outlined"
              startIcon={<CancelIcon />}
              sx={{
                borderColor: settings?.primaryColor || '#894444',
                color: settings?.primaryColor || '#894444',
                "&:hover": {
                  borderColor: settings?.secondaryColor || '#6d2323',
                  bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                },
              }}
            >
              Cancel
            </ProfessionalButton>
            <ProfessionalButton
              onClick={confirmDelete}
              variant="contained"
              startIcon={<DeleteIcon />}
              disabled={loading}
              sx={{
                bgcolor: "#000000",
                color: "#ffffff",
                "&:hover": { bgcolor: "#333333" },
              }}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </ProfessionalButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Holiday;