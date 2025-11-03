import API_BASE_URL from "../../apiConfig";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Button, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Container, Box, Paper, Grid,
  Typography, IconButton, Modal, CircularProgress, Snackbar,
  Alert, ToggleButton, ToggleButtonGroup, Card, CardContent,
  List, ListItem, ListItemText, ListItemIcon
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Save as SaveIcon, Cancel as CancelIcon,
  Domain, Search as SearchIcon, ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon, Close
} from '@mui/icons-material';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfullOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from 'react-router-dom';

const DepartmentTable = () => {
  const [data, setData] = useState([]);
  const [newEntry, setNewEntry] = useState({
    code: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalDepartment, setOriginalDepartment] = useState(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [hasAccess, setHasAccess] = useState(null);
  const navigate = useNavigate();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

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

  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 9; // Assuming a different page ID for departments
    if (!userId) {
      setHasAccess(false);
      return;
    }
    const checkAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/page_access/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const accessData = await response.json();
          const hasPageAccess = accessData.some(
            (access) =>
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/department-table`, getAuthHeaders());
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching data", error);
      showSnackbar('Failed to fetch department data. Please try again.', 'error');
    }
  };

  const addEntry = async () => {
    if (!newEntry.code || !newEntry.description) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/department-table`, newEntry, getAuthHeaders());
      setNewEntry({ code: "", description: "" });
      fetchData();
      setTimeout(() => {
        setLoading(false);
        setSuccessAction('adding');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
    } catch (error) {
      console.error("Error adding entry", error);
      setLoading(false);
      showSnackbar('Failed to add department. Please try again.', 'error');
    }
  };

  const startEditing = (item) => {
    setSelectedDepartment(item);
    setOriginalDepartment({ ...item });
    setEditData({
      code: item.code,
      description: item.description,
    });
    setModalOpen(true);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedDepartment({ ...originalDepartment });
    setEditData({
      code: originalDepartment.code,
      description: originalDepartment.description,
    });
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/department-table/${selectedDepartment.id}`, editData, getAuthHeaders());
      setModalOpen(false);
      setSelectedDepartment(null);
      setOriginalDepartment(null);
      setIsEditing(false);
      fetchData();
      setSuccessAction('edit');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error("Error saving edit", error);
      showSnackbar('Failed to update department. Please try again.', 'error');
    }
  };

  const deleteEntry = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/department-table/${id}`, getAuthHeaders());
      setModalOpen(false);
      setSelectedDepartment(null);
      setOriginalDepartment(null);
      setIsEditing(false);
      fetchData();
      setSuccessAction('delete');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error("Error deleting entry", error);
      showSnackbar('Failed to delete department. Please try again.', 'error');
    }
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!selectedDepartment || !originalDepartment) return false;
    return (
      editData.code !== originalDepartment.code ||
      editData.description !== originalDepartment.description
    );
  };

  const filteredData = data.filter((department) => {
    const code = department.code?.toLowerCase() || '';
    const description = department.description?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return code.includes(search) || description.includes(search);
  });

  if (hasAccess === null) {
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

  if (!hasAccess) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have permission to access Department Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        mt: -5,
      }}
    >
      <LoadingOverlay open={loading} message="Adding department record..." />
      <SuccessfullOverlay open={successOpen} action={successAction} />

      <Box sx={{ textAlign: 'center', mb: 3, px: 2 }}>
        <Typography
          variant="h4"
          sx={{ color: '#6D2323', fontWeight: 'bold', mb: 0.5 }}
        >
          Department Information Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Add and manage department records
        </Typography>
      </Box>

      <Container
        maxWidth="xl"
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          <Grid
            item
            xs={12}
            lg={6}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
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
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' },
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#6D2323',
                  color: '#ffffff',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Domain sx={{ fontSize: '1.8rem', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Add New Department
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Fill in the department information
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 1.5, color: '#6D2323' }}
                    >
                      Department Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 'bold',
                        mb: 0.5,
                        color: '#333',
                        display: 'block',
                      }}
                    >
                      Department Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      value={newEntry.code}
                      onChange={(e) => setNewEntry({ ...newEntry, code: e.target.value })}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#6D2323',
                            borderWidth: '1.5px',
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
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 'bold',
                        mb: 0.5,
                        color: '#333',
                        display: 'block',
                      }}
                    >
                      Department Description <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#6D2323',
                            borderWidth: '1.5px',
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
                    onClick={addEntry}
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{
                      backgroundColor: '#6D2323',
                      color: '#FEF9E1',
                      py: 1.2,
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#5a1d1d',
                      },
                    }}
                  >
                    Add Department
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid
            item
            xs={12}
            lg={6}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
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
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' },
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#6D2323',
                  color: '#ffffff',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Domain sx={{ fontSize: '1.8rem', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Department Records
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      View and manage existing records
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
                        color: 'white',
                      },
                    },
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

              <Box
                sx={{
                  p: 3,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Search by Code or Description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#6D2323',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#6D2323',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6D2323',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: '#6D2323', mr: 1 }} />
                      ),
                    }}
                  />
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
                      {filteredData.map((department) => (
                        <Grid item xs={12} sm={6} md={4} key={department.id}>
                          <Card
                            onClick={() => startEditing(department)}
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
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                              },
                            }}
                          >
                            <CardContent
                              sx={{
                                p: 1.5,
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 1,
                                }}
                              >
                                <Domain
                                  sx={{
                                    fontSize: 18,
                                    color: '#6d2323',
                                    mr: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#666',
                                    px: 0.5,
                                    py: 0.2,
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  ID: {department.id}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="#333"
                                mb={0.5}
                                noWrap
                              >
                                {department.code}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="#666"
                                sx={{ flexGrow: 1 }}
                              >
                                {department.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    filteredData.map((department) => (
                      <Card
                        key={department.id}
                        onClick={() => startEditing(department)}
                        sx={{
                          cursor: "pointer",
                          border: "1px solid #e0e0e0",
                          mb: 1,
                          "&:hover": {
                            borderColor: "#6d2323",
                            backgroundColor: '#fafafa',
                          },
                        }}
                      >
                        <Box sx={{ p: 1.5 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Box sx={{ mr: 1.5, mt: 0.2 }}>
                              <Domain
                                sx={{ fontSize: 20, color: '#6d2323' }}
                              />
                            </Box>

                            <Box sx={{ flexGrow: 1 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#666',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    mr: 1,
                                  }}
                                >
                                  ID: {department.id}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="#333"
                                >
                                  {department.code}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                color="#666"
                                sx={{ mb: 0.5 }}
                              >
                                {department.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  )}

                  {filteredData.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography
                        variant="body1"
                        color="#555"
                        fontWeight="bold"
                      >
                        No Records Found
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#666"
                        sx={{ mt: 0.5 }}
                      >
                        Try adjusting your search criteria
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
          {selectedDepartment && (
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
                  {isEditing
                    ? "Edit Department Information"
                    : "Department Details"}
                </Typography>
                <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#fff" }}>
                  <Close />
                </IconButton>
              </Box>

              {/* Modal Content with Scroll */}
              <Box
                sx={{
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
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", mb: 1.5, color: "#6D2323" }}
                    >
                      Department Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        mb: 0.5,
                        color: "#333",
                        display: 'block',
                      }}
                    >
                      Department Code
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editData.code}
                        onChange={(e) => handleChange('code', e.target.value)}
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
                      <Typography
                        variant="body2"
                        sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}
                      >
                        {selectedDepartment.code}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        mb: 0.5,
                        color: "#333",
                        display: 'block',
                      }}
                    >
                      Department Description
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
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
                      <Typography
                        variant="body2"
                        sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}
                      >
                        {selectedDepartment.description}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

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
                        onClick={() => deleteEntry(selectedDepartment.id)}
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        sx={{
                          color: "#d32f2f",
                          borderColor: "#d32f2f",
                          "&:hover": {
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                          },
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
                          "&:hover": { backgroundColor: "#5a1d1d" },
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
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveEdit}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!hasChanges()}
                        sx={{
                          backgroundColor: hasChanges() ? "#6D2323" : "#ccc",
                          color: "#FEF9E1",
                          "&:hover": {
                            backgroundColor: hasChanges() ? "#5a1d1d" : "#ccc",
                          },
                          "&:disabled": {
                            backgroundColor: "#ccc",
                            color: "#999",
                          },
                        }}
                      >
                        Save
                      </Button>
                    </>
                  )}
                </Box>
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

export default DepartmentTable;