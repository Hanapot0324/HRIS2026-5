import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import useProfileData from '../../hooks/useProfileData';
import useProfileSections from '../../hooks/useProfileSections';
import useProfileMutations from '../../hooks/useProfileMutations';
import { getUserInfo, getAuthHeaders } from '../../utils/auth';
import {
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Container,
  Button,
  Modal,
  TextField,
  Chip,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  useTheme,
  alpha,
  Backdrop,
  Tabs,
  Tab,
  Fab,
  Snackbar,
  SnackbarContent,
  useScrollTrigger,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListItemText as MuiListItemText,
  ListItemIcon as MuiListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  InputAdornment,
  AppBar,
  Toolbar,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import WorkIcon from '@mui/icons-material/Work';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import { ExitToApp } from '@mui/icons-material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PercentIcon from '@mui/icons-material/Percent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BookIcon from '@mui/icons-material/Book';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoIcon from '@mui/icons-material/Info';
import ConstructionIcon from '@mui/icons-material/Construction';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const colors = {
  primary: '#6D2323',
  primaryLight: '#A31D1D',
  primaryDark: '#4a1818',
  secondary: '#FEF9E1',
  textPrimary: '#000000',
  textSecondary: '#555555',
  textLight: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#6D2323',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  gradientPrimary: 'linear-gradient(135deg, #6D2323 0%, #A31D1D 100%)',
};

const shadows = {
  light: '0 2px 8px rgba(0,0,0,0.08)',
  medium: '0 4px 16px rgba(0,0,0,0.12)',
  heavy: '0 8px 24px rgba(0,0,0,0.16)',
  colored: '0 4px 16px rgba(109, 35, 35, 0.2)',
};

// --- NEW LAYOUT STYLES ---

export const ProfileWrapper = styled(Box)`
  width: 100%;
  max-width: 1200px; /* center it like a website */
  min-height: 8vh;
  margin: 20px auto; /* center and add spacing */
  padding: 20px;
  display: flex;
  flex-direction: column;

  /* Glass + Shadow */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  /* Optional glare hover */
  position: relative;
  &:hover::before {
    transform: rotate(25deg) translateX(100%);
  }
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      60deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    transform: rotate(25deg) translateX(-100%);
    transition: transform 0.7s ease;
    border-radius: 16px;
  }
`;

// Top Navigation Bar Container
const ProfileAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  borderBottom: '1px solid #E5E5E5',
  padding: '0 24px',
  position: 'relative',
  zIndex: 1100,
}));

export const ProfileToolbar = styled(Toolbar)`
  min-height: 80px; /* ← increase this (64 default) */
  padding-top: 12px;
  padding-bottom: 12px;

  display: flex;
  align-items: center;
`;

const BrandSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flex: 1,
}));

const ProfileInfoCompact = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: theme.spacing(1),
}));

const NavTabsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: colors.background,
  borderBottom: '1px solid #E5E5E5',
  width: '100%',
  zIndex: 1090,
}));

const NavTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '50px',
  '& .MuiTabs-indicator': {
    backgroundColor: colors.primary,
    height: '3px',
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: colors.textSecondary,
    minHeight: '50px',
    minWidth: 'auto',
    padding: '12px 20px',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: colors.primary,
      backgroundColor: alpha(colors.primary, 0.04),
    },
    '&.Mui-selected': {
      color: colors.primary,
    },
  },
}));

// Main Content Area (replaces MainContent, adjusted for no sidebar)
export const MainContent = styled(Box)`
  flex: 1;
  width: 100%;
  max-width: 1600px; /* adjust if you want */
  margin: 0 auto; /* center */

  padding: 24px;

  box-sizing: border-box;
`;

// --- EXISTING STYLES (Kept for content consistency) ---

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  boxShadow: shadows.medium,

  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: colors.surface,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    textAlign: 'center',
    padding: theme.spacing(3),
  },
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const ProfileName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.8rem',
  color: colors.textPrimary,
  marginBottom: theme.spacing(0.5),
  transition: 'color 0.3s ease',
  '&:hover': {
    color: colors.primary,
  },
}));

const ProfileSubtitle = styled(Typography)(({ theme }) => ({
  color: colors.textSecondary,
  marginBottom: theme.spacing(2),
  fontSize: '1rem',
}));

const ProfileActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    flexWrap: 'wrap',
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(3),
  boxShadow: shadows.light,
  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: shadows.medium,
    transform: 'translateY(-2px)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.3rem',
  color: colors.textPrimary,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  alignItems: 'flex-start',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const PageHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: colors.surface,
  border: '1px solid #E5E5E5',
  borderRadius: '12px',
  padding: '20px 30px',
  marginBottom: '30px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  },
}));

const HeaderTitles = styled(Box)(({ theme }) => ({}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.6rem',
  color: colors.primary,
  fontWeight: 800,
  marginBottom: '4px',
  letterSpacing: '-0.5px',
}));

const HeaderSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: colors.textSecondary,
  fontWeight: 500,
}));

const NavControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px',
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)', // semi-transparent glass
  backdropFilter: 'blur(8px)', // glass blur effect
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: colors.textPrimary,
  width: '44px',
  height: '44px',
  borderRadius: '12px', // rounded for modern look
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // soft shadow
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',

  '&:hover': {
    color: colors.primary,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
  },

  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },

  // Glare hover effect
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background:
      'linear-gradient(60deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
    transform: 'rotate(25deg) translateX(-100%)',
    transition: 'transform 0.7s ease',
  },
  '&:hover::before': {
    transform: 'rotate(25deg) translateX(100%)',
  },
}));

const DataCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'mouseX' && prop !== 'mouseY',
})(({ theme, mouseX, mouseY }) => ({
  background: colors.surface,
  border: '1px solid #f0f0f0',
  borderRadius: '12px',
  padding: '30px',
  marginBottom: '20px',
  position: 'relative',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  overflow: 'hidden',
  transition: 'transform 0.1s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    padding: '1px',
    background:
      mouseX && mouseY
        ? `radial-gradient(800px circle at ${mouseX}px ${mouseY}px, ${colors.primaryLight}, transparent 40%)`
        : 'transparent',
    WebkitMask:
      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    zIndex: 2,
    opacity: mouseX ? 1 : 0,
    transition: 'opacity 0.3s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    background:
      mouseX && mouseY
        ? `radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(109, 35, 35, 0.05), transparent 50%)`
        : 'transparent',
    pointerEvents: 'none',
    zIndex: 1,
    opacity: mouseX ? 1 : 0,
    transition: 'opacity 0.3s ease',
  },
}));

const CardInner = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
}));

const InfoGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '30px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: '20px',
  },
}));

const InfoGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: colors.textSecondary,
  fontWeight: 700,
  marginBottom: '6px',
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: colors.textPrimary,
  fontWeight: 500,
}));

const Timeline = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: '20px',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '5px',
    bottom: 0,
    width: '2px',
    background: '#eee',
  },
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingBottom: '30px',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '-25px',
    top: '6px',
    width: '12px',
    height: '12px',
    background: colors.surface,
    border: `3px solid ${colors.primary}`,
    borderRadius: '50%',
    zIndex: 1,
  },
}));

const TimelineDate = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: colors.primary,
  fontWeight: 700,
  marginBottom: '5px',
}));

const TimelineTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 700,
  marginBottom: '2px',
  color: colors.textPrimary,
}));

const TimelineOrg = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: colors.textSecondary,
}));

const ContentSection = styled(Box)(({ theme, active }) => ({
  display: active ? 'block' : 'none',
  animation: active ? 'fade 0.3s ease' : 'none',
  '@keyframes fade': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const TabContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
}));

const CustomTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: colors.textLight,
    backgroundColor: colors.primary,
  },
  '&:not(.Mui-selected)': {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      color: colors.primary,
    },
  },
}));

const CustomTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(colors.secondary, 0.7),
  borderRadius: theme.spacing(3),
  padding: theme.spacing(0.5),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  boxShadow: shadows.light,
  ...(variant === 'contained' && {
    background: colors.gradientPrimary,
    color: colors.textLight,
    '&:hover': {
      background: colors.primaryDark,
      transform: 'translateY(-2px)',
      boxShadow: shadows.medium,
    },
  }),
  ...(variant === 'outlined' && {
    color: colors.primary,
    borderColor: colors.primary,
    borderWidth: '2px',
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      borderColor: colors.primaryDark,
      transform: 'translateY(-2px)',
    },
  }),
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '900px',
  backgroundColor: colors.surface,
  borderRadius: theme.spacing(3),
  boxShadow: shadows.heavy,
  padding: 0,
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ModalHeader = styled(AppBar)(({ theme }) => ({
  background: colors.gradientPrimary,
  padding: theme.spacing(2, 3),
  color: colors.textLight,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  boxShadow: 'none',
}));

const ModalTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.3rem',
}));

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: 'auto',
  flex: 1,
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: colors.border,
    },
    '&:hover fieldset': {
      borderColor: colors.primaryLight,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
}));

const ImagePreviewModal = styled(Modal)(({ theme }) => ({
  '& .MuiModal-backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
}));

const ImagePreviewContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '100%',
  maxHeight: '80vh',
}));

const PreviewImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '80vh',
  borderRadius: theme.spacing(2),
  boxShadow: shadows.heavy,
  objectFit: 'contain',
}));

const ImagePreviewActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: alpha(colors.surface, 0.9),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5),
}));

const ImagePreviewButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  '&:hover': {
    backgroundColor: colors.primary,
    color: colors.textLight,
  },
}));

const EditModalPictureSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: alpha(colors.secondary, 0.3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

const EditModalAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(16),
  height: theme.spacing(16),
  border: `3px solid ${colors.surface}`,
  boxShadow: shadows.medium,
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const EditModalPictureInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const EditModalPictureActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const Notification = styled(SnackbarContent)(({ theme, variant }) => ({
  backgroundColor:
    variant === 'success'
      ? colors.success
      : variant === 'error'
      ? colors.error
      : variant === 'warning'
      ? colors.warning
      : colors.info,
  color: colors.textLight,
  fontWeight: 500,
  borderRadius: theme.spacing(2),
  boxShadow: shadows.medium,
}));

const FloatingButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: colors.gradientPrimary,
  color: colors.textLight,
  boxShadow: shadows.medium,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: shadows.colored,
  },
}));

const ChildCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const ChildListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const CollegeCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const CollegeListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const GraduateCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const GraduateListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  maxHeight: '500px',
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  backgroundColor: colors.background,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.primary,
    borderRadius: '3px',
    '&:hover': {
      background: colors.primaryLight,
    },
  },
}));

const EducationSubTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(colors.secondary, 0.5),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const EducationSubTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  minWidth: 'auto',
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: colors.textLight,
    backgroundColor: colors.primary,
  },
  '&:not(.Mui-selected)': {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      color: colors.primary,
    },
  },
}));

const EligibilityCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const EligibilityListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const LearningDevelopmentCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const LearningDevelopmentListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const OtherInformationCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const OtherInformationListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const VocationalCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const VocationalListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const WorkExperienceCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const WorkExperienceListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const StickyActionBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: colors.surface,
  padding: theme.spacing(2),
  borderBottom: `1px solid ${colors.border}`,
  zIndex: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: colors.surface,
}));

const PercentageInput = ({
  value,
  onChange,
  label,
  disabled = false,
  error = false,
  helperText = '',
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    // Remove any non-digit characters except for decimal point
    newValue = newValue.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      newValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Ensure value is between 0 and 100
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 100) {
      newValue = '100';
    }

    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 'bold', mb: 0.5, color: '#333', display: 'block' }}
      >
        {label}
      </Typography>
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        placeholder="0.00"
        fullWidth
        size="small"
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <PercentIcon sx={{ color: '#6D2323' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: error ? 'red' : '#6D2323',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
            '&.Mui-focused fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
          },
        }}
      />
    </Box>
  );
};

const Profile = () => {
  const theme = useTheme();

  const {
    person,
    profilePicture,
    loading,
    refresh: refreshPerson,
  } = useProfileData();
  const {
    sections,
    loading: sectionsLoading,
    refresh: refreshSections,
  } = useProfileSections();
  const { saveProfile, saving } = useProfileMutations();

  const userInfo = getUserInfo();
  const employeeNumber =
    userInfo.employeeNumber || localStorage.getItem('employeeNumber');

  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [editImageZoomOpen, setEditImageZoomOpen] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [educationSubTabValue, setEducationSubTabValue] = useState(0);
  const profileRef = useRef(null);
  const [cardMousePos, setCardMousePos] = useState({});

  const [childrenFormData, setChildrenFormData] = useState([]);
  const [collegesFormData, setCollegesFormData] = useState([]);
  const [graduatesFormData, setGraduatesFormData] = useState([]);
  const [eligibilitiesFormData, setEligibilitiesFormData] = useState([]);
  const [learningDevelopmentFormData, setLearningDevelopmentFormData] =
    useState([]);
  const [otherInformationFormData, setOtherInformationFormData] = useState([]);
  const [vocationalFormData, setVocationalFormData] = useState([]);
  const [workExperiencesFormData, setWorkExperiencesFormData] = useState([]);

  useEffect(() => {
    if (!sectionsLoading) {
      if (sections.children.length > 0 && childrenFormData.length === 0) {
        setChildrenFormData(sections.children);
      }
      if (sections.colleges.length > 0 && collegesFormData.length === 0) {
        setCollegesFormData(sections.colleges);
      }
      if (sections.graduates.length > 0 && graduatesFormData.length === 0) {
        setGraduatesFormData(sections.graduates);
      }
      if (
        sections.eligibilities.length > 0 &&
        eligibilitiesFormData.length === 0
      ) {
        setEligibilitiesFormData(sections.eligibilities);
      }
      if (
        sections.learningDevelopment.length > 0 &&
        learningDevelopmentFormData.length === 0
      ) {
        setLearningDevelopmentFormData(sections.learningDevelopment);
      }
      if (
        sections.otherInformation.length > 0 &&
        otherInformationFormData.length === 0
      ) {
        setOtherInformationFormData(sections.otherInformation);
      }
      if (sections.vocational.length > 0 && vocationalFormData.length === 0) {
        setVocationalFormData(sections.vocational);
      }
      if (
        sections.workExperiences.length > 0 &&
        workExperiencesFormData.length === 0
      ) {
        setWorkExperiencesFormData(sections.workExperiences);
      }
    }
  }, [sections, sectionsLoading]);

  useEffect(() => {
    if (person && Object.keys(formData).length === 0) {
      const formattedData = { ...person };
      if (person.birthDate) {
        const date = new Date(person.birthDate);
        if (!isNaN(date.getTime())) {
          formattedData.birthDate = date.toISOString().split('T')[0];
        }
      }
      setFormData(formattedData);
    }
  }, [person]);

  const children = sections.children;
  const colleges = sections.colleges;
  const graduates = sections.graduates;
  const eligibilities = sections.eligibilities;
  const learningDevelopment = sections.learningDevelopment;
  const otherInformation = sections.otherInformation;
  const vocational = sections.vocational;
  const workExperiences = sections.workExperiences;

  const navigationSections = [
    {
      key: 0,
      label: 'Personal Info',
      icon: <PersonIcon />,
      title: 'Personal Information',
      subtitle: 'Manage your basic personal details and identifiers.',
    },
    {
      key: 1,
      label: 'Gov. IDs',
      icon: <BadgeIcon />,
      title: 'Government IDs',
      subtitle: 'Official government identification numbers.',
    },
    {
      key: 2,
      label: 'Contact & Address',
      icon: <CallIcon />,
      title: 'Contact & Address',
      subtitle: 'Contact details and permanent residence information.',
    },
    {
      key: 3,
      label: 'Family',
      icon: <GroupIcon />,
      title: 'Family Background',
      subtitle: 'Spouse and parents information.',
    },
    {
      key: 4,
      label: 'Education',
      icon: <SchoolIcon />,
      title: 'Education History',
      subtitle: 'Academic records and degrees earned.',
    },
    {
      key: 5,
      label: 'Children',
      icon: <ChildCareIcon />,
      title: 'Children',
      subtitle: 'Children information.',
    },
    {
      key: 6,
      label: 'Work Experience',
      icon: <WorkIcon />,
      title: 'Work Experience',
      subtitle: 'Professional history and appointments.',
    },
    {
      key: 7,
      label: 'Eligibility',
      icon: <FactCheckIcon />,
      title: 'Eligibility',
      subtitle: 'Civil service examination results and ratings.',
    },
    {
      key: 8,
      label: 'Learning & Dev',
      icon: <BookIcon />,
      title: 'Learning & Development',
      subtitle: 'Training and development programs.',
    },
    {
      key: 9,
      label: 'Other Info',
      icon: <InfoIcon />,
      title: 'Other Information',
      subtitle: 'Additional skills and associations.',
    },
  ];

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await saveProfile({
        personalInfo: formData,
        children: childrenFormData,
        colleges: collegesFormData,
        graduates: graduatesFormData,
        eligibilities: eligibilitiesFormData,
        learningDevelopment: learningDevelopmentFormData,
        otherInformation: otherInformationFormData,
        vocational: vocationalFormData,
        workExperiences: workExperiencesFormData,
      });

      setEditOpen(false);
      setUploadStatus({
        message: 'Profile updated successfully!',
        type: 'success',
      });
      setNotificationOpen(true);

      // Refresh data
      refreshPerson();
      refreshSections();
    } catch (err) {
      console.error('Update failed:', err);
      setUploadStatus({
        message: err.message || 'Failed to update profile',
        type: 'error',
      });
      setNotificationOpen(true);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !employeeNumber) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        message: 'Please upload a valid image file (JPEG, PNG, GIF)',
        type: 'error',
      });
      setNotificationOpen(true);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus({
        message: 'File size must be less than 5MB',
        type: 'error',
      });
      setNotificationOpen(true);
      return;
    }

    const fd = new FormData();
    fd.append('profile', file);

    try {
      setUploadStatus({ message: 'Uploading...', type: 'info' });
      setNotificationOpen(true);

      const authHeaders = getAuthHeaders({ includeContentType: false });
      const res = await axios.post(
        `${API_BASE_URL}/upload-profile-picture/${employeeNumber}`,
        fd,
        {
          headers: {
            ...authHeaders.headers,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      const newPicturePath = res.data.filePath;
      refreshPerson();

      setUploadStatus({
        message: 'Profile picture updated successfully!',
        type: 'success',
      });
      setNotificationOpen(true);
    } catch (err) {
      console.error('Image upload failed:', err);
      const errorMessage =
        err.response?.data?.message ||
        'Failed to upload image. Please try again.';
      setUploadStatus({ message: errorMessage, type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handleRemovePicture = async () => {
    if (!person?.id) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/personalinfo/remove-profile-picture/${person.id}`,
        getAuthHeaders()
      );
      refreshPerson();
      setUploadStatus({
        message: 'Profile picture removed successfully!',
        type: 'success',
      });
      setNotificationOpen(true);
    } catch (err) {
      console.error('Remove picture failed:', err);
      setUploadStatus({ message: 'Failed to remove picture.', type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentSectionIndex(newValue);
  };

  const handleSectionChange = (index) => {
    setCurrentSectionIndex(index);
  };

  const handleNextSection = () => {
    if (currentSectionIndex < navigationSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleCardMouseMove = (cardId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCardMousePos({ [cardId]: { x, y } });
  };

  const handleCardMouseLeave = (cardId) => {
    setCardMousePos({ [cardId]: null });
  };

  const handleImageZoom = () => {
    setImageZoomOpen(true);
  };

  const handleImageZoomClose = () => {
    setImageZoomOpen(false);
  };

  const handleEditImageZoom = () => {
    setEditImageZoomOpen(true);
  };

  const handleEditImageZoomClose = () => {
    setEditImageZoomOpen(false);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleRefresh = () => {
    refreshPerson();
    refreshSections();
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const trigger = useScrollTrigger({
    threshold: 100,
    disableHysteresis: true,
  });

  const scrollToTop = () => {
    profileRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChildrenFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedChildren = [...childrenFormData];
    updatedChildren[index] = { ...updatedChildren[index], [name]: value };
    setChildrenFormData(updatedChildren);
  };

  const handleAddChild = () => {
    setChildrenFormData([
      ...childrenFormData,
      {
        childrenFirstName: '',
        childrenMiddleName: '',
        childrenLastName: '',
        childrenNameExtension: '',
        dateOfBirth: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveChild = (index) => {
    const updatedChildren = [...childrenFormData];
    updatedChildren.splice(index, 1);
    setChildrenFormData(updatedChildren);
  };

  const handleCollegeFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedColleges = [...collegesFormData];
    updatedColleges[index] = { ...updatedColleges[index], [name]: value };
    setCollegesFormData(updatedColleges);
  };

  const handleAddCollege = () => {
    setCollegesFormData([
      ...collegesFormData,
      {
        collegeNameOfSchool: '',
        collegeDegree: '',
        collegePeriodFrom: '',
        collegePeriodTo: '',
        collegeHighestAttained: '',
        collegeYearGraduated: '',
        collegeScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveCollege = (index) => {
    const updatedColleges = [...collegesFormData];
    updatedColleges.splice(index, 1);
    setCollegesFormData(updatedColleges);
  };

  const handleGraduateFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGraduates = [...graduatesFormData];
    updatedGraduates[index] = { ...updatedGraduates[index], [name]: value };
    setGraduatesFormData(updatedGraduates);
  };

  const handleAddGraduate = () => {
    setGraduatesFormData([
      ...graduatesFormData,
      {
        graduateNameOfSchool: '',
        graduateDegree: '',
        graduatePeriodFrom: '',
        graduatePeriodTo: '',
        graduateHighestLevel: '',
        graduateYearGraduated: '',
        graduateScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveGraduate = (index) => {
    const updatedGraduates = [...graduatesFormData];
    updatedGraduates.splice(index, 1);
    setGraduatesFormData(updatedGraduates);
  };

  const handleEligibilityFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEligibilities = [...eligibilitiesFormData];
    updatedEligibilities[index] = {
      ...updatedEligibilities[index],
      [name]: value,
    };
    setEligibilitiesFormData(updatedEligibilities);
  };

  const handleAddEligibility = () => {
    setEligibilitiesFormData([
      ...eligibilitiesFormData,
      {
        eligibilityName: '',
        eligibilityRating: '',
        eligibilityDateOfExam: '',
        eligibilityPlaceOfExam: '',
        licenseNumber: '',
        DateOfValidity: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveEligibility = (index) => {
    const updatedEligibilities = [...eligibilitiesFormData];
    updatedEligibilities.splice(index, 1);
    setEligibilitiesFormData(updatedEligibilities);
  };

  const handleLearningDevelopmentFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLearningDevelopment = [...learningDevelopmentFormData];
    updatedLearningDevelopment[index] = {
      ...updatedLearningDevelopment[index],
      [name]: value,
    };
    setLearningDevelopmentFormData(updatedLearningDevelopment);
  };

  const handleAddLearningDevelopment = () => {
    setLearningDevelopmentFormData([
      ...learningDevelopmentFormData,
      {
        titleOfProgram: '',
        dateFrom: '',
        dateTo: '',
        numberOfHours: '',
        typeOfLearningDevelopment: '',
        conductedSponsored: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveLearningDevelopment = (index) => {
    const updatedLearningDevelopment = [...learningDevelopmentFormData];
    updatedLearningDevelopment.splice(index, 1);
    setLearningDevelopmentFormData(updatedLearningDevelopment);
  };

  const handleOtherInformationFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOtherInformation = [...otherInformationFormData];
    updatedOtherInformation[index] = {
      ...updatedOtherInformation[index],
      [name]: value,
    };
    setOtherInformationFormData(updatedOtherInformation);
  };

  const handleAddOtherInformation = () => {
    setOtherInformationFormData([
      ...otherInformationFormData,
      {
        specialSkills: '',
        nonAcademicDistinctions: '',
        membershipInAssociation: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveOtherInformation = (index) => {
    const updatedOtherInformation = [...otherInformationFormData];
    updatedOtherInformation.splice(index, 1);
    setOtherInformationFormData(updatedOtherInformation);
  };

  const handleVocationalFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVocational = [...vocationalFormData];
    updatedVocational[index] = { ...updatedVocational[index], [name]: value };
    setVocationalFormData(updatedVocational);
  };

  const handleAddVocational = () => {
    setVocationalFormData([
      ...vocationalFormData,
      {
        vocationalNameOfSchool: '',
        vocationalDegree: '',
        vocationalPeriodFrom: '',
        vocationalPeriodTo: '',
        vocationalHighestAttained: '',
        vocationalYearGraduated: '',
        vocationalScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveVocational = (index) => {
    const updatedVocational = [...vocationalFormData];
    updatedVocational.splice(index, 1);
    setVocationalFormData(updatedVocational);
  };

  const handleWorkExperienceFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWorkExperiences = [...workExperiencesFormData];
    updatedWorkExperiences[index] = {
      ...updatedWorkExperiences[index],
      [name]: value,
    };
    setWorkExperiencesFormData(updatedWorkExperiences);
  };

  const handleAddWorkExperience = () => {
    setWorkExperiencesFormData([
      ...workExperiencesFormData,
      {
        workDateFrom: '',
        workDateTo: '',
        workPositionTitle: '',
        workCompany: '',
        workMonthlySalary: '',
        SalaryJobOrPayGrade: '',
        StatusOfAppointment: '',
        isGovtService: 'No',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveWorkExperience = (index) => {
    const updatedWorkExperiences = [...workExperiencesFormData];
    updatedWorkExperiences.splice(index, 1);
    setWorkExperiencesFormData(updatedWorkExperiences);
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'N/A';
    return `${numRating}%`;
  };

  const tabs = navigationSections;

  const formFields = {
    0: [
      {
        label: 'First Name',
        name: 'firstName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Middle Name',
        name: 'middleName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Last Name',
        name: 'lastName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Name Extension',
        name: 'nameExtension',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Date of Birth',
        name: 'birthDate',
        type: 'date',
        icon: <CakeIcon fontSize="small" />,
      },
      {
        label: 'Place of Birth',
        name: 'placeOfBirth',
        icon: <LocationOnIcon fontSize="small" />,
      },
    ],
    1: [
      {
        label: 'GSIS Number',
        name: 'gsisNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'Pag-IBIG Number',
        name: 'pagibigNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'PhilHealth Number',
        name: 'philhealthNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'SSS Number',
        name: 'sssNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'TIN Number',
        name: 'tinNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'Agency Employee Number',
        name: 'agencyEmployeeNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
    ],
    2: [
      {
        label: 'House & Lot Number',
        name: 'permanent_houseBlockLotNum',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Street',
        name: 'permanent_streetName',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Subdivision',
        name: 'permanent_subdivisionOrVillage',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Barangay',
        name: 'permanent_barangay',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'City/Municipality',
        name: 'permanent_cityOrMunicipality',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Province',
        name: 'permanent_provinceName',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Zip Code',
        name: 'permanent_zipcode',
        icon: <HomeIcon fontSize="small" />,
      },
    ],
    3: [
      {
        label: 'Telephone',
        name: 'telephone',
        icon: <CallIcon fontSize="small" />,
      },
      {
        label: 'Mobile',
        name: 'mobileNum',
        icon: <PhoneIcon fontSize="small" />,
      },
      {
        label: 'Email',
        name: 'emailAddress',
        icon: <EmailIcon fontSize="small" />,
      },
    ],
    4: [
      {
        label: 'Spouse First Name',
        name: 'spouseFirstName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Middle Name',
        name: 'spouseMiddleName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Last Name',
        name: 'spouseLastName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Occupation',
        name: 'spouseOccupation',
        icon: <WorkIcon fontSize="small" />,
      },
    ],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
  };

  const isLoading = loading || sectionsLoading;

  if (isLoading) {
    return (
      <ProfileWrapper ref={profileRef}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          width="100%"
        >
          <Box textAlign="center">
            <CircularProgress
              size={64}
              thickness={4}
              sx={{ color: colors.primary, mb: 3 }}
            />
            <Typography
              variant="h6"
              color={colors.textPrimary}
              fontWeight={600}
            >
              Loading Profile...
            </Typography>
            <Typography variant="body2" color={colors.textSecondary} mt={1}>
              Fetching data securely — this may take a moment.
            </Typography>
          </Box>
        </Box>
      </ProfileWrapper>
    );
  }

  const renderTabContentGrid = (tabIndex) => {
    return renderTabContentList(tabIndex);
  };

  const renderContentSection = (sectionIndex) => {
    const section = navigationSections[sectionIndex];
    if (!section) return null;

    switch (sectionIndex) {
      case 0: // Personal Info
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('personal', e)}
            onMouseLeave={() => handleCardMouseLeave('personal')}
            mouseX={cardMousePos.personal?.x}
            mouseY={cardMousePos.personal?.y}
          >
            <CardInner>
              <InfoGrid>
                <InfoGroup>
                  <InfoLabel>First Name</InfoLabel>
                  <InfoValue>{person?.firstName || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Middle Name</InfoLabel>
                  <InfoValue>{person?.middleName || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Last Name</InfoLabel>
                  <InfoValue>{person?.lastName || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Name Extension</InfoLabel>
                  <InfoValue>{person?.nameExtension || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Date of Birth</InfoLabel>
                  <InfoValue>
                    {person?.birthDate ? formatDate(person.birthDate) : '—'}
                  </InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Place of Birth</InfoLabel>
                  <InfoValue>{person?.placeOfBirth || '—'}</InfoValue>
                </InfoGroup>
              </InfoGrid>
            </CardInner>
          </DataCard>
        );
      case 1: // Gov. IDs
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('govids', e)}
            onMouseLeave={() => handleCardMouseLeave('govids')}
            mouseX={cardMousePos.govids?.x}
            mouseY={cardMousePos.govids?.y}
          >
            <CardInner>
              <InfoGrid>
                <InfoGroup>
                  <InfoLabel>GSIS No.</InfoLabel>
                  <InfoValue>{person?.gsisNum || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Pag-IBIG No.</InfoLabel>
                  <InfoValue>{person?.pagibigNum || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>PhilHealth No.</InfoLabel>
                  <InfoValue>{person?.philhealthNum || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>SSS No.</InfoLabel>
                  <InfoValue>{person?.sssNum || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>TIN No.</InfoLabel>
                  <InfoValue>{person?.tinNum || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Agency Employee No.</InfoLabel>
                  <InfoValue>{person?.agencyEmployeeNum || '—'}</InfoValue>
                </InfoGroup>
              </InfoGrid>
            </CardInner>
          </DataCard>
        );
      case 2: // Contact & Address
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('contact', e)}
            onMouseLeave={() => handleCardMouseLeave('contact')}
            mouseX={cardMousePos.contact?.x}
            mouseY={cardMousePos.contact?.y}
          >
            <CardInner>
              <InfoGrid>
                <InfoGroup>
                  <InfoLabel>Mobile Number</InfoLabel>
                  <InfoValue>{person?.mobileNum || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Telephone</InfoLabel>
                  <InfoValue>{person?.telephone || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Email Address</InfoLabel>
                  <InfoValue>{person?.emailAddress || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>House/Block/Lot</InfoLabel>
                  <InfoValue>
                    {person?.permanent_houseBlockLotNum || '—'}
                  </InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Street</InfoLabel>
                  <InfoValue>{person?.permanent_streetName || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Subdivision</InfoLabel>
                  <InfoValue>
                    {person?.permanent_subdivisionOrVillage || '—'}
                  </InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Barangay</InfoLabel>
                  <InfoValue>{person?.permanent_barangay || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>City/Municipality</InfoLabel>
                  <InfoValue>
                    {person?.permanent_cityOrMunicipality || '—'}
                  </InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Province</InfoLabel>
                  <InfoValue>{person?.permanent_provinceName || '—'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Zip Code</InfoLabel>
                  <InfoValue>{person?.permanent_zipcode || '—'}</InfoValue>
                </InfoGroup>
              </InfoGrid>
            </CardInner>
          </DataCard>
        );
      case 3: // Family
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('family', e)}
            onMouseLeave={() => handleCardMouseLeave('family')}
            mouseX={cardMousePos.family?.x}
            mouseY={cardMousePos.family?.y}
          >
            <CardInner>
              <Typography
                variant="h6"
                sx={{
                  marginBottom: '15px',
                  color: colors.primary,
                  fontSize: '1.1rem',
                }}
              >
                Spouse
              </Typography>
              <InfoGrid sx={{ marginBottom: '25px' }}>
                <InfoGroup>
                  <InfoLabel>Name</InfoLabel>
                  <InfoValue>
                    {person?.spouseFirstName ||
                    person?.spouseMiddleName ||
                    person?.spouseLastName
                      ? `${person.spouseFirstName || ''} ${
                          person.spouseMiddleName || ''
                        } ${person.spouseLastName || ''}`.trim()
                      : '—'}
                  </InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>Occupation</InfoLabel>
                  <InfoValue>{person?.spouseOccupation || '—'}</InfoValue>
                </InfoGroup>
              </InfoGrid>
            </CardInner>
          </DataCard>
        );
      case 4: // Education
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('education', e)}
            onMouseLeave={() => handleCardMouseLeave('education')}
            mouseX={cardMousePos.education?.x}
            mouseY={cardMousePos.education?.y}
          >
            <CardInner>
              <Timeline>
                {colleges.length > 0 &&
                  colleges.map((college, idx) => (
                    <TimelineItem key={college.id || idx}>
                      <TimelineDate>
                        {college.collegePeriodFrom || 'N/A'} -{' '}
                        {college.collegePeriodTo || 'Present'}
                      </TimelineDate>
                      <TimelineTitle>
                        {college.collegeDegree || '—'}
                      </TimelineTitle>
                      <TimelineOrg>
                        {college.collegeNameOfSchool || '—'}
                      </TimelineOrg>
                    </TimelineItem>
                  ))}
                {person?.secondaryNameOfSchool && (
                  <TimelineItem>
                    <TimelineDate>Secondary</TimelineDate>
                    <TimelineTitle>
                      {person.secondaryDegree || 'High School'}
                    </TimelineTitle>
                    <TimelineOrg>{person.secondaryNameOfSchool}</TimelineOrg>
                  </TimelineItem>
                )}
                {person?.elementaryNameOfSchool && (
                  <TimelineItem sx={{ paddingBottom: 0 }}>
                    <TimelineDate>Elementary</TimelineDate>
                    <TimelineTitle>
                      {person.elementaryDegree || 'Elementary'}
                    </TimelineTitle>
                    <TimelineOrg>{person.elementaryNameOfSchool}</TimelineOrg>
                  </TimelineItem>
                )}
              </Timeline>
            </CardInner>
          </DataCard>
        );
      case 5: // Children
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('children', e)}
            onMouseLeave={() => handleCardMouseLeave('children')}
            mouseX={cardMousePos.children?.x}
            mouseY={cardMousePos.children?.y}
          >
            <CardInner>
              {children.length > 0 ? (
                <InfoGrid>
                  {children.map((child, idx) => (
                    <InfoGroup key={child.id || idx}>
                      <InfoLabel>Child {idx + 1}</InfoLabel>
                      <InfoValue>
                        {`${child.childrenFirstName || ''} ${
                          child.childrenMiddleName || ''
                        } ${child.childrenLastName || ''} ${
                          child.childrenNameExtension || ''
                        }`.trim() || '—'}
                        {child.dateOfBirth &&
                          ` (Age: ${getAge(child.dateOfBirth)})`}
                      </InfoValue>
                    </InfoGroup>
                  ))}
                </InfoGrid>
              ) : (
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  textAlign="center"
                  py={2}
                >
                  No children records found
                </Typography>
              )}
            </CardInner>
          </DataCard>
        );
      case 6: // Work Experience
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('work', e)}
            onMouseLeave={() => handleCardMouseLeave('work')}
            mouseX={cardMousePos.work?.x}
            mouseY={cardMousePos.work?.y}
          >
            <CardInner>
              {workExperiences.length > 0 ? (
                <Timeline>
                  {workExperiences.map((workExp, idx) => (
                    <TimelineItem
                      key={workExp.id || idx}
                      sx={
                        idx === workExperiences.length - 1
                          ? { paddingBottom: 0 }
                          : {}
                      }
                    >
                      <TimelineDate>
                        {workExp.workDateFrom
                          ? formatDate(workExp.workDateFrom)
                          : 'N/A'}{' '}
                        -{' '}
                        {workExp.workDateTo
                          ? formatDate(workExp.workDateTo)
                          : 'Present'}
                      </TimelineDate>
                      <TimelineTitle>
                        {workExp.workPositionTitle || '—'}
                      </TimelineTitle>
                      <TimelineOrg>{workExp.workCompany || '—'}</TimelineOrg>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  textAlign="center"
                  py={2}
                >
                  No work experience records found
                </Typography>
              )}
            </CardInner>
          </DataCard>
        );
      case 7: // Eligibility
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('eligibility', e)}
            onMouseLeave={() => handleCardMouseLeave('eligibility')}
            mouseX={cardMousePos.eligibility?.x}
            mouseY={cardMousePos.eligibility?.y}
          >
            <CardInner>
              {eligibilities.length > 0 ? (
                <InfoGrid>
                  {eligibilities.map((eligibility, idx) => (
                    <React.Fragment key={eligibility.id || idx}>
                      <InfoGroup>
                        <InfoLabel>Eligibility</InfoLabel>
                        <InfoValue
                          sx={{ color: colors.primary, fontWeight: 700 }}
                        >
                          {eligibility.eligibilityName || '—'}
                        </InfoValue>
                      </InfoGroup>
                      <InfoGroup>
                        <InfoLabel>Rating</InfoLabel>
                        <InfoValue>
                          {formatRating(eligibility.eligibilityRating)}
                        </InfoValue>
                      </InfoGroup>
                      <InfoGroup>
                        <InfoLabel>Date of Exam</InfoLabel>
                        <InfoValue>
                          {eligibility.eligibilityDateOfExam
                            ? formatDate(eligibility.eligibilityDateOfExam)
                            : '—'}
                        </InfoValue>
                      </InfoGroup>
                      <InfoGroup>
                        <InfoLabel>Place of Exam</InfoLabel>
                        <InfoValue>
                          {eligibility.eligibilityPlaceOfExam || '—'}
                        </InfoValue>
                      </InfoGroup>
                    </React.Fragment>
                  ))}
                </InfoGrid>
              ) : (
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  textAlign="center"
                  py={2}
                >
                  No eligibility records found
                </Typography>
              )}
            </CardInner>
          </DataCard>
        );
      case 8: // Learning & Development
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('learning', e)}
            onMouseLeave={() => handleCardMouseLeave('learning')}
            mouseX={cardMousePos.learning?.x}
            mouseY={cardMousePos.learning?.y}
          >
            <CardInner>
              {learningDevelopment.length > 0 ? (
                <Timeline>
                  {learningDevelopment.map((learning, idx) => (
                    <TimelineItem
                      key={learning.id || idx}
                      sx={
                        idx === learningDevelopment.length - 1
                          ? { paddingBottom: 0 }
                          : {}
                      }
                    >
                      <TimelineDate>
                        {learning.dateFrom
                          ? formatDate(learning.dateFrom)
                          : 'N/A'}{' '}
                        -{' '}
                        {learning.dateTo
                          ? formatDate(learning.dateTo)
                          : 'Present'}
                      </TimelineDate>
                      <TimelineTitle>
                        {learning.titleOfProgram || '—'}
                      </TimelineTitle>
                      <TimelineOrg>
                        {learning.typeOfLearningDevelopment || '—'}{' '}
                        {learning.numberOfHours &&
                          `• ${learning.numberOfHours} hours`}
                      </TimelineOrg>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  textAlign="center"
                  py={2}
                >
                  No learning and development records found
                </Typography>
              )}
            </CardInner>
          </DataCard>
        );
      case 9: // Other Information
        return (
          <DataCard
            onMouseMove={(e) => handleCardMouseMove('other', e)}
            onMouseLeave={() => handleCardMouseLeave('other')}
            mouseX={cardMousePos.other?.x}
            mouseY={cardMousePos.other?.y}
          >
            <CardInner>
              {otherInformation.length > 0 ? (
                <InfoGrid>
                  {otherInformation.map((info, idx) => (
                    <React.Fragment key={info.id || idx}>
                      {info.specialSkills && (
                        <InfoGroup>
                          <InfoLabel>Special Skills</InfoLabel>
                          <InfoValue>{info.specialSkills}</InfoValue>
                        </InfoGroup>
                      )}
                      {info.nonAcademicDistinctions && (
                        <InfoGroup>
                          <InfoLabel>Non-Academic Distinctions</InfoLabel>
                          <InfoValue>{info.nonAcademicDistinctions}</InfoValue>
                        </InfoGroup>
                      )}
                      {info.membershipInAssociation && (
                        <InfoGroup>
                          <InfoLabel>Membership in Association</InfoLabel>
                          <InfoValue>{info.membershipInAssociation}</InfoValue>
                        </InfoGroup>
                      )}
                    </React.Fragment>
                  ))}
                </InfoGrid>
              ) : (
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  textAlign="center"
                  py={2}
                >
                  No other information records found
                </Typography>
              )}
            </CardInner>
          </DataCard>
        );
      default:
        return null;
    }
  };

  const renderTabContentList = (tabIndex) => {
    if (tabIndex === 4) {
      return (
        <Box>
          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <TabPanel>
              <Box>
                <InfoItem>
                  <InfoLabel variant="body2">
                    <SchoolIcon fontSize="small" />
                    Elementary School:
                  </InfoLabel>
                  <InfoValue variant="body1">
                    {person?.elementaryNameOfSchool || '—'}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel variant="body2">
                    <SchoolIcon fontSize="small" />
                    Elementary Degree:
                  </InfoLabel>
                  <InfoValue variant="body1">
                    {person?.elementaryDegree || '—'}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel variant="body2">
                    <SchoolIcon fontSize="small" />
                    Secondary School:
                  </InfoLabel>
                  <InfoValue variant="body1">
                    {person?.secondaryNameOfSchool || '—'}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel variant="body2">
                    <SchoolIcon fontSize="small" />
                    Secondary Degree:
                  </InfoLabel>
                  <InfoValue variant="body1">
                    {person?.secondaryDegree || '—'}
                  </InfoValue>
                </InfoItem>
              </Box>
            </TabPanel>
          )}

          {educationSubTabValue === 1 && (
            <TabPanel>
              <ScrollableContainer>
                {colleges.length > 0 ? (
                  <List>
                    {colleges.map((college) => (
                      <React.Fragment key={college.id}>
                        <CollegeListItem>
                          <MuiListItemIcon>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                backgroundColor: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <SchoolRoundedIcon
                                sx={{ color: colors.textLight, fontSize: 20 }}
                              />
                            </Box>
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: colors.textPrimary,
                                  mb: 0.5,
                                }}
                              >
                                {college.collegeNameOfSchool}
                              </Typography>
                            }
                            secondary={
                              college.collegeDegree ? (
                                <Typography
                                  component="span"
                                  sx={{
                                    display: 'block',
                                    color: colors.textPrimary,
                                  }}
                                >
                                  {college.collegeDegree} (
                                  {college.collegePeriodFrom || 'N/A'} -{' '}
                                  {college.collegePeriodTo || 'N/A'})
                                </Typography>
                              ) : (
                                'No degree information'
                              )
                            }
                          />
                        </CollegeListItem>
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No college records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add college records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </TabPanel>
          )}

          {educationSubTabValue === 2 && (
            <TabPanel>
              <ScrollableContainer>
                {graduates.length > 0 ? (
                  <List>
                    {graduates.map((graduate) => (
                      <React.Fragment key={graduate.id}>
                        <GraduateListItem>
                          <MuiListItemIcon>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                backgroundColor: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <PsychologyIcon
                                sx={{ color: colors.textLight, fontSize: 20 }}
                              />
                            </Box>
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: colors.textPrimary,
                                  mb: 0.5,
                                }}
                              >
                                {graduate.graduateNameOfSchool}
                              </Typography>
                            }
                            secondary={
                              graduate.graduateDegree ? (
                                <Typography
                                  component="span"
                                  sx={{
                                    display: 'block',
                                    color: colors.textPrimary,
                                  }}
                                >
                                  {graduate.graduateDegree} (
                                  {graduate.graduatePeriodFrom || 'N/A'} -{' '}
                                  {graduate.graduatePeriodTo || 'N/A'})
                                </Typography>
                              ) : (
                                'No degree information'
                              )
                            }
                          />
                        </GraduateListItem>
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No graduate studies records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add graduate studies records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </TabPanel>
          )}

          {educationSubTabValue === 3 && (
            <TabPanel>
              <ScrollableContainer>
                {vocational.length > 0 ? (
                  <List>
                    {vocational.map((voc) => (
                      <React.Fragment key={voc.id}>
                        <VocationalListItem>
                          <MuiListItemIcon>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                backgroundColor: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <ConstructionIcon
                                sx={{ color: colors.textLight, fontSize: 20 }}
                              />
                            </Box>
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: colors.textPrimary,
                                  mb: 0.5,
                                }}
                              >
                                {voc.vocationalNameOfSchool}
                              </Typography>
                            }
                            secondary={
                              voc.vocationalDegree ? (
                                <Typography
                                  component="span"
                                  sx={{
                                    display: 'block',
                                    color: colors.textPrimary,
                                  }}
                                >
                                  {voc.vocationalDegree} (
                                  {voc.vocationalPeriodFrom || 'N/A'} -{' '}
                                  {voc.vocationalPeriodTo || 'N/A'})
                                </Typography>
                              ) : (
                                'No degree information'
                              )
                            }
                          />
                        </VocationalListItem>
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No vocational records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add vocational records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </TabPanel>
          )}
        </Box>
      );
    }

    if (tabIndex === 5) {
      if (!children || children.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No children records found
            </Typography>
          </Box>
        );
      }

      const formatChildName = (child) =>
        [
          child.childrenFirstName,
          child.childrenMiddleName,
          child.childrenLastName,
          child.childrenNameExtension,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

      return (
        <Box>
          {children.map((child, index) => (
            <ChildListItem key={child.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: colors.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    {formatChildName(child) || `Child ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 140 }}>Full Name</InfoLabel>
                      <InfoValue>{formatChildName(child) || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 140 }}>
                        Date of Birth
                      </InfoLabel>
                      <InfoValue>
                        {child.dateOfBirth
                          ? `${formatDate(child.dateOfBirth)} (Age: ${getAge(
                              child.dateOfBirth
                            )})`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </ChildListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 7) {
      if (!eligibilities || eligibilities.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No eligibility records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {eligibilities.map((eligibility, index) => (
            <EligibilityListItem key={eligibility.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: colors.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    {eligibility.eligibilityName || `Eligibility ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box sx={{ ml: { xs: 0, md: 0 } }}>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>Rating</InfoLabel>
                      <InfoValue>
                        {eligibility.eligibilityRating
                          ? formatRating(eligibility.eligibilityRating)
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>Date of Exam</InfoLabel>
                      <InfoValue>
                        {eligibility.eligibilityDateOfExam
                          ? formatDate(eligibility.eligibilityDateOfExam)
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>
                        Place of Exam
                      </InfoLabel>
                      <InfoValue>
                        {eligibility.eligibilityPlaceOfExam || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>
                        License Number
                      </InfoLabel>
                      <InfoValue>{eligibility.licenseNumber || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>Valid Until</InfoLabel>
                      <InfoValue>
                        {eligibility.DateOfValidity
                          ? formatDate(eligibility.DateOfValidity)
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </EligibilityListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 8) {
      if (!learningDevelopment || learningDevelopment.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No learning and development records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {learningDevelopment.map((learning, index) => (
            <LearningDevelopmentListItem key={learning.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: colors.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    {learning.titleOfProgram || `Program ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Type</InfoLabel>
                      <InfoValue>
                        {learning.typeOfLearningDevelopment || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Number of Hours
                      </InfoLabel>
                      <InfoValue>{learning.numberOfHours || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Period</InfoLabel>
                      <InfoValue>
                        {learning.dateFrom && learning.dateTo
                          ? `${formatDate(learning.dateFrom)} - ${formatDate(
                              learning.dateTo
                            )}`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Conducted / Sponsored by
                      </InfoLabel>
                      <InfoValue>
                        {learning.conductedSponsored || '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </LearningDevelopmentListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 9) {
      if (!otherInformation || otherInformation.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No other information records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {otherInformation.map((info, index) => (
            <OtherInformationListItem key={info.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: colors.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    {`Entry ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 180 }}>
                        Special Skills
                      </InfoLabel>
                      <InfoValue>{info.specialSkills || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 180 }}>
                        Non-Academic Distinctions
                      </InfoLabel>
                      <InfoValue>
                        {info.nonAcademicDistinctions || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 180 }}>
                        Membership in Association
                      </InfoLabel>
                      <InfoValue>
                        {info.membershipInAssociation || '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </OtherInformationListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 6) {
      if (!workExperiences || workExperiences.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No work experience records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {workExperiences.map((workExp, index) => (
            <WorkExperienceListItem key={workExp.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: colors.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    {workExp.workPositionTitle ||
                      `Work Experience ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Company</InfoLabel>
                      <InfoValue>{workExp.workCompany || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Duration</InfoLabel>
                      <InfoValue>
                        {workExp.workDateFrom && workExp.workDateTo
                          ? `${formatDate(workExp.workDateFrom)} - ${formatDate(
                              workExp.workDateTo
                            )}`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Monthly Salary
                      </InfoLabel>
                      <InfoValue>
                        {workExp.workMonthlySalary
                          ? `₱${parseFloat(
                              workExp.workMonthlySalary
                            ).toLocaleString()}`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Salary Job / Pay Grade
                      </InfoLabel>
                      <InfoValue>
                        {workExp.SalaryJobOrPayGrade || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Status of Appointment
                      </InfoLabel>
                      <InfoValue>
                        {workExp.StatusOfAppointment || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Service Type</InfoLabel>
                      <InfoValue>
                        {workExp.isGovtService
                          ? workExp.isGovtService === 'Yes'
                            ? 'Government'
                            : 'Private'
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </WorkExperienceListItem>
          ))}
        </Box>
      );
    }

    const fields = formFields[tabIndex] || [];

    return (
      <EligibilityCard>
        <List disablePadding>
          <EligibilityListItem
            sx={{
              border: 'none',
              boxShadow: 'none',
              backgroundColor: colors.secondary,
            }}
          >
            <MuiListItemText
              primary={
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: colors.textPrimary,
                    mb: 1,
                  }}
                >
                  {tabs[currentSectionIndex]?.label || 'Details'}
                </Typography>
              }
              secondary={
                <Box>
                  {fields.map((field, idx) => (
                    <InfoItem key={idx} sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel variant="body2" sx={{ minWidth: 160 }}>
                        {field.icon}
                        {field.label}:
                      </InfoLabel>
                      <InfoValue variant="body1">
                        {person?.[field.name] || '—'}
                      </InfoValue>
                    </InfoItem>
                  ))}
                </Box>
              }
            />
          </EligibilityListItem>
        </List>
      </EligibilityCard>
    );
  };

  const renderFormFields = () => {
    if (currentSectionIndex === 4) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Education Information
          </Typography>

          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Elementary & Secondary Education
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                This section displays your elementary and secondary education
                information.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Elementary School"
                    name="elementaryNameOfSchool"
                    value={formData.elementaryNameOfSchool || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Elementary Degree"
                    name="elementaryDegree"
                    value={formData.elementaryDegree || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Secondary School"
                    name="secondaryNameOfSchool"
                    value={formData.secondaryNameOfSchool || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Secondary Degree"
                    name="secondaryDegree"
                    value={formData.secondaryDegree || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {educationSubTabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                College Information
              </Typography>

              {collegesFormData.length > 0 ? (
                <Box>
                  {collegesFormData.map((college, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          College {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveCollege(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="College Name"
                            name="collegeNameOfSchool"
                            value={college.collegeNameOfSchool || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="collegeDegree"
                            value={college.collegeDegree || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="collegePeriodFrom"
                            value={college.collegePeriodFrom || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="collegePeriodTo"
                            value={college.collegePeriodTo || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Attained"
                            name="collegeHighestAttained"
                            value={college.collegeHighestAttained || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="collegeYearGraduated"
                            value={college.collegeYearGraduated || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="collegeScholarshipAcademicHonorsReceived"
                            value={
                              college.collegeScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No college records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCollege}
                >
                  Add College
                </ActionButton>
              </Box>
            </Box>
          )}

          {educationSubTabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Graduate Studies Information
              </Typography>

              {graduatesFormData.length > 0 ? (
                <Box>
                  {graduatesFormData.map((graduate, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Graduate Studies {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveGraduate(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="School Name"
                            name="graduateNameOfSchool"
                            value={graduate.graduateNameOfSchool || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="graduateDegree"
                            value={graduate.graduateDegree || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="graduatePeriodFrom"
                            value={graduate.graduatePeriodFrom || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="graduatePeriodTo"
                            value={graduate.graduatePeriodTo || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Level"
                            name="graduateHighestLevel"
                            value={graduate.graduateHighestLevel || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="graduateYearGraduated"
                            value={graduate.graduateYearGraduated || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="graduateScholarshipAcademicHonorsReceived"
                            value={
                              graduate.graduateScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No graduate studies records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddGraduate}
                >
                  Add Graduate Studies
                </ActionButton>
              </Box>
            </Box>
          )}

          {educationSubTabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Vocational Information
              </Typography>

              {vocationalFormData.length > 0 ? (
                <Box>
                  {vocationalFormData.map((voc, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Vocational {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveVocational(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="School Name"
                            name="vocationalNameOfSchool"
                            value={voc.vocationalNameOfSchool || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="vocationalDegree"
                            value={voc.vocationalDegree || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="vocationalPeriodFrom"
                            value={voc.vocationalPeriodFrom || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="vocationalPeriodTo"
                            value={voc.vocationalPeriodTo || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Attained"
                            name="vocationalHighestAttained"
                            value={voc.vocationalHighestAttained || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="vocationalYearGraduated"
                            value={voc.vocationalYearGraduated || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="vocationalScholarshipAcademicHonorsReceived"
                            value={
                              voc.vocationalScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No vocational records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddVocational}
                >
                  Add Vocational
                </ActionButton>
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    if (currentSectionIndex === 5) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Children Information
          </Typography>

          {childrenFormData.length > 0 ? (
            <Box>
              {childrenFormData.map((child, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Child {index + 1}</Typography>
                    <IconButton
                      onClick={() => handleRemoveChild(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="First Name"
                        name="childrenFirstName"
                        value={child.childrenFirstName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Middle Name"
                        name="childrenMiddleName"
                        value={child.childrenMiddleName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Last Name"
                        name="childrenLastName"
                        value={child.childrenLastName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Name Extension"
                        name="childrenNameExtension"
                        value={child.childrenNameExtension || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                        placeholder="e.g., Jr., Sr., III"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={child.dateOfBirth || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No children records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddChild}
            >
              Add Child
            </ActionButton>
          </Box>
        </Box>
      );
    }

    if (currentSectionIndex === 7) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Eligibility Information
          </Typography>

          {eligibilitiesFormData.length > 0 ? (
            <Box>
              {eligibilitiesFormData.map((eligibility, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Eligibility {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveEligibility(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Eligibility Name"
                        name="eligibilityName"
                        value={eligibility.eligibilityName || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            mb: 0.5,
                            color: '#333',
                            display: 'block',
                          }}
                        >
                          Rating
                        </Typography>
                        <PercentageInput
                          value={eligibility.eligibilityRating || ''}
                          onChange={(value) =>
                            handleEligibilityFormChange(index, {
                              target: { name: 'eligibilityRating', value },
                            })
                          }
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date of Exam"
                        name="eligibilityDateOfExam"
                        type="date"
                        value={eligibility.eligibilityDateOfExam || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Place of Exam"
                        name="eligibilityPlaceOfExam"
                        value={eligibility.eligibilityPlaceOfExam || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="License Number"
                        name="licenseNumber"
                        value={eligibility.licenseNumber || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date of Validity"
                        name="DateOfValidity"
                        type="date"
                        value={eligibility.DateOfValidity || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No eligibility records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEligibility}
            >
              Add Eligibility
            </ActionButton>
          </Box>
        </Box>
      );
    }

    if (currentSectionIndex === 8) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Learning and Development Information
          </Typography>

          {learningDevelopmentFormData.length > 0 ? (
            <Box>
              {learningDevelopmentFormData.map((learning, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Learning Program {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveLearningDevelopment(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Title of Program"
                        name="titleOfProgram"
                        value={learning.titleOfProgram || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date From"
                        name="dateFrom"
                        type="date"
                        value={learning.dateFrom || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date To"
                        name="dateTo"
                        type="date"
                        value={learning.dateTo || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Number of Hours"
                        name="numberOfHours"
                        value={learning.numberOfHours || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Type of Learning Development"
                        name="typeOfLearningDevelopment"
                        value={learning.typeOfLearningDevelopment || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Conducted/Sponsored"
                        name="conductedSponsored"
                        value={learning.conductedSponsored || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No learning and development records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLearningDevelopment}
            >
              Add Learning Program
            </ActionButton>
          </Box>
        </Box>
      );
    }

    if (currentSectionIndex === 9) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Other Information
          </Typography>

          {otherInformationFormData.length > 0 ? (
            <Box>
              {otherInformationFormData.map((info, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Information {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveOtherInformation(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Special Skills"
                        name="specialSkills"
                        value={info.specialSkills || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Non-Academic Distinctions"
                        name="nonAcademicDistinctions"
                        value={info.nonAcademicDistinctions || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Membership in Association"
                        name="membershipInAssociation"
                        value={info.membershipInAssociation || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No other information records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddOtherInformation}
            >
              Add Other Information
            </ActionButton>
          </Box>
        </Box>
      );
    }

    if (currentSectionIndex === 6) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Work Experience Information
          </Typography>

          {workExperiencesFormData.length > 0 ? (
            <Box>
              {workExperiencesFormData.map((workExp, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Work Experience {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveWorkExperience(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date From"
                        name="workDateFrom"
                        type="date"
                        value={workExp.workDateFrom || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date To"
                        name="workDateTo"
                        type="date"
                        value={workExp.workDateTo || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Position Title"
                        name="workPositionTitle"
                        value={workExp.workPositionTitle || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Company"
                        name="workCompany"
                        value={workExp.workCompany || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Monthly Salary"
                        name="workMonthlySalary"
                        value={workExp.workMonthlySalary || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Salary Job/Pay Grade"
                        name="SalaryJobOrPayGrade"
                        value={workExp.SalaryJobOrPayGrade || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Status of Appointment"
                        name="StatusOfAppointment"
                        value={workExp.StatusOfAppointment || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Government Service</InputLabel>
                        <Select
                          name="isGovtService"
                          value={workExp.isGovtService || 'No'}
                          onChange={(e) =>
                            handleWorkExperienceFormChange(index, e)
                          }
                          label="Government Service"
                        >
                          <MuiMenuItem value="Yes">Yes</MuiMenuItem>
                          <MuiMenuItem value="No">No</MuiMenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No work experience records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddWorkExperience}
            >
              Add Work Experience
            </ActionButton>
          </Box>
        </Box>
      );
    }

    const sectionToFormFieldMap = {
      0: 0,
      1: 1,
      2: 2,
      3: 4,
      4: 5,
      5: 6,
      6: 10,
      7: 7,
      8: 8,
      9: 9,
    };
    const formFieldIndex =
      sectionToFormFieldMap[currentSectionIndex] ?? currentSectionIndex;
    const fields = formFields[formFieldIndex] || [];

    return (
      <Grid container spacing={3}>
        {fields.map((field, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <FormField
              fullWidth
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleFormChange}
              variant="outlined"
              disabled={field.disabled}
              type={field.type || 'text'}
              InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : '109, 35, 35';
  };

  const currentSection =
    navigationSections[currentSectionIndex] || navigationSections[0];

  return (
    <ProfileWrapper ref={profileRef}>
      {/* TOP NAVIGATION BAR */}
      <ProfileAppBar position="static" elevation={0}>
        <ProfileToolbar
          sx={{
            minHeight: 140,
            display: 'flex',
            alignItems: 'center',
            py: 3,
          }}
        >
          <BrandSection>
            {/* Avatar & Name */}
            <Box
              sx={{ position: 'relative', cursor: 'pointer' }}
              onClick={handleImageZoom}
            >
              <Avatar
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid #E5E5E5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {!profilePicture && (
                  <PersonIcon sx={{ color: colors.primary, fontSize: 40 }} />
                )}
              </Avatar>
              <input
                accept="image/*"
                id="profile-picture-upload-nav"
                type="file"
                style={{ display: 'none' }}
                onChange={handlePictureChange}
              />
              <IconButton
                component="label"
                htmlFor="profile-picture-upload-nav"
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.primary,
                  color: '#fff',
                  width: 28,
                  height: 28,
                  padding: 0,
                  '&:hover': { backgroundColor: colors.primaryDark },
                  '& .MuiSvgIcon-root': { fontSize: 16 },
                }}
              >
                <CameraAltIcon />
              </IconButton>
            </Box>
            <ProfileInfoCompact>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.75rem',
                  color: colors.primary,
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {person
                  ? `${person.firstName} ${person.lastName}`.trim()
                  : 'Employee Profile'}
              </Typography>
              <Typography
                variant="body2"
                color={colors.textSecondary}
                sx={{
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                {person?.agencyEmployeeNum
                  ? `Employee ID: ${person.agencyEmployeeNum}`
                  : '—'}
              </Typography>
            </ProfileInfoCompact>
          </BrandSection>

          {/* Global Actions */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                color="inherit"
                sx={{
                  width: 44,
                  height: 44,
                  border: '1px solid #E5E5E5',
                  '&:hover': {
                    borderColor: colors.primary,
                    backgroundColor: alpha(colors.primary, 0.05),
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <ActionButton
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditOpen}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '0.95rem',
                height: 44,
              }}
            >
              Edit Profile
            </ActionButton>
          </Box>
        </ProfileToolbar>
      </ProfileAppBar>

      <Container sx={{ mt: 3, mb: 2 }}>
        <PageHeaderBox>
          <HeaderTitles>
            <HeaderTitle>{currentSection?.title || 'Profile'}</HeaderTitle>
            <HeaderSubtitle>
              {currentSection?.subtitle || 'View your profile information'}
            </HeaderSubtitle>
          </HeaderTitles>
          <NavControls>
            <NavButton
              onClick={handlePrevSection}
              disabled={currentSectionIndex === 0}
              title="Previous Section"
            >
              <ArrowBackIosIcon fontSize="small" />
            </NavButton>
            <NavButton
              onClick={handleNextSection}
              disabled={currentSectionIndex === navigationSections.length - 1}
              title="Next Section"
            >
              <ArrowForwardIosIcon fontSize="small" />
            </NavButton>
          </NavControls>
        </PageHeaderBox>
      </Container>

      {/* NAVIGATION TABS BAR */}
      <NavTabsContainer>
        <NavTabs
          value={currentSectionIndex}
          onChange={(e, newValue) => handleSectionChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Profile Sections"
        >
          {navigationSections.map((section) => (
            <Tab key={section.key} label={section.label} icon={section.icon} />
          ))}
        </NavTabs>
      </NavTabsContainer>

      {/* MAIN CONTENT AREA */}
      <MainContent>
        <Box>
          {navigationSections.map((section, index) => (
            <ContentSection
              key={section.key}
              active={currentSectionIndex === index}
            >
              {renderContentSection(index)}
            </ContentSection>
          ))}
        </Box>
      </MainContent>

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={editOpen} onClick={handleEditClose}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Edit Profile</ModalTitle>
              <IconButton
                onClick={handleEditClose}
                sx={{
                  color: colors.textLight,
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </ModalHeader>

            <EditModalPictureSection>
              <EditModalAvatar
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture"
                onClick={handleEditImageZoom}
              >
                {!profilePicture && <PersonIcon sx={{ fontSize: 60 }} />}
              </EditModalAvatar>
              <EditModalPictureInfo>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: colors.primary, mb: 1 }}
                >
                  Profile Picture
                </Typography>
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  sx={{ mb: 2 }}
                >
                  Click on image to preview. Upload a professional headshot (max
                  5MB, JPEG/PNG)
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    icon={<PhotoSizeSelectActualIcon fontSize="small" />}
                    label="High Quality"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<CropOriginalIcon fontSize="small" />}
                    label="Recommended: 400x400px"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.secondary, 0.5),
                      color: colors.textSecondary,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </EditModalPictureInfo>
              <EditModalPictureActions>
                <input
                  accept="image/*"
                  id="profile-picture-upload-modal"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handlePictureChange}
                />
                <label htmlFor="profile-picture-upload-modal">
                  <ActionButton
                    component="span"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Photo
                  </ActionButton>
                </label>
                <ActionButton
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemovePicture}
                  fullWidth
                >
                  Remove Photo
                </ActionButton>
              </EditModalPictureActions>
            </EditModalPictureSection>

            <ModalBody>
              <Box sx={{ mb: 3 }}>
                <CustomTabs
                  value={currentSectionIndex}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {tabs.map((tab) => (
                    <CustomTab
                      key={tab.key}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                    />
                  ))}
                </CustomTabs>
              </Box>

              {renderFormFields()}
            </ModalBody>

            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: colors.surface,
                padding: theme.spacing(2),
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing(2),
                boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <ActionButton variant="outlined" onClick={handleEditClose}>
                Cancel
              </ActionButton>
              <ActionButton
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </ActionButton>
            </Box>
          </ModalContainer>
        </Backdrop>
      </Modal>

      {/* Image Preview Modals */}
      <ImagePreviewModal
        open={imageZoomOpen}
        onClose={handleImageZoomClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={imageZoomOpen} onClick={handleImageZoomClose}>
          <ImagePreviewContainer onClick={(e) => e.stopPropagation()}>
            <ImagePreviewContent>
              <PreviewImage
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture Preview"
              />
              <ImagePreviewActions>
                <ImagePreviewButton
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = profilePicture
                      ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                      : '';
                    link.download = 'profile-picture.jpg';
                    link.click();
                  }}
                  title="Download"
                >
                  <DownloadIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Profile Picture',
                        url: profilePicture
                          ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                          : '',
                      });
                    }
                  }}
                  title="Share"
                >
                  <ShareIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={handleImageZoomClose}
                  title="Close"
                >
                  <CloseIcon />
                </ImagePreviewButton>
              </ImagePreviewActions>
            </ImagePreviewContent>
          </ImagePreviewContainer>
        </Backdrop>
      </ImagePreviewModal>

      <ImagePreviewModal
        open={editImageZoomOpen}
        onClose={handleEditImageZoomClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={editImageZoomOpen} onClick={handleEditImageZoomClose}>
          <ImagePreviewContainer onClick={(e) => e.stopPropagation()}>
            <ImagePreviewContent>
              <PreviewImage
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture Preview"
              />
              <ImagePreviewActions>
                <ImagePreviewButton
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = profilePicture
                      ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                      : '';
                    link.download = 'profile-picture.jpg';
                    link.click();
                  }}
                  title="Download"
                >
                  <DownloadIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Profile Picture',
                        url: profilePicture
                          ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                          : '',
                      });
                    }
                  }}
                  title="Share"
                >
                  <ShareIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={handleEditImageZoomClose}
                  title="Close"
                >
                  <CloseIcon />
                </ImagePreviewButton>
              </ImagePreviewActions>
            </ImagePreviewContent>
          </ImagePreviewContainer>
        </Backdrop>
      </ImagePreviewModal>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Notification
          variant={uploadStatus.type}
          message={uploadStatus.message}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleNotificationClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Snackbar>

      {trigger && (
        <FloatingButton onClick={scrollToTop} aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </FloatingButton>
      )}
    </ProfileWrapper>
  );
};

export default Profile;
