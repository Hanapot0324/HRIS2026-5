import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/auth';
import {
  Alert,
  TextField,
  Button,
  Box,
  Container,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  ArrowBack,
  VerifiedUserOutlined,
  LockResetOutlined,
  CheckCircleOutline,
  ErrorOutline,
  MarkEmailReadOutlined,
  Email as EmailOutlined,
  Security as SecurityOutlined,
  HelpOutline as HelpOutlineIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  AccountCircle,
  VpnKey,
  Notifications,
  Shield,
  QuestionAnswer,
  Business,
  Logout,
  Policy,
  ContactSupport,
  Close,
  People as PeopleIcon,
  Add,
  Edit,
  Delete,
  Visibility as VisibilityIcon,
  Save,
  Cancel,
} from '@mui/icons-material';
import LoadingOverlay from './LoadingOverlay';
import { useSystemSettings } from '../contexts/SystemSettingsContext';

const Settings = () => {
  const { settings: systemSettings } = useSystemSettings();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('password');
  const [formData, setFormData] = useState({
    currentPassword: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [enableMFA, setEnableMFA] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [aboutUs, setAboutUs] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [userRole, setUserRole] = useState('');
  // Confidential password states
  const [confidentialPassword, setConfidentialPassword] = useState('');
  const [confirmConfidentialPassword, setConfirmConfidentialPassword] =
    useState('');
  const [showConfidentialPassword, setShowConfidentialPassword] =
    useState(false);
  const [passwordExists, setPasswordExists] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState(null);
  // Contact us modal state
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: 'earisthrmstesting@gmail.com',
    subject: '',
    message: '',
  });
  // Contact submissions (for admin)
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [showContactSubmissions, setShowContactSubmissions] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  // FAQ CRUD states
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'general',
    display_order: 0,
    is_active: true,
  });
  // About Us CRUD states
  const [aboutUsEditMode, setAboutUsEditMode] = useState(false);
  const [aboutUsForm, setAboutUsForm] = useState({
    title: '',
    content: '',
    version: '',
  });

  const steps = [
    'Step 1: Verify Identity',
    'Step 2: Enter Code',
    'Step 3: New Password',
  ];

  const employeeNumber = localStorage.getItem('employeeNumber');

  // Get user role from token
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.role) {
      setUserRole(userInfo.role);
    }
  }, []);

  // Get colors from system settings
  const primaryColor = systemSettings?.primaryColor || '#6d2323';
  const secondaryColor = systemSettings?.secondaryColor || '#6d2323';
  const accentColor = systemSettings?.accentColor || '#FEF9E1';
  const textPrimaryColor = systemSettings?.textPrimaryColor || '#6D2323';
  const backgroundColor = systemSettings?.backgroundColor || '#FFFFFF';

  // Get user email from token
  useEffect(() => {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setErrorMessage('Session expired. Please login again.');
      setTimeout(() => (window.location.href = '/'), 2000);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserEmail(decoded.email);
    } catch (e) {
      console.error('Error decoding token:', e);
      setErrorMessage('Invalid session. Please login again.');
      setTimeout(() => (window.location.href = '/'), 2000);
    }

    // Fetch user preferences (MFA)
    const fetchUserPreferences = async () => {
      try {
        const token =
          localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/user-preferences/${employeeNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEnableMFA(
          response.data.enable_mfa === 1 || response.data.enable_mfa === true
        );
      } catch (err) {
        console.error('Error loading user preferences:', err);
        setEnableMFA(true);
      }
    };

    // Fetch FAQs
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/faqs`);
        setFaqs(response.data);
      } catch (err) {
        console.error('Error loading FAQs:', err);
      }
    };

    // Fetch About Us
    const fetchAboutUs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/about-us`);
        setAboutUs(response.data);
      } catch (err) {
        console.error('Error loading About Us:', err);
      }
    };

    // Fetch Policy
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/policy`);
        setPolicy(response.data);
      } catch (err) {
        console.error('Error loading Policy:', err);
      }
    };

    if (employeeNumber) {
      fetchUserPreferences();
    }
    fetchFAQs();
    fetchAboutUs();
    fetchPolicy();

    // Fetch confidential password info if superadmin
    const fetchPasswordInfo = async () => {
      try {
        const token =
          localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/confidential-password/exists`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPasswordExists(response.data.exists);
        setPasswordInfo(response.data.passwordInfo);
      } catch (err) {
        console.error('Error loading confidential password info:', err);
      }
    };

    const userInfo = getUserInfo();
    if (userInfo && userInfo.role === 'superadmin') {
      fetchPasswordInfo();
    }
  }, [employeeNumber]);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errMessage) setErrorMessage('');
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !confirmEmail) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (newEmail !== confirmEmail) {
      setErrorMessage('Emails do not match!');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/update-email`,
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setUserEmail(newEmail);
        setNewEmail('');
        setConfirmEmail('');
        setSuccessMessage('Email updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage('Failed to update email.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMFA = async (event) => {
    const newValue = event.target.checked;
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/user-preferences/${employeeNumber}`,
        { enable_mfa: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnableMFA(newValue);
      setSuccessMessage(
        `MFA ${newValue ? 'enabled' : 'disabled'} successfully!`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error updating MFA preference:', err);
      setErrorMessage('Failed to update MFA setting. Please try again.');
      setEnableMFA(!newValue);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send verification code (with current password check)
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      setErrorMessage('User email not found. Please login again.');
      return;
    }
    if (!formData.currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');

      const verifyRes = await fetch(`${API_BASE_URL}/verify-current-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: formData.currentPassword,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setErrorMessage(verifyData.error || 'Current password is incorrect.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/send-password-change-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentStep(1);
        setShowVerificationModal(true);
      } else {
        console.error('Backend error response:', data);
        setErrorMessage(data.error || 'Failed to send verification code.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!formData.verificationCode) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/verify-password-change-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          code: formData.verificationCode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentStep(2);
      } else {
        setErrorMessage(data.error || 'Invalid verification code.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.newPassword || !formData.confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!passwordConfirmed) {
      setErrorMessage('Please confirm that you want to change your password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/complete-password-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.error || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setLogoutOpen(true);

    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }, 3000);
  };

  const handleLogout = () => {
    setLogoutOpen(true);
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }, 1500);
  };

  const handleContactUsSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/contact-us`,
        contactForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 || res.status === 201) {
        setSuccessMessage('Your message has been sent successfully!');
        setContactForm({ name: '', email: 'earisthrmstesting@gmail.com', subject: '', message: '' });
        setContactUsOpen(false);
        // If viewing submissions, refresh the list
        if (showContactSubmissions && (userRole === 'superadmin' || userRole === 'administrator')) {
          fetchContactSubmissions();
        }
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (item) => {
    if (item.id === 'logout') {
      handleLogout();
    } else if (item.id === 'contact') {
      setActiveTab(item.id);
      // For admin/superadmin, show submissions view by default
      if (userRole === 'superadmin' || userRole === 'administrator') {
        setShowContactSubmissions(true);
        fetchContactSubmissions();
      } else {
        // For staff, show form and auto-fill email
        setShowContactSubmissions(false);
        setContactForm(prev => ({
          ...prev,
          email: 'earisthrmstesting@gmail.com'
        }));
      }
    } else {
      setActiveTab(item.id);
    }
  };

  // Fetch contact submissions (admin only)
  const fetchContactSubmissions = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/contact-us`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContactSubmissions(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error loading contact submissions:', err);
      if (err.response?.status !== 403) {
        setErrorMessage('Failed to load contact submissions.');
      }
    }
  };

  // Handle FAQ form changes
  const handleFaqFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFaqForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open FAQ dialog for create/edit
  const handleOpenFaqDialog = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'general',
        display_order: faq.display_order || 0,
        is_active: faq.is_active !== undefined ? faq.is_active : true,
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        question: '',
        answer: '',
        category: 'general',
        display_order: 0,
        is_active: true,
      });
    }
    setFaqDialogOpen(true);
  };

  // Save FAQ (create or update)
  const handleSaveFaq = async () => {
    if (!faqForm.question || !faqForm.answer) {
      setErrorMessage('Question and answer are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (editingFaq) {
        await axios.put(
          `${API_BASE_URL}/api/faqs/${editingFaq.id}`,
          faqForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('FAQ updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/faqs`,
          faqForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('FAQ created successfully!');
      }
      setFaqDialogOpen(false);
      // Refresh FAQs
      const response = await axios.get(`${API_BASE_URL}/api/faqs`);
      setFaqs(response.data);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to save FAQ.');
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/api/faqs/${faqId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('FAQ deleted successfully!');
      // Refresh FAQs
      const response = await axios.get(`${API_BASE_URL}/api/faqs`);
      setFaqs(response.data);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to delete FAQ.');
    } finally {
      setLoading(false);
    }
  };

  // Handle About Us form changes
  const handleAboutUsFormChange = (e) => {
    const { name, value } = e.target;
    setAboutUsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save About Us
  const handleSaveAboutUs = async () => {
    if (!aboutUsForm.title || !aboutUsForm.content) {
      setErrorMessage('Title and content are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/about-us`,
        aboutUsForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('About Us updated successfully!');
      setAboutUsEditMode(false);
      // Refresh About Us
      const response = await axios.get(`${API_BASE_URL}/api/about-us`);
      setAboutUs(response.data);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error saving About Us:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to save About Us.');
    } finally {
      setLoading(false);
    }
  };

  // Open About Us edit mode
  const handleEditAboutUs = () => {
    if (aboutUs) {
      setAboutUsForm({
        title: aboutUs.title || '',
        content: aboutUs.content || '',
        version: aboutUs.version || '',
      });
    } else {
      setAboutUsForm({
        title: 'About Us',
        content: '',
        version: '',
      });
    }
    setAboutUsEditMode(true);
  };

  // Update contact submission status and reply
  const handleUpdateSubmissionStatus = async (id, status, adminNotes = null) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/contact-us/${id}`,
        { status, admin_notes: adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(adminNotes ? 'Response sent successfully!' : 'Status updated successfully!');
      fetchContactSubmissions();
      // Update selected submission in dialog
      if (selectedSubmission) {
        setSelectedSubmission(prev => ({
          ...prev,
          status: status || prev.status,
          admin_notes: adminNotes !== null && adminNotes !== undefined ? adminNotes : prev.admin_notes
        }));
      }
      // Clear reply field if a reply was sent
      if (adminNotes) {
        setAdminReply('');
      }
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error updating submission:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to update submission.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box component="form" onSubmit={handleRequestCode}>
            <Typography
              sx={{
                mb: 3,
                color: 'black',
                fontSize: '15px',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              To change your password, we need to verify your identity. Enter
              your current password below, and we'll send a verification code to
              your email: <strong>{userEmail}</strong>
            </Typography>

            <TextField
              type={showPassword.current ? 'text' : 'password'}
              name="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChanges}
              fullWidth
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '& fieldset': { borderColor: primaryColor },
                  '&.Mui-focused fieldset': { borderColor: primaryColor },
                },
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showPassword.current ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={<MarkEmailReadOutlined />}
              sx={{
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 'normal',
                bgcolor: primaryColor,
                color: 'white',
                '&:hover': {
                  bgcolor: secondaryColor,
                  transform: 'scale(1.02)',
                },
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyCode}>
            <Typography
              sx={{
                mb: 3,
                color: 'black',
                fontSize: '15px',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              We've sent a 6-digit verification code to{' '}
              <strong>{userEmail}</strong>. Please check your email and enter
              the code below.
            </Typography>
            <TextField
              type="text"
              name="verificationCode"
              label="Verification Code"
              placeholder="Enter 6-digit code"
              fullWidth
              value={formData.verificationCode}
              onChange={handleChanges}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '0.5rem',
                },
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '& fieldset': { borderColor: primaryColor },
                  '&.Mui-focused fieldset': { borderColor: primaryColor },
                },
              }}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={() => setCurrentStep(0)}
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.8,
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontWeight: 'normal',
                  '&:hover': {
                    borderColor: secondaryColor,
                    backgroundColor: accentColor,
                  },
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<VerifiedUserOutlined />}
                sx={{
                  py: 1.8,
                  fontWeight: 'normal',
                  bgcolor: primaryColor,
                  color: 'white',
                  '&:hover': {
                    bgcolor: secondaryColor,
                    transform: 'scale(1.02)',
                  },
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box
            component="form"
            onSubmit={handleResetPassword}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                mb: 3,
                color: 'black',
                fontSize: '15px',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              Create a strong password for your account. Make sure it's at least
              6 characters long.
            </Typography>

            <TextField
              type={showPassword.new ? 'text' : 'password'}
              name="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChanges}
              sx={{
                mb: 2,
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '& fieldset': { borderColor: primaryColor },
                  '&.Mui-focused fieldset': { borderColor: primaryColor },
                },
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              type={showPassword.confirm ? 'text' : 'password'}
              name="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChanges}
              sx={{
                mb: 2,
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '& fieldset': { borderColor: primaryColor },
                  '&.Mui-focused fieldset': { borderColor: primaryColor },
                },
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPassword.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={passwordConfirmed}
                  onChange={(e) => setPasswordConfirmed(e.target.checked)}
                  sx={{
                    color: primaryColor,
                    '&.Mui-checked': { color: primaryColor },
                  }}
                />
              }
              label="I confirm that I want to change my password"
              sx={{ mb: 3, textAlign: 'center', width: '100%' }}
            />

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.8,
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontWeight: 'normal',
                  '&:hover': {
                    borderColor: secondaryColor,
                    backgroundColor: accentColor,
                  },
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!passwordConfirmed || loading}
                startIcon={<LockResetOutlined />}
                sx={{
                  py: 1.8,
                  fontWeight: 'normal',
                  bgcolor: primaryColor,
                  color: 'white',
                  '&:hover': {
                    bgcolor: secondaryColor,
                    transform: 'scale(1.02)',
                  },
                  transition: 'transform 0.2s ease-in-out',
                  '&:disabled': { bgcolor: '#cccccc' },
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Handle confidential password creation/update
  const handleConfidentialPasswordSubmit = async () => {
    if (!confidentialPassword || !confirmConfidentialPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (confidentialPassword !== confirmConfidentialPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    if (confidentialPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/confidential-password`,
        { password: confidentialPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setSuccessMessage(
          passwordExists
            ? 'Confidential password updated successfully!'
            : 'Confidential password created successfully!'
        );
        setConfidentialPassword('');
        setConfirmConfidentialPassword('');
        setTimeout(() => {
          setSuccessMessage('');
          // Refresh password info
          const fetchPasswordInfo = async () => {
            try {
              const response = await axios.get(
                `${API_BASE_URL}/api/confidential-password/exists`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setPasswordExists(response.data.exists);
              setPasswordInfo(response.data.passwordInfo);
            } catch (err) {
              console.error('Error loading confidential password info:', err);
            }
          };
          fetchPasswordInfo();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error ||
          'Failed to save confidential password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Menu items based on user role
  const menuItems = [
    {
      id: 'password',
      label: 'Change Password',
      icon: <VpnKey />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
    { 
      id: 'email', 
      label: 'Email Settings', 
      icon: <EmailOutlined />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
    { 
      id: 'mfa', 
      label: 'Security', 
      icon: <Shield />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
    {
      id: 'confidential',
      label: 'Admin Security',
      icon: <SecurityOutlined />,
      roles: ['superadmin'],
    },
    { 
      id: 'about', 
      label: 'About', 
      icon: <Business />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
    { 
      id: 'faqs', 
      label: 'FAQs', 
      icon: <QuestionAnswer />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
    { 
      id: 'policy', 
      label: 'Policy', 
      icon: <Policy />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
    { 
      id: 'contact', 
      label: 'Contact Us', 
      icon: <ContactSupport />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
    { 
      id: 'logout', 
      label: 'Logout', 
      icon: <Logout />,
      roles: ['superadmin', 'administrator', 'staff'],
    },
  ].filter(item => item.roles.includes(userRole));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        py: 2,
        px: 3,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <LoadingOverlay open={loading} message="Processing..." />
      <Container 
        maxWidth="xl" 
        sx={{ 
          width: '100%', 
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: primaryColor,
                  width: 48,
                  height: 48,
                }}
              >
                <SettingsIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    margin: 0,
                    color: primaryColor,
                    fontSize: '28px',
                    fontWeight: 'normal',
                  }}
                >
                  Settings
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    margin: '5px 0 0 0',
                    color: 'black',
                    opacity: 0.7,
                    fontSize: '14px',
                  }}
                >
                  Manage your account settings and preferences
                </Typography>
              </Box>
            </Box>
            {userRole !== 'staff' && (
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/users-list')}
                sx={{
                  bgcolor: primaryColor,
                  color: 'white',
                  '&:hover': {
                    bgcolor: secondaryColor,
                  },
                }}
              >
                User Management
              </Button>
            )}
          </Box>
        </Box>

        {errMessage && (
          <Alert
            icon={<ErrorOutline fontSize="inherit" />}
            sx={{ mb: 2 }}
            severity="error"
          >
            {errMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert
            icon={<CheckCircleOutline fontSize="inherit" />}
            sx={{ mb: 2 }}
            severity="success"
          >
            {successMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            height: '550px',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
          }}
        >
          {/* Left Sidebar */}
          <Box
            sx={{
              height: { xs: 'auto', md: '100%' },
              width: { xs: '100%', md: '240px' },
              minWidth: { xs: '100%', md: '240px' },
              maxWidth: { xs: '100%', md: '240px' },
              flexShrink: 0,
              flexGrow: 0,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${primaryColor}20`,
                height: { xs: 'auto', md: '100%' },
                width: '100%',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              <List component="nav" sx={{ p: 0, flex: 1, overflow: 'auto', height: '100%', width: '100%' }}>
                {menuItems.map((item) => (
                  <ListItem
                    key={item.id}
                    disablePadding
                    sx={{
                      bgcolor:
                        activeTab === item.id
                          ? `${primaryColor}10`
                          : 'transparent',
                      width: '100%',
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleMenuClick(item)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        width: '100%',
                        boxSizing: 'border-box',
                        '&:hover': {
                          bgcolor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: activeTab === item.id ? primaryColor : 'black',
                          minWidth: 40,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: 'normal',
                          color: activeTab === item.id ? primaryColor : 'black',
                          noWrap: true,
                        }}
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              height: { xs: 'auto', md: '100%' },
              flex: { xs: '0 0 100%', md: '1 1 0' },
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${primaryColor}20`,
                width: '100%',
                maxWidth: '100%',
                height: { xs: 'auto', md: '100%' },
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              {/* All tabs content wrapper with fixed height */}
              <Box 
                sx={{ 
                  width: '100%',
                  maxWidth: '100%',
                  height: '100%',
                  overflow: 'auto', 
                  overflowX: 'hidden',
                  p: 3,
                  boxSizing: 'border-box',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Password Tab */}
                {activeTab === 'password' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: primaryColor,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <VpnKey />
                      </Avatar>
                      <Typography
                        variant="h5"
                        sx={{ color: primaryColor, fontWeight: 'normal' }}
                      >
                        Change Password
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                    >
                      Keep your account secure by regularly updating your
                      password. Follow the steps below to change it.
                    </Typography>
                    <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel
                            StepIconProps={{
                              sx: {
                                '&.Mui-active': { color: primaryColor },
                                '&.Mui-completed': { color: primaryColor },
                              },
                            }}
                          >
                            {label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    {renderStepContent()}
                  </Box>
                )}

                {/* Email Tab */}
                {activeTab === 'email' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: primaryColor,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <EmailOutlined />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{ color: primaryColor, fontWeight: 'normal', fontSize: '1.1rem' }}
                      >
                        Email Settings
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                    >
                      Update your email address. You'll receive important
                      notifications and verification codes at this address.
                    </Typography>

                    <TextField
                      fullWidth
                      label="Current Email"
                      value={userEmail}
                      disabled
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: primaryColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="New Email Address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter your new email"
                      sx={{ mb: 2 }}
                      required
                      helperText="Enter the email address you want to use"
                    />

                    <TextField
                      fullWidth
                      label="Confirm New Email Address"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Re-enter your new email"
                      sx={{ mb: 3 }}
                      required
                      helperText="Re-enter the same email to confirm"
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        py: 1.8,
                        fontSize: '1rem',
                        fontWeight: 'normal',
                        bgcolor: primaryColor,
                        color: 'white',
                        '&:hover': {
                          bgcolor: secondaryColor,
                          transform: 'scale(1.02)',
                        },
                        transition: 'transform 0.2s ease-in-out',
                      }}
                      onClick={handleUpdateEmail}
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </Button>
                  </Box>
                )}

                {/* MFA/OTP Tab */}
                {activeTab === 'mfa' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: primaryColor,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Shield />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{ color: primaryColor, fontWeight: 'normal', fontSize: '1.1rem' }}
                      >
                        Multi-Factor Authentication (MFA/OTP)
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                    >
                      Multi-Factor Authentication adds an extra layer of
                      security to your account. When enabled, you'll receive a
                      verification code via email every time you log in.
                    </Typography>

                    <Card
                      sx={{
                        mb: 3,
                        backgroundColor: 'white',
                        border: `2px solid ${primaryColor}40`,
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: primaryColor,
                                fontWeight: 'normal',
                                mb: 1,
                              }}
                            >
                              Enable MFA/OTP on Login
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: 'black', opacity: 0.7 }}
                            >
                              {enableMFA
                                ? "MFA is currently enabled. You'll receive a verification code when logging in."
                                : 'MFA is currently disabled. You can log in without a verification code.'}
                            </Typography>
                          </Box>
                          <Switch
                            checked={enableMFA}
                            onChange={handleToggleMFA}
                            disabled={loading}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: primaryColor,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                {
                                  backgroundColor: primaryColor,
                                },
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        border: `1px solid ${primaryColor}30`,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: primaryColor,
                          fontWeight: 'normal',
                          mb: 1,
                        }}
                      >
                        How it works:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'black', opacity: 0.8 }}
                      >
                        • When MFA is enabled, after entering your password,
                        you'll receive a 6-digit code via email
                        <br />
                        • Enter this code to complete your login
                        <br />
                        • The code expires after 15 minutes
                        <br />• You can disable MFA anytime from this page
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* About Us Tab */}
                {activeTab === 'about' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: primaryColor,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Business />
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{ color: primaryColor, fontWeight: 'normal', fontSize: '1.1rem' }}
                        >
                          About Us
                        </Typography>
                      </Box>
                      {(userRole === 'superadmin' || userRole === 'administrator') && (
                        <Button
                          variant={aboutUsEditMode ? 'outlined' : 'contained'}
                          startIcon={aboutUsEditMode ? <Cancel /> : <Edit />}
                          onClick={() => {
                            if (aboutUsEditMode) {
                              setAboutUsEditMode(false);
                            } else {
                              handleEditAboutUs();
                            }
                          }}
                          sx={{
                            bgcolor: aboutUsEditMode ? 'transparent' : primaryColor,
                            color: aboutUsEditMode ? primaryColor : 'white',
                            borderColor: primaryColor,
                            '&:hover': {
                              bgcolor: aboutUsEditMode ? `${primaryColor}10` : secondaryColor,
                            },
                          }}
                        >
                          {aboutUsEditMode ? 'Cancel' : 'Edit'}
                        </Button>
                      )}
                    </Box>
                    {aboutUsEditMode ? (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: 'white',
                          border: `1px solid ${primaryColor}30`,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Title"
                          name="title"
                          value={aboutUsForm.title}
                          onChange={handleAboutUsFormChange}
                          sx={{ mb: 2 }}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Content (HTML supported)"
                          name="content"
                          value={aboutUsForm.content}
                          onChange={handleAboutUsFormChange}
                          multiline
                          rows={12}
                          sx={{ mb: 2 }}
                          required
                          helperText="You can use HTML tags for formatting"
                        />
                        <TextField
                          fullWidth
                          label="Version"
                          name="version"
                          value={aboutUsForm.version}
                          onChange={handleAboutUsFormChange}
                          sx={{ mb: 3 }}
                          placeholder="e.g., 1.0.0"
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => setAboutUsEditMode(false)}
                            sx={{
                              borderColor: primaryColor,
                              color: primaryColor,
                              '&:hover': {
                                borderColor: secondaryColor,
                                bgcolor: `${primaryColor}10`,
                              },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleSaveAboutUs}
                            disabled={loading}
                            startIcon={<Save />}
                            sx={{
                              bgcolor: primaryColor,
                              color: 'white',
                              '&:hover': {
                                bgcolor: secondaryColor,
                              },
                            }}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </Button>
                        </Box>
                      </Box>
                    ) : aboutUs ? (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: 'white',
                          border: `1px solid ${primaryColor}30`,
                          flex: 1,
                          overflow: 'auto',
                          minHeight: 0,
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            color: primaryColor,
                            fontWeight: 'normal',
                            mb: 2,
                          }}
                        >
                          {aboutUs.title}
                        </Typography>
                        <Box
                          sx={{
                            color: 'black',
                            '& h2': { color: primaryColor, mt: 2, mb: 1 },
                            '& h3': { color: primaryColor, mt: 2, mb: 1 },
                            '& p': { mb: 1.5, lineHeight: 1.8 },
                            '& ul': { pl: 3, mb: 2 },
                            '& li': { mb: 0.5 },
                          }}
                          dangerouslySetInnerHTML={{ __html: aboutUs.content }}
                        />
                        {aboutUs.version && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'black',
                              opacity: 0.6,
                              display: 'block',
                              mt: 2,
                            }}
                          >
                            Version: {aboutUs.version}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: 'black', opacity: 0.7 }}
                      >
                        Loading About Us content...
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Confidential Password Tab (Superadmin Only) */}
                {activeTab === 'confidential' && userRole === 'superadmin' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: primaryColor,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <SecurityOutlined />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{ color: primaryColor, fontWeight: 'normal', fontSize: '1.1rem' }}
                      >
                        Confidential Password Management
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                    >
                      This password is required for sensitive operations such as
                      deleting payroll records and viewing audit logs. Only
                      superadmin can create or update this password.
                    </Typography>

                    {passwordInfo && (
                      <Box
                        sx={{
                          mb: 3,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: 'white',
                          border: `1px solid ${primaryColor}30`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: 'black', mb: 1 }}
                        >
                          <strong>Status:</strong>{' '}
                          {passwordExists
                            ? 'Password is set'
                            : 'No password set'}
                        </Typography>
                        {passwordInfo.created_at && (
                          <Typography
                            variant="body2"
                            sx={{ color: 'black', mb: 1 }}
                          >
                            <strong>Created:</strong>{' '}
                            {new Date(passwordInfo.created_at).toLocaleString()}
                          </Typography>
                        )}
                        {passwordInfo.updated_at && (
                          <Typography variant="body2" sx={{ color: 'black' }}>
                            <strong>Last Updated:</strong>{' '}
                            {new Date(passwordInfo.updated_at).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <TextField
                      type={showConfidentialPassword ? 'text' : 'password'}
                      label={
                        passwordExists
                          ? 'New Confidential Password'
                          : 'Confidential Password'
                      }
                      value={confidentialPassword}
                      onChange={(e) => setConfidentialPassword(e.target.value)}
                      fullWidth
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& fieldset': { borderColor: primaryColor },
                          '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                          },
                        },
                      }}
                      required
                      helperText="Minimum 6 characters. This password will be required for sensitive operations."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SecurityOutlined sx={{ color: primaryColor }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfidentialPassword(
                                  !showConfidentialPassword
                                )
                              }
                              edge="end"
                            >
                              {showConfidentialPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      type={showConfidentialPassword ? 'text' : 'password'}
                      label="Confirm Confidential Password"
                      value={confirmConfidentialPassword}
                      onChange={(e) =>
                        setConfirmConfidentialPassword(e.target.value)
                      }
                      fullWidth
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& fieldset': { borderColor: primaryColor },
                          '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                          },
                        },
                      }}
                      required
                      helperText="Re-enter the password to confirm"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SecurityOutlined sx={{ color: primaryColor }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfidentialPassword(
                                  !showConfidentialPassword
                                )
                              }
                              edge="end"
                            >
                              {showConfidentialPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleConfidentialPasswordSubmit}
                      disabled={
                        loading ||
                        !confidentialPassword ||
                        !confirmConfidentialPassword
                      }
                      startIcon={<SecurityOutlined />}
                      sx={{
                        py: 1.8,
                        fontSize: '1rem',
                        fontWeight: 'normal',
                        bgcolor: primaryColor,
                        color: 'white',
                        '&:hover': {
                          bgcolor: secondaryColor,
                          transform: 'scale(1.02)',
                        },
                        transition: 'transform 0.2s ease-in-out',
                        '&:disabled': { bgcolor: '#cccccc' },
                      }}
                    >
                      {loading
                        ? 'Saving...'
                        : passwordExists
                        ? 'Update Confidential Password'
                        : 'Create Confidential Password'}
                    </Button>

                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        border: `1px solid ${primaryColor}30`,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: primaryColor,
                          fontWeight: 'normal',
                          mb: 1,
                        }}
                      >
                        Important Notes:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'black', opacity: 0.8 }}
                      >
                        • This password is required when deleting payroll
                        records
                        <br />
                        • This password is required when viewing audit logs
                        <br />
                        • Only superadmin can create or update this password
                        <br />• Make sure to remember this password or store it
                        securely
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: primaryColor,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <QuestionAnswer />
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{ color: primaryColor, fontWeight: 'normal', fontSize: '1.1rem' }}
                        >
                          Frequently Asked Questions (FAQs)
                        </Typography>
                      </Box>
                      {(userRole === 'superadmin' || userRole === 'administrator') && (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => handleOpenFaqDialog()}
                          sx={{
                            bgcolor: primaryColor,
                            color: 'white',
                            '&:hover': {
                              bgcolor: secondaryColor,
                            },
                          }}
                        >
                          Add FAQ
                        </Button>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                    >
                      Find answers to common questions about using the system.
                    </Typography>

                    {faqs.length > 0 ? (
                      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                        {faqs.map((faq) => (
                          <Accordion
                            key={faq.id}
                            sx={{
                              mb: 2,
                              backgroundColor: 'white',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              '&:before': { display: 'none' },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={
                                <ExpandMoreIcon sx={{ color: primaryColor }} />
                              }
                              sx={{
                                '& .MuiAccordionSummary-content': {
                                  alignItems: 'center',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: '100%',
                                }}
                              >
                                <HelpOutlineIcon
                                  sx={{ color: primaryColor, mr: 2 }}
                                />
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: 'black',
                                    fontWeight: 'normal',
                                    flex: 1,
                                    fontSize: '0.95rem',
                                  }}
                                >
                                  {faq.question}
                                </Typography>
                                {faq.category && (
                                  <Chip
                                    label={faq.category}
                                    size="small"
                                    sx={{
                                      bgcolor: `${primaryColor}20`,
                                      color: primaryColor,
                                      fontWeight: 'normal',
                                      mr: 1,
                                    }}
                                  />
                                )}
                                {(userRole === 'superadmin' || userRole === 'administrator') && (
                                  <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenFaqDialog(faq);
                                      }}
                                      sx={{ color: primaryColor }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFaq(faq.id);
                                      }}
                                      sx={{ color: '#d32f2f' }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'black',
                                  lineHeight: 1.8,
                                  pl: 5,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {faq.answer}
                              </Typography>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: 'black', opacity: 0.7 }}
                      >
                        No FAQs available at the moment.
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Contact Us Tab */}
                {activeTab === 'contact' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: primaryColor,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <ContactSupport />
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{ color: primaryColor, fontWeight: 'normal', fontSize: '1.1rem' }}
                        >
                          Contact Us
                        </Typography>
                      </Box>
                      {(userRole === 'superadmin' || userRole === 'administrator') && (
                        <Badge badgeContent={contactSubmissions.filter(s => s.status === 'new').length} color="error">
                          <Button
                            variant={!showContactSubmissions ? 'contained' : 'outlined'}
                            onClick={() => {
                              setShowContactSubmissions(!showContactSubmissions);
                            }}
                            sx={{
                              borderColor: primaryColor,
                              color: !showContactSubmissions ? 'white' : primaryColor,
                              bgcolor: !showContactSubmissions ? primaryColor : 'transparent',
                              '&:hover': {
                                borderColor: secondaryColor,
                                bgcolor: !showContactSubmissions ? secondaryColor : `${primaryColor}10`,
                              },
                            }}
                          >
                            {showContactSubmissions ? 'Add New Ticket' : 'View Submissions'}
                          </Button>
                        </Badge>
                      )}
                    </Box>

                    {(userRole === 'superadmin' || userRole === 'administrator') && showContactSubmissions ? (
                      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                        >
                          View and manage contact submissions from employees.
                        </Typography>
                        {contactSubmissions.length > 0 ? (
                          <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ bgcolor: `${primaryColor}10` }}>
                                  <TableCell sx={{ fontWeight: 'bold', color: primaryColor }}>Name</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: primaryColor }}>Email</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: primaryColor }}>Subject</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: primaryColor }}>Date</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: primaryColor }}>Status</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: primaryColor }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {contactSubmissions.map((submission) => (
                                  <TableRow key={submission.id} hover>
                                    <TableCell>{submission.name}</TableCell>
                                    <TableCell>{submission.email}</TableCell>
                                    <TableCell>{submission.subject || 'No subject'}</TableCell>
                                    <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={submission.status}
                                        size="small"
                                        sx={{
                                          bgcolor:
                                            submission.status === 'new'
                                              ? '#ff9800'
                                              : submission.status === 'read'
                                              ? '#2196f3'
                                              : submission.status === 'replied'
                                              ? '#4caf50'
                                              : '#9e9e9e',
                                          color: 'white',
                                          textTransform: 'capitalize',
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <IconButton
                                        size="small"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setAdminReply(submission.admin_notes || '');
                        setSubmissionDialogOpen(true);
                      }}
                                        sx={{ color: primaryColor }}
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'black', opacity: 0.7, textAlign: 'center', py: 4 }}>
                            No contact submissions found.
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <>
                        {(userRole === 'superadmin' || userRole === 'administrator') ? (
                          <Typography
                            variant="body2"
                            sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                          >
                            Create a new contact ticket on behalf of a user.
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                          >
                            Have a question or feedback? Fill out the form below and we'll get back to you as soon as possible.
                          </Typography>
                        )}

                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: 'white',
                            border: `1px solid ${primaryColor}30`,
                            flex: 1,
                            overflow: 'auto',
                            minHeight: 0,
                          }}
                        >
                          <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={contactForm.name}
                            onChange={handleContactFormChange}
                            sx={{ mb: 2 }}
                            required
                          />
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={contactForm.email || 'earisthrmstesting@gmail.com'}
                            onChange={handleContactFormChange}
                            type="email"
                            sx={{ mb: 2 }}
                            required
                          />
                          <TextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            value={contactForm.subject}
                            onChange={handleContactFormChange}
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            label="Message"
                            name="message"
                            value={contactForm.message}
                            onChange={handleContactFormChange}
                            multiline
                            rows={6}
                            sx={{ mb: 3 }}
                            required
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handleContactUsSubmit}
                            disabled={loading}
                            startIcon={<ContactSupport />}
                            sx={{
                              py: 1.8,
                              fontSize: '1rem',
                              fontWeight: 'normal',
                              bgcolor: primaryColor,
                              color: 'white',
                              '&:hover': {
                                bgcolor: secondaryColor,
                                transform: 'scale(1.02)',
                              },
                              transition: 'transform 0.2s ease-in-out',
                              '&:disabled': { bgcolor: '#cccccc' },
                            }}
                          >
                            {loading ? 'Sending...' : 'Send Message'}
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                )}

                {/* Policy Tab */}
                {activeTab === 'policy' && (
                  <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${primaryColor}20`,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: primaryColor,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Policy />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{ color: primaryColor, fontWeight: 'normal', fontSize: '1.1rem' }}
                      >
                        {policy?.title || 'Privacy Policy & Terms of Service'}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'black', mb: 3, opacity: 0.8 }}
                    >
                      Please review our privacy policy and terms of service.
                    </Typography>

                    {policy ? (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: 'white',
                          border: `1px solid ${primaryColor}30`,
                          flex: 1,
                          overflow: 'auto',
                          minHeight: 0,
                        }}
                      >
                        <Box
                          sx={{
                            color: 'black',
                            fontSize: '0.9rem',
                            '& h2': { color: primaryColor, mt: 2, mb: 1, fontSize: '1.2rem' },
                            '& h3': { color: primaryColor, mt: 2, mb: 1, fontSize: '1rem' },
                            '& h4': { color: primaryColor, mt: 2, mb: 1, fontSize: '0.95rem' },
                            '& p': { mb: 1.5, lineHeight: 1.6, fontSize: '0.9rem' },
                            '& ul': { pl: 3, mb: 2 },
                            '& li': { mb: 0.5, fontSize: '0.9rem' },
                          }}
                          dangerouslySetInnerHTML={{ __html: policy.privacy_policy }}
                        />

                        <Divider sx={{ my: 4 }} />

                        <Box
                          sx={{
                            color: 'black',
                            fontSize: '0.9rem',
                            '& h2': { color: primaryColor, mt: 2, mb: 1, fontSize: '1.2rem' },
                            '& h3': { color: primaryColor, mt: 2, mb: 1, fontSize: '1rem' },
                            '& h4': { color: primaryColor, mt: 2, mb: 1, fontSize: '0.95rem' },
                            '& p': { mb: 1.5, lineHeight: 1.6, fontSize: '0.9rem' },
                            '& ul': { pl: 3, mb: 2 },
                            '& li': { mb: 0.5, fontSize: '0.9rem' },
                          }}
                          dangerouslySetInnerHTML={{ __html: policy.terms_of_service }}
                        />

                        {policy.updated_at && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'black',
                              opacity: 0.6,
                              display: 'block',
                              mt: 3,
                              fontStyle: 'italic',
                            }}
                          >
                            Last updated: {new Date(policy.updated_at).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: 'black', opacity: 0.7 }}
                      >
                        Loading policy content...
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Contact Us Modal */}
        <Dialog
          open={contactUsOpen}
          onClose={() => setContactUsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'white',
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: primaryColor,
              fontWeight: 'normal',
            }}
          >
            Contact Us
            <IconButton onClick={() => setContactUsOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body2"
              sx={{ color: 'black', mb: 3, opacity: 0.8 }}
            >
              Have a question or feedback? Fill out the form below and we'll get
              back to you as soon as possible.
            </Typography>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={contactForm.name}
              onChange={handleContactFormChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={contactForm.email || 'earisthrmstesting@gmail.com'}
              onChange={handleContactFormChange}
              type="email"
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={contactForm.subject}
              onChange={handleContactFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={contactForm.message}
              onChange={handleContactFormChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setContactUsOpen(false)}
              sx={{
                color: primaryColor,
                fontWeight: 'normal',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContactUsSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: primaryColor,
                color: 'white',
                fontWeight: 'normal',
                '&:hover': {
                  bgcolor: secondaryColor,
                },
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Verification Modal */}
        {showVerificationModal && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300,
            }}
          >
            <Paper
              sx={{
                width: '90%',
                maxWidth: 500,
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: 'white',
              }}
            >
              <MarkEmailReadOutlined
                sx={{ fontSize: 80, color: primaryColor, mb: 2 }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'normal',
                  mb: 2,
                  color: primaryColor,
                }}
              >
                Verification Code Sent
              </Typography>
              <Typography sx={{ color: 'black', mb: 3, lineHeight: 1.5 }}>
                A verification code has been sent to{' '}
                <strong>{userEmail}</strong>. Please check your inbox and enter
                the code to proceed.
              </Typography>
              <Button
                onClick={() => setShowVerificationModal(false)}
                variant="contained"
                fullWidth
                sx={{
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  bgcolor: primaryColor,
                  color: 'white',
                  '&:hover': { bgcolor: secondaryColor },
                }}
              >
                Okay
              </Button>
            </Paper>
          </Box>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300,
            }}
          >
            <Paper
              sx={{
                width: '90%',
                maxWidth: 500,
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: 'white',
              }}
            >
              <CheckCircleOutline
                sx={{ fontSize: 80, color: primaryColor, mb: 2 }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'normal',
                  mb: 2,
                  color: primaryColor,
                }}
              >
                Password Changed Successfully!
              </Typography>
              <Typography sx={{ color: 'black', mb: 3, lineHeight: 1.5 }}>
                Your password has been successfully updated. You will be logged
                out shortly for security purposes.
              </Typography>
              <Button
                onClick={handleSuccessClose}
                variant="contained"
                fullWidth
                startIcon={<LockOutlined />}
                sx={{
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  bgcolor: primaryColor,
                  color: 'white',
                  '&:hover': { bgcolor: secondaryColor },
                }}
              >
                Continue
              </Button>
            </Paper>
          </Box>
        )}

        {/* FAQ Dialog */}
        <Dialog
          open={faqDialogOpen}
          onClose={() => setFaqDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'white',
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: primaryColor,
              fontWeight: 'normal',
            }}
          >
            {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
            <IconButton onClick={() => setFaqDialogOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Question"
              name="question"
              value={faqForm.question}
              onChange={handleFaqFormChange}
              sx={{ mb: 2, mt: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Answer"
              name="answer"
              value={faqForm.answer}
              onChange={handleFaqFormChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              required
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={faqForm.category}
                onChange={handleFaqFormChange}
                label="Category"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="password">Password</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="account">Account</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Display Order"
              name="display_order"
              value={faqForm.display_order}
              onChange={handleFaqFormChange}
              sx={{ mb: 2 }}
              inputProps={{ min: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="is_active"
                  checked={faqForm.is_active}
                  onChange={handleFaqFormChange}
                  sx={{
                    color: primaryColor,
                    '&.Mui-checked': { color: primaryColor },
                  }}
                />
              }
              label="Active"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setFaqDialogOpen(false)}
              sx={{
                color: primaryColor,
                fontWeight: 'normal',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFaq}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: primaryColor,
                color: 'white',
                fontWeight: 'normal',
                '&:hover': {
                  bgcolor: secondaryColor,
                },
              }}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Contact Submission Dialog */}
        <Dialog
          open={submissionDialogOpen}
          onClose={() => setSubmissionDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'white',
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: primaryColor,
              fontWeight: 'normal',
            }}
          >
            Contact Submission Details
            <IconButton onClick={() => setSubmissionDialogOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedSubmission && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1, mt: 2 }}>
                  From:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedSubmission.name} ({selectedSubmission.email})
                </Typography>
                {selectedSubmission.employee_number && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1 }}>
                      Employee Number:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedSubmission.employee_number}
                    </Typography>
                  </>
                )}
                <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1 }}>
                  Subject:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedSubmission.subject || 'No subject'}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1 }}>
                  Message:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission.message}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1 }}>
                  Status:
                </Typography>
                <Chip
                  label={selectedSubmission.status}
                  size="small"
                  sx={{
                    bgcolor:
                      selectedSubmission.status === 'new'
                        ? '#ff9800'
                        : selectedSubmission.status === 'read'
                        ? '#2196f3'
                        : selectedSubmission.status === 'replied'
                        ? '#4caf50'
                        : '#9e9e9e',
                    color: 'white',
                    textTransform: 'capitalize',
                    mb: 2,
                  }}
                />
                <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1 }}>
                  Submitted:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {new Date(selectedSubmission.created_at).toLocaleString()}
                </Typography>
                {selectedSubmission.admin_notes && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1 }}>
                      Admin Response:
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: `${primaryColor}10`,
                        border: `1px solid ${primaryColor}30`,
                        mb: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'black' }}>
                        {selectedSubmission.admin_notes}
                      </Typography>
                    </Box>
                  </>
                )}
                <Divider sx={{ my: 2 }} />
                
                {(userRole === 'superadmin' || userRole === 'administrator') && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}>
                      Reply to Ticket:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Your Reply"
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Type your response here..."
                      sx={{ mb: 2 }}
                      helperText="Your reply will be sent to the ticket submitter"
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Update Status</InputLabel>
                      <Select
                        value={selectedSubmission.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
                          handleUpdateSubmissionStatus(selectedSubmission.id, newStatus, adminReply || selectedSubmission.admin_notes);
                        }}
                        label="Update Status"
                      >
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="read">Read</MenuItem>
                        <MenuItem value="replied">Replied</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setSubmissionDialogOpen(false);
                setAdminReply('');
              }}
              sx={{
                color: primaryColor,
                fontWeight: 'normal',
              }}
            >
              Close
            </Button>
            {(userRole === 'superadmin' || userRole === 'administrator') && (
              <Button
                onClick={() => {
                  if (adminReply.trim()) {
                    handleUpdateSubmissionStatus(
                      selectedSubmission.id,
                      'replied',
                      adminReply
                    );
                  }
                }}
                variant="contained"
                disabled={loading || !adminReply.trim()}
                startIcon={<Save />}
                sx={{
                  bgcolor: primaryColor,
                  color: 'white',
                  fontWeight: 'normal',
                  '&:hover': {
                    bgcolor: secondaryColor,
                  },
                  '&:disabled': {
                    bgcolor: '#cccccc',
                  },
                }}
              >
                {loading ? 'Sending...' : 'Send Reply'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Logout Animation Dialog */}
        {logoutOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 0 40px ${primaryColor}70, 0 0 80px ${primaryColor}50`,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'floatSphere 2s ease-in-out infinite alternate',
                }}
              >
                <LockResetOutlined
                  sx={{
                    fontSize: 60,
                    color: 'white',
                    animation: 'heartbeat 1s infinite',
                  }}
                />
              </Box>
            </Box>

            <Typography
              variant="h6"
              sx={{
                mt: 3,
                fontWeight: 'normal',
                color: 'white',
                textShadow: `0 0 10px ${primaryColor}`,
                animation: 'pulse 1.5s infinite',
              }}
            >
              Logging out...
            </Typography>

            <style>{`
              @keyframes heartbeat {
                0%,100% { transform: scale(1); }
                25%,75% { transform: scale(1.15); }
                50% { transform: scale(1.05); }
              }
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.6; }
                100% { opacity: 1; }
              }
              @keyframes floatSphere {
                0% { transform: translate(-50%, -50%) translateY(0); }
                50% { transform: translate(-50%, -50%) translateY(-15px); }
                100% { transform: translate(-50%, -50%) translateY(0); }
              }
            `}</style>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Settings;
