import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Modal,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  FormControl,
  Autocomplete,
  Select,
  MenuItem
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Domain as DomainIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfullOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from "react-router-dom";

// Auth header helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

const DepartmentAssignment = () => {
  const [data, setData] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    code: '',
    name: '',
    employeeNumber: '',
  });
  const [editAssignment, setEditAssignment] = useState(null);
  const [originalAssignment, setOriginalAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departmentCodes, setDepartmentCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");
  const [viewMode, setViewMode] = useState('grid');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const [hasAccess, setHasAccess] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 11; // Different page ID for department assignment
    if (!userId) {
      setHasAccess(false);
      return;
    }
    const checkAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/page_access/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const accessData = await response.json();
          const hasPageAccess = accessData.some(access => 
            access.page_id === pageId && String(access.page_privilege) === '1'
          );
          setHasAccess(hasPageAccess);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchDepartmentCodes();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/department-assignment`,
        getAuthHeaders()
      );
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching data', error);
      showSnackbar('Failed to fetch department assignments. Please try again.', 'error');
    }
  };

  const fetchDepartmentCodes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/department-table`,
        getAuthHeaders()
      );
      setDepartmentCodes(response.data.map((item) => item.code));
    } catch (error) {
      console.error('Error fetching department codes', error);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      // Filter out empty fields
      const filteredAssignment = Object.fromEntries(
        Object.entries(newAssignment).filter(([_, value]) => value !== '')
      );

      await axios.post(
        `${API_BASE_URL}/api/department-assignment`,
        filteredAssignment,
        getAuthHeaders()
      );
      setNewAssignment({
        code: '',
        name: '',
        employeeNumber: '',
      });
      setTimeout(() => {
        setLoading(false);
        setSuccessAction("adding");
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      fetchAssignments();
    } catch (error) {
      console.error('Error adding entry', error);
      setLoading(false);
      showSnackbar('Failed to add department assignment. Please try again.', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/department-assignment/${editAssignment.id}`,
        editAssignment,
        getAuthHeaders()
      );
      setEditAssignment(null);
      setOriginalAssignment(null);
      setIsEditing(false);
      fetchAssignments();
      setSuccessAction("edit");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error updating entry', error);
      showSnackbar('Failed to update department assignment. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/department-assignment/${id}`,
        getAuthHeaders()
      );
      setEditAssignment(null);
      setOriginalAssignment(null);
      setIsEditing(false);
      fetchAssignments();
      setSuccessAction("delete");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error deleting entry', error);
      showSnackbar('Failed to delete department assignment. Please try again.', 'error');
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditAssignment({ ...editAssignment, [field]: value });
    } else {
      setNewAssignment({ ...newAssignment, [field]: value });
    }
  };

  const handleOpenModal = (assignment) => {
    setEditAssignment({ ...assignment });
    setOriginalAssignment({ ...assignment });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditAssignment({ ...originalAssignment });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditAssignment(null);
    setOriginalAssignment(null);
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editAssignment || !originalAssignment) return false;
    
    return (
      editAssignment.code !== originalAssignment.code ||
      editAssignment.name !== originalAssignment.name ||
      editAssignment.employeeNumber !== originalAssignment.employeeNumber
    );
  };

  if (hasAccess === null) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: "#6d2323", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#6d2323" }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (!hasAccess) {
    return (
      <AccessDenied 
        title="Access Denied"
        message="You do not have permission to access Department Assignment. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredData = data.filter((assignment) => {
    const name = assignment.name?.toLowerCase() || '';
    const employeeNumber = assignment.employeeNumber?.toString() || '';
    const code = assignment.code || '';
    const search = searchTerm.toLowerCase();
    
    // Apply department filter if selected
    if (departmentFilter && code !== departmentFilter) {
      return false;
    }
    
    return employeeNumber.includes(search) || name.includes(search);
  });

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      pt: 2,
      mt: -5
    }}>
      <LoadingOverlay open={loading} message="Adding department assignment..." />
      <SuccessfullOverlay open={successOpen} action={successAction} />
      
      <Box sx={{ textAlign: 'center', mb: 3, px: 2 }}>
        <Typography variant="h4" sx={{ color: "#6D2323", fontWeight: 'bold', mb: 0.5 }}>
          Department Assignment Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          Assign employees to departments
        </Typography>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper 
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(109, 35, 35, 0.1)',
                height: { xs: 'auto', lg: 'calc(100vh - 200px)' },
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' }
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#ffffff",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <DomainIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Add New Assignment
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Fill in the assignment information
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                p: 3, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflowY: 'auto'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1.5, color: "#6D2323" }}>
                      Assignment Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Department Code
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={newAssignment.code}
                        onChange={(e) => handleChange('code', e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#6D2323',
                              borderWidth: '1.5px'
                            },
                            '&:hover fieldset': {
                              borderColor: '#6D2323',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6D2323',
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Department</MenuItem>
                        {departmentCodes.map((code, index) => (
                          <MenuItem key={index} value={code}>
                            {code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Employee Name
                    </Typography>
                    <TextField
                      value={newAssignment.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#6D2323',
                                borderWidth: '1.5px'
                              },
                              '&:hover fieldset': {
                                borderColor: '#6D2323',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6D2323',
                              },
                            },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Employee Number
                    </Typography>
                    <TextField
                      value={newAssignment.employeeNumber}
                      onChange={(e) => handleChange('employeeNumber', e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#6D2323',
                                borderWidth: '1.5px'
                              },
                              '&:hover fieldset': {
                                borderColor: '#6D2323',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6D2323',
                              },
                            },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    onClick={handleAdd}
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{
                      backgroundColor: "#6D2323",
                      color: "#FEF9E1",
                      py: 1.2,
                      fontWeight: 'bold',
                      "&:hover": { 
                        backgroundColor: "#5a1d1d",
                      },
                    }}
                  >
                    Add Assignment
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper 
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(109, 35, 35, 0.1)',
                height: { xs: 'auto', lg: 'calc(100vh - 200px)' },
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' }
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#ffffff",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ReorderIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Assignment Records
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      View and manage existing assignments
                    </Typography>
                  </Box>
                </Box>
                
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  aria-label="view mode"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiToggleButton-root': {
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      padding: '4px 8px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white'
                      },
                    }
                  }}
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <ViewModuleIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ 
                p: 3, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Search by Employee Number or Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#6D2323",
                          borderWidth: '1.5px'
                        },
                        "&:hover fieldset": {
                          borderColor: "#6D2323",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6D2323",
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: "#6D2323", mr: 1 }} />
                      ),
                    }}
                  />
                  
                  <FormControl sx={{ minWidth: 150 }}>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      displayEmpty
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          "& fieldset": {
                            borderColor: "#6D2323",
                            borderWidth: '1.5px'
                          },
                          "&:hover fieldset": {
                            borderColor: "#6D2323",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#6D2323",
                          },
                        },
                      }}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {departmentCodes.map((code, index) => (
                        <MenuItem key={index} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#6D2323',
                      borderRadius: '3px',
                    },
                  }}
                >
                  {viewMode === 'grid' ? (
                    <Grid container spacing={1.5}>
                      {filteredData.map((assignment) => (
                        <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                          <Card
                            onClick={() => handleOpenModal(assignment)}
                            sx={{
                              cursor: "pointer",
                              border: "1px solid #e0e0e0",
                              height: "100%",
                              display: 'flex',
                              flexDirection: 'column',
                              "&:hover": { 
                                borderColor: "#6d2323",
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                              },
                            }}
                          >
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PersonIcon sx={{ fontSize: 18, color: '#6d2323', mr: 0.5 }} />
                                <Typography variant="caption" sx={{ 
                                  color: '#666', 
                                  px: 0.5, 
                                  py: 0.2, 
                                  borderRadius: 0.5,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}>
                                  ID: {assignment.employeeNumber}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5} noWrap>
                                {assignment.name || 'No Name'}
                              </Typography>
                              
                              <Typography variant="body2" color="#666" mb={1} sx={{ flexGrow: 1 }}>
                                Department: {assignment.code || 'No Code'}
                              </Typography>
                              
                              {assignment.code && (
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 0.5,
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    alignSelf: 'flex-start'
                                  }}
                                >
                                  <Typography variant="caption" sx={{ 
                                    color: '#666',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                  }}>
                                    {assignment.code}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    filteredData.map((assignment) => (
                      <Card
                        key={assignment.id}
                        onClick={() => handleOpenModal(assignment)}
                        sx={{
                          cursor: "pointer",
                          border: "1px solid #e0e0e0",
                          mb: 1,
                          "&:hover": { 
                            borderColor: "#6d2323",
                            backgroundColor: '#fafafa'
                          },
                        }}
                      >
                        <Box sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={{ mr: 1.5, mt: 0.2 }}>
                              <PersonIcon sx={{ fontSize: 20, color: '#6d2323' }} />
                            </Box>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ 
                                  color: '#666',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  mr: 1
                                }}>
                                  ID: {assignment.employeeNumber}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="#333">
                                  {assignment.name || 'No Name'}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="#666" sx={{ mb: 0.5 }}>
                                Department: {assignment.code || 'No Code'}
                              </Typography>
                              
                              {assignment.code && (
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 0.5,
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd'
                                  }}
                                >
                                  <Typography variant="caption" sx={{ 
                                    color: '#666',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                  }}>
                                    {assignment.code}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  )}
                  
                  {filteredData.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body1" color="#555" fontWeight="bold">
                        No Records Found
                      </Typography>
                      <Typography variant="body2" color="#666" sx={{ mt: 0.5 }}>
                        Try adjusting your search criteria or department filter
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Modal
        open={!!editAssignment}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          {editAssignment && (
            <>
              {/* Modal Header */}
              <Box
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#ffffff",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {isEditing ? "Edit Department Assignment" : "Assignment Details"}
                </Typography>
                <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
                  <Close />
                </IconButton>
              </Box>

              {/* Modal Content with Scroll */}
              <Box sx={{ 
                p: 3, 
                flexGrow: 1, 
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 140px)', // Account for header and sticky footer
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#6D2323',
                  borderRadius: '3px',
                },
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1.5, color: "#6D2323" }}>
                      Assignment Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Department Code
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <Select
                          value={editAssignment.code || ''}
                          onChange={(e) => handleChange('code', e.target.value, true)}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: "#6D2323",
                              },
                              '&:hover fieldset': {
                                borderColor: "#6D2323",
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: "#6D2323",
                              },
                            },
                          }}
                        >
                          <MenuItem value="">Select Department</MenuItem>
                          {departmentCodes.map((code, index) => (
                            <MenuItem key={index} value={code}>
                              {code}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editAssignment.code || 'N/A'}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Employee Name
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editAssignment.name || ''}
                        onChange={(e) => handleChange('name', e.target.value, true)}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&:hover fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: "#6D2323",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editAssignment.name || 'N/A'}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Employee Number
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editAssignment.employeeNumber || ''}
                        onChange={(e) => handleChange('employeeNumber', e.target.value, true)}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&:hover fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: "#6D2323",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editAssignment.employeeNumber || 'N/A'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* Sticky Action Buttons */}
              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  borderTop: "1px solid #e0e0e0",
                  p: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 10,
                  boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {!isEditing ? (
                  <>
                    <Button
                      onClick={() => handleDelete(editAssignment.id)}
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      sx={{
                        color: "#d32f2f",
                        borderColor: "#d32f2f",
                        "&:hover": {
                          backgroundColor: "#d32f2f",
                          color: "#fff"
                        }
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={handleStartEdit}
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{ 
                        backgroundColor: "#6D2323", 
                        color: "#FEF9E1",
                        "&:hover": { backgroundColor: "#5a1d1d" }
                      }}
                    >
                      Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      sx={{
                        color: "#666",
                        borderColor: "#666",
                        "&:hover": {
                          backgroundColor: "#f5f5f5"
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={!hasChanges()}
                      sx={{ 
                        backgroundColor: hasChanges() ? "#6D2323" : "#ccc", 
                        color: "#FEF9E1",
                        "&:hover": { 
                          backgroundColor: hasChanges() ? "#5a1d1d" : "#ccc"
                        },
                        "&:disabled": {
                          backgroundColor: "#ccc",
                          color: "#999"
                        }
                      }}
                    >
                      Save
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentAssignment;