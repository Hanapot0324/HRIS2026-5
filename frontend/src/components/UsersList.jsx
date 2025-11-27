import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../utils/auth";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Switch,
  Avatar,
  MenuItem,
  Divider,
  LinearProgress,
  Badge,
  Fab,
  Drawer,
  useTheme,
  useMediaQuery,
  CardHeader,
  Stack,
  Fade,
  Backdrop,
  styled,
  alpha,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  People,
  Search,
  PersonAdd,
  GroupAdd,
  Email,
  Badge as BadgeIcon,
  Person,
  Visibility,
  Refresh,
  AccountCircle,
  Business,
  Security,
  Close,
  Pages,
  Settings,
  FilterList,
  Lock,
  LockOpen,
  AdminPanelSettings,
  SupervisorAccount,
  Work,
  MoreVert,
  CheckCircle,
  Cancel,
  Info,
  AssignmentInd,
  ContactMail,
  AccessTime,
  Key,
  VerifiedUser,
  Star,
  TrendingUp,
  Shield,
  LockPerson,
  PersonPin,
  Home,
  Assessment,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

// System Settings Hook (from AdminHome)
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
        
        const response = await axios.get(url);
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

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  // Page Access Management States
  const [pageAccessDialog, setPageAccessDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageAccess, setPageAccess] = useState({});
  const [pageAccessLoading, setPageAccessLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [accessChangeInProgress, setAccessChangeInProgress] = useState({});

  // Additional UI States
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [animatedValue, setAnimatedValue] = useState(0);
  const [roleChangeDialog, setRoleChangeDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Use system settings
  const settings = useSystemSettings();
  
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

  const PremiumTableContainer = useMemo(() => styled(TableContainer)(({ theme }) => ({
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: `0 4px 24px ${settings?.primaryColor || '#894444'}0F`,
    border: `1px solid ${settings?.primaryColor || '#894444'}14`,
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

  const fetchUsers = async () => {
    setLoading(true);
    setRefreshing(true);
    setError("");

    try {
      const authHeaders = getAuthHeaders();
      const [usersResp, personsResp] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, {
          method: "GET",
          ...authHeaders,
        }),
        fetch(`${API_BASE_URL}/personalinfo/person_table`, {
          method: "GET",
          ...authHeaders,
        }),
      ]);

      if (!usersResp.ok) {
        const err = await usersResp.json().catch(() => ({}));
        setError(err.error || "Failed to fetch users");
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const usersDataRaw = await usersResp.json();
      const personsDataRaw = await personsResp.json().catch(() => []);

      const usersArray = Array.isArray(usersDataRaw)
        ? usersDataRaw
        : usersDataRaw.users || usersDataRaw.data || [];
      const personsArray = Array.isArray(personsDataRaw)
        ? personsDataRaw
        : personsDataRaw.persons || personsDataRaw.data || [];

      const mergedUsers = (usersArray || []).map((user) => {
        const person = (personsArray || []).find(
          (p) => String(p.agencyEmployeeNum) === String(user.employeeNumber)
        );

        const fullName = person
          ? `${person.firstName || ""} ${person.middleName || ""} ${
              person.lastName || ""
            } ${person.nameExtension || ""}`.trim()
          : user.fullName ||
            user.username ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim();

        const avatar = person?.profile_picture
          ? `${API_BASE_URL}${person.profile_picture}`
          : user.avatar
          ? String(user.avatar).startsWith("http")
            ? user.avatar
            : `${API_BASE_URL}${user.avatar}`
          : null;

        return {
          ...user,
          fullName: fullName || "Username",
          avatar: avatar || null,
          personData: person || {},
        };
      });

      setUsers(mergedUsers);
      setFilteredUsers(mergedUsers);

      if (refreshing) {
        setSuccessMessage("Users list refreshed successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Something went wrong while fetching users");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserPageAccess = async (user) => {
    try {
      const authHeaders = getAuthHeaders();
      const accessResponse = await fetch(
        `${API_BASE_URL}/page_access/${user.employeeNumber}`,
        {
          method: "GET",
          ...authHeaders,
        }
      );

      if (accessResponse.ok) {
        const accessDataRaw = await accessResponse.json();
        const accessData = Array.isArray(accessDataRaw)
          ? accessDataRaw
          : accessDataRaw.data || [];
        const accessMap = (accessData || []).reduce((acc, curr) => {
          // Check if page_privilege indicates any level of access (not "0" or empty)
          // Privileges like "1", "12", "2", etc. all indicate access
          const privilege = String(curr.page_privilege || "0");
          acc[curr.page_id] = privilege !== "0" && privilege !== "";
          return acc;
        }, {});

        const authHeaders = getAuthHeaders();
        const pagesResponse = await fetch(`${API_BASE_URL}/pages`, {
          method: "GET",
          ...authHeaders,
        });

        if (pagesResponse.ok) {
          let pagesData = await pagesResponse.json();
          pagesData = Array.isArray(pagesData)
            ? pagesData
            : pagesData.pages || pagesData.data || [];
          pagesData = (pagesData || []).sort(
            (a, b) => (a.id || 0) - (b.id || 0)
          );

          const accessiblePages = pagesData.filter(
            (page) => accessMap[page.id] === true
          );

          setSelectedUserForDetails((prev) => ({
            ...prev,
            accessiblePages: accessiblePages,
            totalPages: pagesData.length,
            hasAccess: accessiblePages.length > 0,
          }));

          const percentage =
            pagesData.length > 0
              ? (accessiblePages.length / pagesData.length) * 100
              : 0;
          let current = 0;
          const increment = percentage / 20;
          const timer = setInterval(() => {
            current += increment;
            if (current >= percentage) {
              current = percentage;
              clearInterval(timer);
            }
            setAnimatedValue(current);
          }, 50);
        }
      }
    } catch (err) {
      console.error("Error fetching user page access:", err);
    }
  };

  const handlePageAccessClick = async (user) => {
    setSelectedUser(user);
    setPageAccessLoading(true);
    setPageAccessDialog(true);

    try {
      const authHeaders = getAuthHeaders();
      const pagesResponse = await fetch(`${API_BASE_URL}/pages`, {
        method: "GET",
        ...authHeaders,
      });

      if (pagesResponse.ok) {
        let pagesData = await pagesResponse.json();
        pagesData = Array.isArray(pagesData)
          ? pagesData
          : pagesData.pages || pagesData.data || [];
        pagesData = (pagesData || []).sort((a, b) => (a.id || 0) - (b.id || 0));
        setPages(pagesData);

        const accessResponse = await fetch(
          `${API_BASE_URL}/page_access/${user.employeeNumber}`,
          {
            method: "GET",
            ...authHeaders,
          }
        );

        if (accessResponse.ok) {
          const accessDataRaw = await accessResponse.json();
          const accessData = Array.isArray(accessDataRaw)
            ? accessDataRaw
            : accessDataRaw.data || [];
          const accessMap = (accessData || []).reduce((acc, curr) => {
            // Check if page_privilege indicates any level of access (not "0" or empty)
            // Privileges like "1", "12", "2", etc. all indicate access
            const privilege = String(curr.page_privilege || "0");
            acc[curr.page_id] = privilege !== "0" && privilege !== "";
            return acc;
          }, {});
          setPageAccess(accessMap);
        } else {
          setPageAccess({});
        }
      } else {
        setPages([]);
      }
    } catch (err) {
      console.error("Error fetching page access data:", err);
      setError("Failed to load page access data");
    } finally {
      setPageAccessLoading(false);
    }
  };

  const handleTogglePageAccess = async (pageId, currentAccess) => {
    const newAccess = !currentAccess;
    setAccessChangeInProgress((prev) => ({ ...prev, [pageId]: true }));

    try {
      const authHeaders = getAuthHeaders();
      if (currentAccess === false) {
        const existingAccessResponse = await fetch(
          `${API_BASE_URL}/page_access/${selectedUser.employeeNumber}`,
          {
            method: "GET",
            ...authHeaders,
          }
        );

        if (existingAccessResponse.ok) {
          const existingAccess = await existingAccessResponse.json();
          const existingRecord = (existingAccess || []).find(
            (access) => access.page_id === pageId
          );

          if (!existingRecord) {
            const createResponse = await fetch(`${API_BASE_URL}/page_access`, {
              method: "POST",
              ...authHeaders,
              body: JSON.stringify({
                employeeNumber: selectedUser.employeeNumber,
                page_id: pageId,
                page_privilege: newAccess ? "1" : "0",
              }),
            });

            if (!createResponse.ok) {
              const errorData = await createResponse.json().catch(() => ({}));
              setError(
                `Failed to create page access: ${
                  errorData.error || "Unknown error"
                }`
              );
              setAccessChangeInProgress((prev) => ({
                ...prev,
                [pageId]: false,
              }));
              return;
            }
          } else {
            const updateResponse = await fetch(
              `${API_BASE_URL}/page_access/${selectedUser.employeeNumber}/${pageId}`,
              {
                method: "PUT",
                ...authHeaders,
                body: JSON.stringify({
                  page_privilege: newAccess ? "1" : "0",
                }),
              }
            );

            if (!updateResponse.ok) {
              const errorData = await updateResponse.json().catch(() => ({}));
              setError(
                `Failed to update page access: ${
                  errorData.error || "Unknown error"
                }`
              );
              setAccessChangeInProgress((prev) => ({
                ...prev,
                [pageId]: false,
              }));
              return;
            }
          }
        }
      } else {
        const updateResponse = await fetch(
          `${API_BASE_URL}/page_access/${selectedUser.employeeNumber}/${pageId}`,
          {
            method: "PUT",
            ...authHeaders,
            body: JSON.stringify({
              page_privilege: newAccess ? "1" : "0",
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json().catch(() => ({}));
          setError(
            `Failed to update page access: ${
              errorData.error || "Unknown error"
            }`
          );
          setAccessChangeInProgress((prev) => ({ ...prev, [pageId]: false }));
          return;
        }
      }

      setPageAccess((prevAccess) => ({
        ...prevAccess,
        [pageId]: newAccess,
      }));
    } catch (err) {
      console.error("Error updating page access:", err);
      setError("Network error occurred while updating page access");
    } finally {
      setAccessChangeInProgress((prev) => ({ ...prev, [pageId]: false }));
    }
  };

  const closePageAccessDialog = () => {
    setPageAccessDialog(false);
    setSelectedUser(null);
    setPages([]);
    setPageAccess({});
  };

  const openUserDetails = (user) => {
    setSelectedUserForDetails(user);
    setDetailsDrawerOpen(true);
    setAnimatedValue(0);
    fetchUserPageAccess(user);
  };

  const closeUserDetails = () => {
    setDetailsDrawerOpen(false);
    setSelectedUserForDetails(null);
    setActiveTab("info");
    setAnimatedValue(0);
  };

  const handleRoleChange = (user, newRole) => {
    if (user.role === newRole) return;
    
    setPendingRoleChange({
      user,
      oldRole: user.role,
      newRole: newRole,
    });
    setRoleChangeDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;

    setRoleChangeLoading(true);
    try {
      const authHeaders = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/users/${pendingRoleChange.user.employeeNumber}/role`,
        {
          method: "PUT",
          ...authHeaders,
          body: JSON.stringify({ role: pendingRoleChange.newRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.error || "Failed to update user role"
        );
        setRoleChangeDialog(false);
        setPendingRoleChange(null);
        setRoleChangeLoading(false);
        return;
      }

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.employeeNumber === pendingRoleChange.user.employeeNumber
            ? { ...u, role: pendingRoleChange.newRole }
            : u
        )
      );

      setFilteredUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.employeeNumber === pendingRoleChange.user.employeeNumber
            ? { ...u, role: pendingRoleChange.newRole }
            : u
        )
      );

      setSuccessMessage(
        `Role updated from ${pendingRoleChange.oldRole} to ${pendingRoleChange.newRole} for ${pendingRoleChange.user.fullName}`
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      setRoleChangeDialog(false);
      setPendingRoleChange(null);
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Network error occurred while updating user role");
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const cancelRoleChange = () => {
    setRoleChangeDialog(false);
    setPendingRoleChange(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        (user.fullName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(user.employeeNumber || "").includes(searchTerm) ||
        (user.role || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter
        ? (user.role || "").toLowerCase() === roleFilter.toLowerCase()
        : true;

      return matchesSearch && matchesRole;
    });

    setFilteredUsers(filtered);
    setPage(0);
  }, [searchTerm, roleFilter, users]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role = "") => {
    switch ((role || "").toLowerCase()) {
      case "superadmin":
        return {
          sx: { bgcolor: alpha(settings?.primaryColor || '#894444', 0.15), color: settings?.primaryColor || '#894444' },
          icon: <SupervisorAccount />,
        };
      case "administrator":
        return {
          sx: { bgcolor: alpha(settings?.secondaryColor || '#6d2323', 0.15), color: settings?.secondaryColor || '#6d2323' },
          icon: <AdminPanelSettings />,
        };
      case "staff":
        return {
          sx: { bgcolor: alpha(settings?.primaryColor || '#894444', 0.1), color: settings?.primaryColor || '#894444' },
          icon: <Work />,
        };
      default:
        return {
          sx: { bgcolor: alpha(settings?.primaryColor || '#894444', 0.1), color: settings?.primaryColor || '#894444' },
          icon: <Person />,
        };
    }
  };

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getInitials = (nameOrUsername) => {
    if (!nameOrUsername) return "U";
    const parts = nameOrUsername.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

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
                      <People sx={{ fontSize: 32, color: settings?.primaryColor || '#894444' }} />
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
                        User Management
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.8,
                          fontWeight: 400,
                          color: settings?.textPrimaryColor || '#6D2323',
                        }}
                      >
                        Manage user accounts, roles, and page access permissions
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={`${users.length} Users`}
                      size="small"
                      sx={{
                        bgcolor: alpha(settings?.primaryColor || '#894444', 0.15),
                        color: settings?.primaryColor || '#894444',
                        fontWeight: 500,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    <Tooltip title="Refresh Users">
                      <IconButton
                        onClick={fetchUsers}
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

                    <ProfessionalButton
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => navigate("/registration")}
                      sx={{
                        bgcolor: settings?.primaryColor || '#894444',
                        color: settings?.accentColor || '#FEF9E1',
                        "&:hover": {
                          bgcolor: settings?.secondaryColor || '#6d2323',
                        },
                      }}
                    >
                      Single Registration
                    </ProfessionalButton>

                    <ProfessionalButton
                      variant="contained"
                      startIcon={<Pages />}
                      onClick={() => navigate("/pages-list")}
                      sx={{
                        bgcolor: settings?.primaryColor || '#894444',
                        color: settings?.accentColor || '#FEF9E1',
                        "&:hover": {
                          bgcolor: settings?.secondaryColor || '#6d2323',
                        },
                      }}
                    >
                      Pages Library
                    </ProfessionalButton>
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
                  icon={<Cancel />}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </Box>
            </Fade>
          </Backdrop>
        )}

        {/* Stats Cards */}
        <Fade in timeout={700}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <GlassCard>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <AccountCircle
                    sx={{ fontSize: 44, color: settings?.textPrimaryColor || '#6D2323', mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: settings?.textPrimaryColor || '#6D2323', fontWeight: 700 }}
                  >
                    {users.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                    Total Users
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <GlassCard>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <SupervisorAccount
                    sx={{ fontSize: 44, color: settings?.textPrimaryColor || '#6D2323', mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: settings?.textPrimaryColor || '#6D2323', fontWeight: 700 }}
                  >
                    {users.filter((u) => u.role === "superadmin").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                    Superadmins
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <GlassCard>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <AdminPanelSettings
                    sx={{ fontSize: 44, color: settings?.textPrimaryColor || '#6D2323', mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: settings?.textPrimaryColor || '#6D2323', fontWeight: 700 }}
                  >
                    {users.filter((u) => u.role === "administrator").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                    Administrators
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <GlassCard>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Work sx={{ fontSize: 44, color: settings?.textPrimaryColor || '#6D2323', mb: 1 }} />
                  <Typography
                    variant="h5"
                    sx={{ color: settings?.textPrimaryColor || '#6D2323', fontWeight: 700 }}
                  >
                    {users.filter((u) => u.role === "staff").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                    Staff Members
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <GlassCard>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Visibility
                    sx={{ fontSize: 44, color: settings?.textPrimaryColor || '#6D2323', mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: settings?.textPrimaryColor || '#6D2323', fontWeight: 700 }}
                  >
                    {filteredUsers.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                    Filtered Results
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>
          </Grid>
        </Fade>

        {/* Controls */}
        <Fade in timeout={900}>
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
                      Find and filter users by various criteria
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
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <ModernTextField
                    fullWidth
                    label="Search Users"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, employee number, or role"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: settings?.textPrimaryColor || '#6D2323' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ModernTextField
                    select
                    fullWidth
                    label="Filter by Role"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="Superadmin">Superadmin</MenuItem>
                    <MenuItem value="Administrator">Administrator</MenuItem>
                    <MenuItem value="Staff">Staff</MenuItem>
                  </ModernTextField>
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
              Loading users...
            </Typography>
          </Box>
        </Backdrop>

        {/* Users Table */}
        {!loading && (
          <Fade in timeout={1100}>
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
                    Registered Users
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.8, color: settings?.accentColor || '#FEF9E1' }}
                  >
                    {searchTerm
                      ? `Showing ${filteredUsers.length} of ${users.length} users matching "${searchTerm}"`
                      : `Total: ${users.length} registered users`}
                  </Typography>
                </Box>
              </Box>

              <PremiumTableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.7) }}>
                    <TableRow>
                      <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                        <BadgeIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                        Employee #
                      </PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                        <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                        Full Name
                      </PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                        <Email sx={{ mr: 1, verticalAlign: "middle" }} />
                        Email
                      </PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                        <Business sx={{ mr: 1, verticalAlign: "middle" }} />
                        Role
                      </PremiumTableCell>
                      <PremiumTableCell
                        isHeader
                        sx={{ color: settings?.textPrimaryColor || '#6D2323', textAlign: "center" }}
                      >
                        <Security sx={{ mr: 1, verticalAlign: "middle" }} />
                        Page Access
                      </PremiumTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user, index) => (
                        <TableRow
                          key={user.employeeNumber}
                          sx={{
                            "&:nth-of-type(even)": {
                              bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.3),
                            },
                            "&:hover": { bgcolor: alpha(settings?.primaryColor || '#894444', 0.05) },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <PremiumTableCell
                            sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                          >
                            {user.employeeNumber}
                          </PremiumTableCell>

                          <PremiumTableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                src={user.avatar || ""}
                                alt={user.fullName}
                                sx={{
                                  width: 48,
                                  height: 48,
                                  bgcolor: settings?.primaryColor || '#894444',
                                  color: settings?.accentColor || '#FEF9E1',
                                  fontWeight: 700,
                                  fontSize: "1rem",
                                  boxShadow: `0 4px 12px ${alpha(settings?.primaryColor || '#894444', 0.2)}`,
                                  border: "2px solid #fff",
                                }}
                              >
                                {!user.avatar && getInitials(user.fullName)}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                                >
                                  {user.fullName}
                                </Typography>
                                {user.nameExtension && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                                  >
                                    ({user.nameExtension})
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </PremiumTableCell>

                          <PremiumTableCell sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>
                            {user.email}
                          </PremiumTableCell>

                          <PremiumTableCell>
                            <ModernTextField
                              select
                              value={user.role || "staff"}
                              onChange={(e) => handleRoleChange(user, e.target.value)}
                              size="small"
                              sx={{
                                minWidth: 150,
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "rgba(255, 255, 255, 0.9)",
                                },
                              }}
                            >
                              <MenuItem value="superadmin">Superadmin</MenuItem>
                              <MenuItem value="administrator">Administrator</MenuItem>
                              <MenuItem value="staff">Staff</MenuItem>
                            </ModernTextField>
                          </PremiumTableCell>

                          <PremiumTableCell sx={{ textAlign: "center" }}>
                            <ProfessionalButton
                              onClick={() => handlePageAccessClick(user)}
                              startIcon={<Security />}
                              size="small"
                              variant="contained"
                              sx={{
                                bgcolor: settings?.primaryColor || '#894444',
                                color: settings?.accentColor || '#FEF9E1',
                                "&:hover": {
                                  bgcolor: settings?.secondaryColor || '#6d2323',
                                },
                              }}
                            >
                              Manage
                            </ProfessionalButton>
                          </PremiumTableCell>
                        </TableRow>
                      ))
                    ) : (
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
                              No Users Found
                            </Typography>
                            <Typography
                              variant="body1"
                              color={alpha(settings?.primaryColor || '#894444', 0.4)}
                            >
                              {searchTerm
                                ? "Try adjusting your search criteria"
                                : "No users registered yet"}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </PremiumTableContainer>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                  <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    sx={{
                      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                        {
                          color: settings?.textPrimaryColor || '#6D2323',
                          fontWeight: 600,
                        },
                    }}
                  />
                </Box>
              )}
            </GlassCard>
          </Fade>
        )}

        {/* Page Access Management Dialog */}
        <Dialog
          open={pageAccessDialog}
          onClose={closePageAccessDialog}
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
              <Security sx={{ fontSize: 30 }} />
              Page Access Management
            </Box>
            <IconButton
              onClick={closePageAccessDialog}
              sx={{ color: settings?.accentColor || '#FEF9E1' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            {selectedUser && (
              <>
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.2)}`,
                    bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={selectedUser.avatar || ""}
                      alt={selectedUser.fullName}
                      sx={{
                        bgcolor: settings?.primaryColor || '#894444',
                        width: 64,
                        height: 64,
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        border: "3px solid #fff",
                        boxShadow: `0 4px 12px ${alpha(settings?.primaryColor || '#894444', 0.2)}`,
                      }}
                    >
                      {!selectedUser.avatar &&
                        getInitials(selectedUser.fullName)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: settings?.textPrimaryColor || '#6D2323' }}
                      >
                        {selectedUser.fullName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: settings?.textPrimaryColor || '#6D2323', mt: 1 }}
                      >
                        Employee: <strong>{selectedUser.employeeNumber}</strong>{" "}
                        | Role: <strong>{selectedUser.role}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {!pageAccessLoading && pages.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 3,
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}>
                      Toggle All Pages:
                    </Typography>
                    <Switch
                      checked={Object.values(pageAccess).every(
                        (v) => v === true
                      )}
                      onChange={(e) => {
                        const enableAll = e.target.checked;
                        pages.forEach((page) => {
                          if (pageAccess[page.id] !== enableAll)
                            handleTogglePageAccess(page.id, !enableAll);
                        });
                      }}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: settings?.primaryColor || '#894444',
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: settings?.primaryColor || '#894444',
                          },
                      }}
                    />
                  </Box>
                )}

                {pageAccessLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                    <CircularProgress sx={{ color: settings?.primaryColor || '#894444' }} />
                  </Box>
                ) : pages.length > 0 ? (
                  <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                    <List>
                      {pages.map((page) => (
                        <ListItem
                          key={page.id}
                          sx={{
                            p: 2,
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.3),
                            border: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.1)}`,
                            "&:hover": {
                              bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                              >
                                {page.page_name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                              >
                                Page ID: {page.id}
                              </Typography>
                            }
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {accessChangeInProgress[page.id] ? (
                              <CircularProgress
                                size={24}
                                sx={{ color: settings?.primaryColor || '#894444' }}
                              />
                            ) : (
                              <>
                                {pageAccess[page.id] ? (
                                  <LockOpen sx={{ color: settings?.primaryColor || '#894444' }} />
                                ) : (
                                  <Lock sx={{ color: settings?.textPrimaryColor || '#6D2323' }} />
                                )}
                                <Switch
                                  checked={!!pageAccess[page.id]}
                                  onChange={() =>
                                    handleTogglePageAccess(
                                      page.id,
                                      !!pageAccess[page.id]
                                    )
                                  }
                                  sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                      color: settings?.primaryColor || '#894444',
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                      {
                                        backgroundColor: settings?.primaryColor || '#894444',
                                      },
                                  }}
                                />
                              </>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", p: 4, color: settings?.textPrimaryColor || '#6D2323' }}
                  >
                    No pages found in the system.
                  </Typography>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <ProfessionalButton
              onClick={closePageAccessDialog}
              variant="contained"
              sx={{
                bgcolor: settings?.primaryColor || '#894444',
                color: settings?.accentColor || '#FEF9E1',
                "&:hover": {
                  bgcolor: settings?.secondaryColor || '#6d2323',
                },
              }}
            >
              Close
            </ProfessionalButton>
          </DialogActions>
        </Dialog>

        {/* User Details Drawer */}
        <Drawer
          anchor="right"
          open={detailsDrawerOpen}
          onClose={closeUserDetails}
          PaperProps={{
            sx: {
              width: isMobile ? "100%" : "520px",
              bgcolor: settings?.accentColor || '#FEF9E1',
            },
          }}
        >
          {selectedUserForDetails && (
            <Box
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${settings?.primaryColor || '#894444'} 0%, ${settings?.secondaryColor || '#6d2323'} 100%)`,
                  color: settings?.accentColor || '#FEF9E1',
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={selectedUserForDetails.avatar || ""}
                      alt={selectedUserForDetails.fullName}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: settings?.accentColor || '#FEF9E1',
                        color: settings?.primaryColor || '#894444',
                        fontWeight: 700,
                        fontSize: "2rem",
                        border: "4px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      {!selectedUserForDetails.avatar &&
                        getInitials(selectedUserForDetails.fullName)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {selectedUserForDetails.fullName}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {getRoleColor(selectedUserForDetails.role).icon}
                        <Typography variant="body2">
                          {selectedUserForDetails.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={closeUserDetails}
                    sx={{ color: settings?.accentColor || '#FEF9E1' }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>

              {/* Tab Navigation */}
              <Box
                sx={{
                  display: "flex",
                  bgcolor: settings?.backgroundColor || '#FFFFFF',
                  borderBottom: `2px solid ${alpha(settings?.primaryColor || '#894444', 0.1)}`,
                }}
              >
                <Box
                  onClick={() => setActiveTab("info")}
                  sx={{
                    flex: 1,
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "info"
                        ? `3px solid ${settings?.primaryColor || '#894444'}`
                        : "none",
                    color: activeTab === "info" ? settings?.primaryColor || '#894444' : settings?.textPrimaryColor || '#6D2323',
                    fontWeight: activeTab === "info" ? 600 : 500,
                    "&:hover": {
                      bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                    },
                  }}
                >
                  <Info sx={{ mr: 1, verticalAlign: "middle" }} />
                  Information
                </Box>
                <Box
                  onClick={() => setActiveTab("access")}
                  sx={{
                    flex: 1,
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "access"
                        ? `3px solid ${settings?.primaryColor || '#894444'}`
                        : "none",
                    color: activeTab === "access" ? settings?.primaryColor || '#894444' : settings?.textPrimaryColor || '#6D2323',
                    fontWeight: activeTab === "access" ? 600 : 500,
                    "&:hover": {
                      bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                    },
                  }}
                >
                  <Key sx={{ mr: 1, verticalAlign: "middle" }} />
                  Page Access
                </Box>
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
                {activeTab === "info" && (
                  <Stack spacing={3}>
                    {/* Personal Information */}
                    <GlassCard>
                      <CardHeader
                        title={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <AssignmentInd sx={{ color: settings?.primaryColor || '#894444' }} />
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Personal Information
                            </Typography>
                          </Box>
                        }
                        sx={{ bgcolor: alpha(settings?.primaryColor || '#894444', 0.05) }}
                      />
                      <CardContent>
                        <Stack spacing={2}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Full Name
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              {selectedUserForDetails.fullName}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Employee Number
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              {selectedUserForDetails.employeeNumber}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Email Address
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              {selectedUserForDetails.email}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Role
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={selectedUserForDetails.role}
                                icon={
                                  getRoleColor(selectedUserForDetails.role).icon
                                }
                                sx={{
                                  ...getRoleColor(selectedUserForDetails.role)
                                    .sx,
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Last Login
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              {formatDate(selectedUserForDetails.lastLogin)}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </GlassCard>
                  </Stack>
                )}

                {activeTab === "access" && (
                  <Stack spacing={3}>
                    {/* Access Summary */}
                    <GlassCard>
                      <CardHeader
                        title={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TrendingUp sx={{ color: settings?.primaryColor || '#894444' }} />
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Page Access Summary
                            </Typography>
                          </Box>
                        }
                        sx={{ bgcolor: alpha(settings?.primaryColor || '#894444', 0.05) }}
                      />
                      <CardContent>
                        <Box sx={{ textAlign: "center", mb: 3 }}>
                          <Typography
                            variant="h2"
                            sx={{ color: settings?.primaryColor || '#894444', fontWeight: 700 }}
                          >
                            {selectedUserForDetails.accessiblePages?.length ||
                              0}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                          >
                            of {selectedUserForDetails.totalPages || 0} pages
                            accessible
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={animatedValue}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(settings?.primaryColor || '#894444', 0.1),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: settings?.primaryColor || '#894444',
                            },
                          }}
                        />
                      </CardContent>
                    </GlassCard>

                    {/* Accessible Pages List */}
                    <GlassCard>
                      <CardHeader
                        title={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Shield sx={{ color: settings?.primaryColor || '#894444' }} />
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              Accessible Pages
                            </Typography>
                          </Box>
                        }
                        sx={{ bgcolor: alpha(settings?.primaryColor || '#894444', 0.05) }}
                      />
                      <CardContent>
                        {selectedUserForDetails.accessiblePages &&
                        selectedUserForDetails.accessiblePages.length > 0 ? (
                          <Stack spacing={1}>
                            {selectedUserForDetails.accessiblePages.map(
                              (page) => (
                                <Box
                                  key={page.id}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                                    border: `1px solid ${alpha(
                                      settings?.primaryColor || '#894444',
                                      0.1
                                    )}`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <CheckCircle sx={{ color: settings?.primaryColor || '#894444' }} />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 600,
                                        color: settings?.textPrimaryColor || '#6D2323',
                                      }}
                                    >
                                      {page.page_name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                                    >
                                      ID: {page.id}
                                    </Typography>
                                  </Box>
                                </Box>
                              )
                            )}
                          </Stack>
                        ) : (
                          <Box sx={{ textAlign: "center", p: 4 }}>
                            <Cancel
                              sx={{
                                fontSize: 60,
                                color: alpha(settings?.primaryColor || '#894444', 0.3),
                                mb: 2,
                              }}
                            />
                            <Typography
                              variant="body1"
                              sx={{ color: settings?.textPrimaryColor || '#6D2323' }}
                            >
                              No page access granted
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </GlassCard>
                  </Stack>
                )}
              </Box>

              {/* Action Button */}
              <Box
                sx={{ p: 3, borderTop: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.1)}` }}
              >
                <ProfessionalButton
                  variant="contained"
                  fullWidth
                  startIcon={<Security />}
                  onClick={() => {
                    closeUserDetails();
                    handlePageAccessClick(selectedUserForDetails);
                  }}
                  sx={{
                    bgcolor: settings?.primaryColor || '#894444',
                    color: settings?.accentColor || '#FEF9E1',
                    py: 1.5,
                    "&:hover": {
                      bgcolor: settings?.secondaryColor || '#6d2323',
                    },
                  }}
                >
                  Manage Page Access
                </ProfessionalButton>
              </Box>
            </Box>
          )}
        </Drawer>

        {/* Role Change Confirmation Dialog */}
        <Dialog
          open={roleChangeDialog}
          onClose={cancelRoleChange}
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
            <VerifiedUser sx={{ fontSize: 30 }} />
            Confirm Role Change
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            {pendingRoleChange && (
              <>
                <Box
                  sx={{
                    mb: 3,
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.2)}`,
                    bgcolor: alpha(settings?.accentColor || '#FEF9E1', 0.5),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={pendingRoleChange.user.avatar || ""}
                      alt={pendingRoleChange.user.fullName}
                      sx={{
                        bgcolor: settings?.primaryColor || '#894444',
                        width: 64,
                        height: 64,
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        border: "3px solid #fff",
                        boxShadow: `0 4px 12px ${alpha(settings?.primaryColor || '#894444', 0.2)}`,
                      }}
                    >
                      {!pendingRoleChange.user.avatar &&
                        getInitials(pendingRoleChange.user.fullName)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: settings?.textPrimaryColor || '#6D2323' }}
                      >
                        {pendingRoleChange.user.fullName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: settings?.textPrimaryColor || '#6D2323', mt: 1 }}
                      >
                        Employee: <strong>{pendingRoleChange.user.employeeNumber}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Alert
                  severity="warning"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    "& .MuiAlert-message": { fontWeight: 500 },
                  }}
                  icon={<Info />}
                >
                  You are about to change the user's role. This action will be logged in the audit trail.
                </Alert>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(settings?.primaryColor || '#894444', 0.05),
                    border: `1px solid ${alpha(settings?.primaryColor || '#894444', 0.1)}`,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, fontWeight: 600, color: settings?.textPrimaryColor || '#6D2323' }}
                  >
                    Role Change Details:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Chip
                      label={pendingRoleChange.oldRole.toUpperCase()}
                      size="small"
                      icon={getRoleColor(pendingRoleChange.oldRole).icon}
                      sx={{
                        ...getRoleColor(pendingRoleChange.oldRole).sx,
                        fontWeight: 600,
                      }}
                    />
                    <Typography sx={{ color: settings?.textPrimaryColor || '#6D2323' }}>→</Typography>
                    <Chip
                      label={pendingRoleChange.newRole.toUpperCase()}
                      size="small"
                      icon={getRoleColor(pendingRoleChange.newRole).icon}
                      sx={{
                        ...getRoleColor(pendingRoleChange.newRole).sx,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <ProfessionalButton
              onClick={cancelRoleChange}
              variant="outlined"
              disabled={roleChangeLoading}
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
              onClick={confirmRoleChange}
              variant="contained"
              disabled={roleChangeLoading}
              startIcon={roleChangeLoading ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{
                bgcolor: settings?.primaryColor || '#894444',
                color: settings?.accentColor || '#FEF9E1',
                "&:hover": {
                  bgcolor: settings?.secondaryColor || '#6d2323',
                },
                "&:disabled": {
                  bgcolor: alpha(settings?.primaryColor || '#894444', 0.5),
                },
              }}
            >
              {roleChangeLoading ? "Updating..." : "Confirm Change"}
            </ProfessionalButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UsersList;