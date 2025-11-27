import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IconButton,
  Modal,
  Tooltip,
  Box,
  Grid,
  Typography,
  Avatar,
  Button,
  Badge,
  Card,
  CardContent,
  Divider,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  AccessTime,
  AccountBalance,
  Description,
  Download,
  Person,
  ContactPage,
  Receipt,
  Event,
  TrendingUp,
  CalendarMonth,
  Logout,
  Settings,
  Dashboard as DashboardIcon,
  InsertDriveFile,
  WorkHistory,
  Close,
  Add,
  Note,
  Edit,
  Delete,
  Save,
  Flag,
  ArrowForward
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:5000';

const COLORS = {
  primary: '#6d2323',
  secondary: '#fef9e1',
  white: '#ffffff',
  black: '#000000',
  lightGray: '#f5f5f5',
  darkGray: '#666666'
};

const HAHAHA = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [payrollData, setPayrollData] = useState(null);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcementDetails, setAnnouncementDetails] = useState({}); // Store announcement details by notification id
 
  // New states for notes and events
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [currentNote, setCurrentNote] = useState({ date: '', content: '' });
  const [currentEvent, setCurrentEvent] = useState({ date: '', title: '', description: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [viewNotesDialog, setViewNotesDialog] = useState(false);

  const navigate = useNavigate();

  const month = calendarDate.getMonth();
  const year = calendarDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load notes and events from database
  useEffect(() => {
    const fetchNotesAndEvents = async () => {
      if (!employeeNumber) return;
      
      try {
        const notesRes = await axios.get(`${API_BASE_URL}/api/notes/${employeeNumber}`);
        const eventsRes = await axios.get(`${API_BASE_URL}/api/events/${employeeNumber}`);
        
        setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      } catch (err) {
        console.error('Error fetching notes and events:', err);
        // Fallback to localStorage if API fails
        const savedNotes = JSON.parse(localStorage.getItem('employeeNotes') || '[]');
        const savedEvents = JSON.parse(localStorage.getItem('employeeEvents') || '[]');
        setNotes(savedNotes);
        setEvents(savedEvents);
      }
    };
    
    fetchNotesAndEvents();
  }, [employeeNumber]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!employeeNumber) {
        console.log('No employeeNumber, skipping notification fetch');
        return;
      }
      
      // Ensure employeeNumber is a string
      const empNum = String(employeeNumber).trim();
      if (!empNum) return;
      
      try {
        console.log(`Fetching notifications for employeeNumber: ${empNum}`);
        const [notifRes, unreadRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/notifications/${empNum}`),
          axios.get(`${API_BASE_URL}/api/notifications/${empNum}/unread-count`)
        ]);
        
        // Filter notifications to ensure they belong to the logged-in employee
        const filteredNotifications = Array.isArray(notifRes.data) 
          ? notifRes.data.filter(notif => String(notif.employeeNumber).trim() === empNum)
          : [];
        
        console.log(`Found ${filteredNotifications.length} notifications for employee ${empNum}`);
        setNotifications(filteredNotifications);
        setUnreadCount(unreadRes.data?.count || 0);

        // Fetch announcement details for announcement notifications
        const announcementNotifs = filteredNotifications.filter(n => n.notification_type === 'announcement' && n.announcement_id);
        if (announcementNotifs.length > 0) {
          try {
            const annRes = await axios.get(`${API_BASE_URL}/api/announcements`);
            const announcementList = Array.isArray(annRes.data) ? annRes.data : [];
            const detailsMap = {};
            announcementNotifs.forEach(notif => {
              const announcement = announcementList.find(ann => 
                ann.id === notif.announcement_id || ann.id === parseInt(notif.announcement_id)
              );
              if (announcement) {
                detailsMap[notif.id] = announcement;
              }
            });
            setAnnouncementDetails(detailsMap);
          } catch (err) {
            console.error('Error fetching announcement details:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    
    fetchNotifications();
    // Refresh notifications every 5 seconds for near real-time updates
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [employeeNumber]);

  const handleNotificationClick = async (notification) => {
    // Mark as read in database
    if (notification.read_status === 0) {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Update database
        await axios.put(
          `${API_BASE_URL}/api/notifications/${notification.id}/read`,
          {},
          { headers }
        );
        
        // Update local state immediately for better UX
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read_status: 1 } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
        // Still allow navigation even if marking as read fails
      }
    }

    // Handle based on notification type
    if (notification.notification_type === 'payslip' || 
        (notification.action_link && notification.action_link.includes('payslip'))) {
      setNotifModalOpen(false);
      navigate('/payslip');
    } else if (notification.notification_type === 'contact' ||
               (notification.action_link && notification.action_link.includes('settings'))) {
      setNotifModalOpen(false);
      navigate('/settings');
    } else if (notification.notification_type === 'announcement' || 
               (notification.action_link && notification.action_link.includes('announcement'))) {
      // Fetch the announcement details
      try {
        const annRes = await axios.get(`${API_BASE_URL}/api/announcements`);
        const announcementList = Array.isArray(annRes.data) ? annRes.data : [];
        
        // Try to find by announcement_id first, then fallback to title matching
        let matchingAnnouncement = null;
        if (notification.announcement_id) {
          matchingAnnouncement = announcementList.find(
            ann => ann.id === notification.announcement_id || ann.id === parseInt(notification.announcement_id)
          );
        }
        
        // If not found by ID, try to get from announcementDetails state
        if (!matchingAnnouncement && notification.announcement_id) {
          const cachedAnnouncement = announcementDetails[notification.id];
          if (cachedAnnouncement) {
            matchingAnnouncement = cachedAnnouncement;
          }
        }
        
        // If still not found, get the most recent announcement
        if (!matchingAnnouncement && announcementList.length > 0) {
          matchingAnnouncement = announcementList[0]; // Most recent
        }
        
        if (matchingAnnouncement) {
          setNotifModalOpen(false);
          setSelectedAnnouncement(matchingAnnouncement);
          setOpenModal(true);
        } else {
          // If not found, just close notification modal
          setNotifModalOpen(false);
        }
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setNotifModalOpen(false);
      }
    } else if (notification.action_link) {
      setNotifModalOpen(false);
      navigate(notification.action_link);
    }
  };

  const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return {};
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return {
        role: decoded.role,
        employeeNumber: decoded.employeeNumber,
        username: decoded.username,
      };
    } catch (err) {
      console.error('Error decoding token:', err);
      return {};
    }
  };

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo.username) setUsername(userInfo.username);
    if (userInfo.employeeNumber) setEmployeeNumber(userInfo.employeeNumber);
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/announcements`);
        setAnnouncements(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setAnnouncements([]);
      }
    };
    fetchAnnouncements();
  }, []);

  const handlePrevSlide = () => {
    if (announcements.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNextSlide = () => {
    if (announcements.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % announcements.length);
  };

  const handleOpenModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAnnouncement(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/personalinfo/person_table`);
        const list = Array.isArray(res.data) ? res.data : [];
        const match = list.find((p) => String(p.agencyEmployeeNum) === String(employeeNumber));
        if (match && match.profile_picture) setProfilePicture(match.profile_picture);
        const fullNameFromPerson = `${match.firstName || ''} ${match.middleName || ''} ${match.lastName || ''} ${match.nameExtension || ''}`.trim();
        if (fullNameFromPerson) {
          setFullName(fullNameFromPerson);
        }
      } catch (err) {
        console.error('Error loading profile picture:', err);
      }
    };

    if (employeeNumber) fetchProfilePicture();
  }, [employeeNumber]);

  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!employeeNumber) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/finalized-payroll`);
        const list = Array.isArray(res.data) ? res.data : [];
        const userPayroll = list.find((p) =>
          String(p.employeeNumber) === String(employeeNumber) ||
          String(p.agencyEmployeeNum) === String(employeeNumber)
        );
        setPayrollData(userPayroll || null);
      } catch (err) {
        console.error('Error fetching payroll:', err);
      }
    };
    fetchPayrollData();
  }, [employeeNumber]);

  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === '' || value === '0') return '₱0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₱0.00';
    return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const generateCalendar = () => {
    const days = [];
    const totalCells = 42;
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    const remaining = totalCells - days.length;
    for (let i = 0; i < remaining; i++) days.push(null);
    return days;
  };

  const calendarDays = generateCalendar();

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/holiday`);
        if (Array.isArray(res.data)) {
          const transformedHolidays = res.data.map(item => {
            const d = new Date(item.date);
            const normalizedDate = !isNaN(d)
              ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
              : item.date;

            return {
              date: normalizedDate,
              name: item.description,
              status: item.status
            };
          });
          setHolidays(transformedHolidays);
        }
      } catch (err) {
        console.error("Error fetching holidays:", err);
      }
    };
    fetchHolidays();
  }, []);

  // Note and Event handlers
  const handleAddNote = () => {
    if (!selectedDate) return;
    setCurrentNote({ date: selectedDate, content: '' });
    setOpenNoteDialog(true);
  };

  const handleSaveNote = async () => {
    try {
      const newNote = {
        employee_number: employeeNumber,
        date: currentNote.date,
        content: currentNote.content
      };
      
      const res = await axios.post(`${API_BASE_URL}/api/notes`, newNote);
      const updatedNotes = [...notes, res.data];
      setNotes(updatedNotes);
      
      // Also save to localStorage as backup
      localStorage.setItem('employeeNotes', JSON.stringify(updatedNotes));
      
      setOpenNoteDialog(false);
      setCurrentNote({ date: '', content: '' });
    } catch (err) {
      console.error('Error saving note:', err);
      // Fallback to localStorage if API fails
      const newNote = {
        id: Date.now(),
        date: currentNote.date,
        content: currentNote.content,
        createdAt: new Date().toISOString()
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem('employeeNotes', JSON.stringify(updatedNotes));
      setOpenNoteDialog(false);
      setCurrentNote({ date: '', content: '' });
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notes/${noteId}`);
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      
      // Also update localStorage
      localStorage.setItem('employeeNotes', JSON.stringify(updatedNotes));
    } catch (err) {
      console.error('Error deleting note:', err);
      // Fallback to localStorage if API fails
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      localStorage.setItem('employeeNotes', JSON.stringify(updatedNotes));
    }
  };

  const handleAddEvent = () => {
    if (!selectedDate) return;
    setCurrentEvent({ date: selectedDate, title: '', description: '' });
    setOpenEventDialog(true);
  };

  const handleSaveEvent = async () => {
    try {
      const newEvent = {
        employee_number: employeeNumber,
        date: currentEvent.date,
        title: currentEvent.title,
        description: currentEvent.description
      };
      
      const res = await axios.post(`${API_BASE_URL}/api/events`, newEvent);
      const updatedEvents = [...events, res.data];
      setEvents(updatedEvents);
      
      // Also save to localStorage as backup
      localStorage.setItem('employeeEvents', JSON.stringify(updatedEvents));
      
      setOpenEventDialog(false);
      setCurrentEvent({ date: '', title: '', description: '' });
    } catch (err) {
      console.error('Error saving event:', err);
      // Fallback to localStorage if API fails
      const newEvent = {
        id: Date.now(),
        date: currentEvent.date,
        title: currentEvent.title,
        description: currentEvent.description,
        createdAt: new Date().toISOString(),
        notified: false
      };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('employeeEvents', JSON.stringify(updatedEvents));
      setOpenEventDialog(false);
      setCurrentEvent({ date: '', title: '', description: '' });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      
      // Also update localStorage
      localStorage.setItem('employeeEvents', JSON.stringify(updatedEvents));
    } catch (err) {
      console.error('Error deleting event:', err);
      // Fallback to localStorage if API fails
      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      localStorage.setItem('employeeEvents', JSON.stringify(updatedEvents));
    }
  };

  const getNotesForDate = (dateStr) => {
    return notes.filter(n => n.date === dateStr);
  };

  const getEventsForDate = (dateStr) => {
    return events.filter(e => e.date === dateStr);
  };

  const getTodayEvents = () => {
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
    return events.filter(e => e.date === today);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= today && eventDate <= threeDaysLater;
    });
  };

  // Combine notes and events for recent activity
  const getRecentActivity = () => {
    const allActivity = [
      ...notes.map(note => ({
        id: note.id,
        type: 'note',
        title: 'Note',
        content: note.content,
        date: note.date,
        createdAt: note.createdAt || new Date().toISOString()
      })),
      ...events.map(event => ({
        id: event.id,
        type: 'event',
        title: event.title,
        content: event.description,
        date: event.date,
        createdAt: event.createdAt || new Date().toISOString()
      }))
    ];
    
    // Sort by creation date (newest first) and take the latest 5
    return allActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  };

  const quickActions = [
    { icon: <AccessTime />, label: 'DTR', link: '/daily_time_record', color: COLORS.primary },
    { icon: <Receipt />, label: 'Payslip', link: '/payslip', color: COLORS.primary },
    { icon: <ContactPage />, label: 'PDS', link: '/pds1', color: COLORS.primary },
    { icon: <WorkHistory />, label: 'Attendance', link: '/attendance-user-state', color: COLORS.primary },
  ];


  return (
    <Box sx={{
      minHeight: '100vh',
      p: { xs: 2, md: 1 }
    }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          background: COLORS.primary,
          color: COLORS.white,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(109, 35, 35, 0.3)'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }} />
       
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Welcome back, {fullName || username || 'Employee'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              {currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2, alignItems: 'center' }}>
              <Box sx={{
                textAlign: 'right',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                p: 2,
                borderRadius: 2
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  {currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <IconButton
                onClick={async () => {
                  // Immediately fetch latest notifications when opening modal
                  if (employeeNumber) {
                    try {
                      const empNum = String(employeeNumber).trim();
                      const [notifRes, unreadRes] = await Promise.all([
                        axios.get(`${API_BASE_URL}/api/notifications/${empNum}`),
                        axios.get(`${API_BASE_URL}/api/notifications/${empNum}/unread-count`)
                      ]);
                      
                      // Filter notifications to ensure they belong to the logged-in employee
                      const filteredNotifications = Array.isArray(notifRes.data) 
                        ? notifRes.data.filter(notif => String(notif.employeeNumber).trim() === empNum)
                        : [];
                      
                      setNotifications(filteredNotifications);
                      setUnreadCount(unreadRes.data?.count || 0);
                    } catch (err) {
                      console.error('Error fetching notifications:', err);
                    }
                  }
                  setNotifModalOpen(true);
                }}
                sx={{
                  color: COLORS.white,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={7} lg={8}>
          {/* Announcement Slideshow - BIGGER */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              height: { xs: 350, sm: 450, md: 550 },
              cursor: 'pointer',
              transition: 'all 0.3s',
              backgroundColor: COLORS.white,
              boxShadow: '0 8px 32px rgba(109, 35, 35, 0.15)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(109, 35, 35, 0.25)'
              }
            }}
            onClick={() => announcements[currentSlide] && handleOpenModal(announcements[currentSlide])}
          >
            {announcements.length > 0 ? (
              <>
                <Box
                  component="img"
                  src={
                    announcements[currentSlide]?.image
                      ? `${API_BASE_URL}${announcements[currentSlide].image}`
                      : "/api/placeholder/1200/600"
                  }
                  alt={announcements[currentSlide]?.title || "Announcement"}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                    p: { xs: 2, md: 4 },
                  }}
                >
                  <Chip
                    label="Announcement"
                    size="small"
                    sx={{
                      mb: 2,
                      backgroundColor: COLORS.secondary,
                      color: COLORS.primary,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  />
                  <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 700, mb: 1, fontSize: { xs: '1.25rem', md: '2rem' } }}>
                    {announcements[currentSlide]?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.white, opacity: 0.9, fontSize: { xs: '0.75rem', md: '1rem' } }}>
                    {new Date(announcements[currentSlide]?.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
                <IconButton
                  onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
                  sx={{
                    position: 'absolute',
                    left: { xs: 10, md: 20 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(254, 249, 225, 0.95)',
                    color: COLORS.primary,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    '&:hover': {
                      backgroundColor: COLORS.secondary,
                      transform: 'translateY(-50%) scale(1.1)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
                  sx={{
                    position: 'absolute',
                    right: { xs: 10, md: 20 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(254, 249, 225, 0.95)',
                    color: COLORS.primary,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    '&:hover': {
                      backgroundColor: COLORS.secondary,
                      transform: 'translateY(-50%) scale(1.1)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
               
                {/* Slide Indicators */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  display: 'flex',
                  gap: 1
                }}>
                  {announcements.map((_, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: idx === currentSlide ? COLORS.secondary : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: COLORS.lightGray
              }}>
                <Typography color="textSecondary">No announcements available</Typography>
              </Box>
            )}
          </Paper>

                    
          {/* Quick Actions Grid - Compact */}
          <Paper elevation={0} sx={{ backgroundColor: COLORS.white, p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(109, 35, 35, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DashboardIcon sx={{ color: COLORS.primary, mr: 1, fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '1.125rem' }}>
                Employee Panel
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} sm={6} md={3} key={index}>
                  <Link to={action.link} style={{ textDecoration: 'none' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2, sm: 3 },
                        textAlign: 'center',
                        borderRadius: 2,
                        backgroundColor: COLORS.white,
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(109, 35, 35, 0.08)',
                        '&:hover': {
                          backgroundColor: COLORS.primary,
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(109, 35, 35, 0.2)',
                          '& .action-icon': {
                            color: COLORS.white,
                            transform: 'scale(1.2) rotate(5deg)'
                          },
                          '& .action-label': { color: COLORS.white }
                        }
                      }}
                    >
                      <Box
                        className="action-icon"
                        sx={{
                          color: action.color,
                          mb: 1,
                          fontSize: { xs: 32, sm: 40 },
                          transition: 'all 0.3s',
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography
                        className="action-label"
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: COLORS.black,
                          transition: 'color 0.3s',
                          fontSize: { xs: '0.8rem', sm: '0.9rem' }
                        }}
                      >
                        {action.label}
                      </Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Payslip Card */}
          <Paper elevation={0} sx={{ backgroundColor: COLORS.white, p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: '0 4px 20px rgba(109, 35, 35, 0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ color: COLORS.primary, mr: 1, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '1.125rem' }}>
                  Latest Payslip
                </Typography>
              </Box>
              <Chip
                label={payrollData?.period || 'Latest Period'}
                sx={{
                  backgroundColor: COLORS.secondary,
                  color: COLORS.primary,
                  fontWeight: 600
                }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card
                  elevation={0}
                  sx={{
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, #8d3333 100%)`,
                    color: COLORS.white,
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 16px rgba(109, 35, 35, 0.2)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 24px rgba(109, 35, 35, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>
                      1st Quincena
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                      {payrollData ? formatCurrency(payrollData.pay1st) : '₱-.--'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <AccountBalance sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="caption">{payrollData?.period1_desc || '1st Half'}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card
                  elevation={0}
                  sx={{
                    background: `linear-gradient(135deg, #8d3333 0%, ${COLORS.primary} 100%)`,
                    color: COLORS.white,
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 16px rgba(109, 35, 35, 0.2)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 24px rgba(109, 35, 35, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>
                      2nd Quincena
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                      {payrollData ? formatCurrency(payrollData.pay2nd) : '₱-.--'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <AccountBalance sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="caption">{payrollData?.period2_desc || '2nd Half'}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Link to="/payslip" style={{ textDecoration: 'none' }}>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  mt: 2,
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: COLORS.primary,
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(109, 35, 35, 0.2)'
                  },
                  transition: 'all 0.3s'
                }}
                startIcon={<Download />}
              >
                View Full Payslip
              </Button>
            </Link>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={5} lg={4}>
          {/* Profile Card */}
          <Paper elevation={0} sx={{ backgroundColor: COLORS.white, p: 3, borderRadius: 3, mb: 3, textAlign: 'center', boxShadow: '0 4px 20px rgba(109, 35, 35, 0.08)' }}>
            <Avatar
              src={profilePicture ? `${API_BASE_URL}${profilePicture}` : undefined}
              sx={{
                width: 100,
                height: 100,
                margin: '0 auto 16px',
                border: `4px solid ${COLORS.primary}`,
                boxShadow: '0 4px 15px rgba(109, 35, 35, 0.2)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 24px rgba(109, 35, 35, 0.3)'
                }
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 0.5 }}>
              {fullName || username || 'Employee Name'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              ID: {employeeNumber || '#00000000'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<Settings />}
                sx={{
                  backgroundColor: COLORS.primary,
                  color: "white",
                  '&:hover': {
                    backgroundColor: '#8d3333',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(109, 35, 35, 0.3)',
                    '& .MuiSvgIcon-root': {
                      transform: 'rotate(90deg)'
                    }
                  },
                  '& .MuiSvgIcon-root': {
                    transition: 'transform 0.3s'
                  }
                }}
              >
                Profile
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  backgroundColor: COLORS.primary,
                  '&:hover': {
                    backgroundColor: '#8d3333',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(109, 35, 35, 0.3)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Logout
              </Button>
            </Box>
          </Paper>

          {/* Calendar with Notes */}
          <Paper elevation={0} sx={{ backgroundColor: COLORS.white, p: 3, borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(109, 35, 35, 0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <IconButton
                size="small"
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                sx={{
                  color: COLORS.primary,
                  '&:hover': {
                    backgroundColor: COLORS.secondary,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonth sx={{ color: COLORS.primary, mr: 1 }} />
                <Typography fontWeight={700} sx={{ color: COLORS.primary }}>
                  {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                sx={{
                  color: COLORS.primary,
                  '&:hover': {
                    backgroundColor: COLORS.secondary,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>

            <Grid container spacing={0.5} sx={{ mb: 1 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <Grid item xs={12 / 7} key={i}>
                  <Typography
                    sx={{
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: COLORS.primary,
                      py: 0.5
                    }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={0.5}>
              {calendarDays.map((day, index) => {
                const currentDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const holidayData = holidays.find(h => h.date === currentDateStr && h.status === "Active");
                const dayNotes = getNotesForDate(currentDateStr);
                const dayEvents = getEventsForDate(currentDateStr);
                const hasNotesOrEvents = dayNotes.length > 0 || dayEvents.length > 0;
                const isToday = day === new Date().getDate() &&
                               month === new Date().getMonth() &&
                               year === new Date().getFullYear();

                return (
                  <Grid item xs={12 / 7} key={index}>
                    <Tooltip
                      title={
                        holidayData ? holidayData.name :
                        hasNotesOrEvents ? `${dayNotes.length} note(s), ${dayEvents.length} event(s)` :
                        ""
                      }
                      arrow
                    >
                      <Box
                        onClick={() => {
                          if (day) {
                            setSelectedDate(currentDateStr);
                            setViewNotesDialog(true);
                          }
                        }}
                        sx={{
                          textAlign: 'center',
                          p: 0.8,
                          fontSize: '0.875rem',
                          borderRadius: 1,
                          minHeight: 21,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: holidayData ? COLORS.white : isToday ? COLORS.white : day ? COLORS.black : 'transparent',
                          backgroundColor: holidayData ? COLORS.primary : isToday ? '#8d3333' : 'transparent',
                          fontWeight: holidayData || isToday ? 700 : 400,
                          border: isToday ? `2px solid ${COLORS.secondary}` : 'none',
                          cursor: day ? 'pointer' : 'default',
                          position: 'relative',
                          transition: 'all 0.2s',
                          '&:hover': day ? {
                            transform: 'scale(1.15)',
                            boxShadow: '0 4px 12px rgba(109, 35, 35, 0.2)',
                            backgroundColor: holidayData ? COLORS.primary : isToday ? '#8d3333' : COLORS.secondary,
                            zIndex: 10
                          } : {}
                        }}
                      >
                        {day || ''}
                        {hasNotesOrEvents && day && (
                          <Box sx={{
                            display: 'flex',
                            gap: 0.25,
                            mt: 0.25,
                            position: 'absolute',
                            bottom: 2
                          }}>
                            {dayNotes.length > 0 && (
                              <Box sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: holidayData || isToday ? COLORS.white : '#ff9800'
                              }} />
                            )}
                            {dayEvents.length > 0 && (
                              <Box sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: holidayData || isToday ? COLORS.white : '#4caf50'
                              }} />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ my: 2 }} />
           
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Tooltip title="Add Note">
                <IconButton
                  size="small"
                  onClick={() => {
                    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
                    setSelectedDate(today);
                    handleAddNote();
                  }}
                  sx={{
                    backgroundColor: COLORS.secondary,
                    color: COLORS.primary,
                    '&:hover': {
                      backgroundColor: COLORS.primary,
                      color: COLORS.white,
                      transform: 'scale(1.1) rotate(90deg)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <Note fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Event">
                <IconButton
                  size="small"
                  onClick={() => {
                    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
                    setSelectedDate(today);
                    handleAddEvent();
                  }}
                  sx={{
                    backgroundColor: COLORS.secondary,
                    color: COLORS.primary,
                    '&:hover': {
                      backgroundColor: COLORS.primary,
                      color: COLORS.white,
                      transform: 'scale(1.1) rotate(90deg)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', fontSize: '0.75rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff9800' }} />
                <Typography variant="caption">Notes</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4caf50' }} />
                <Typography variant="caption">Events</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Recent Activity - Updated to show Notes and Events */}
          <Paper elevation={0} sx={{ backgroundColor: COLORS.white, p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(109, 35, 35, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ color: COLORS.primary, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '1.125rem' }}>
                Your Notes and Events
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 215, overflowY: 'auto' }}>
              {getRecentActivity().length > 0 ? (
                getRecentActivity().map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: item.type === 'note' ? COLORS.secondary : '#e8f5e9',
                      borderRadius: 2,
                      borderLeft: `4px solid ${item.type === 'note' ? COLORS.primary : '#4caf50'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(109, 35, 35, 0.08)',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        boxShadow: '0 4px 16px rgba(109, 35, 35, 0.15)'
                      }
                    }}
                    onClick={() => {
                      setSelectedDate(item.date);
                      setViewNotesDialog(true);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      {item.type === 'note' ? <Note sx={{ fontSize: 16, mr: 1, color: COLORS.primary }} /> : <Event sx={{ fontSize: 16, mr: 1, color: '#4caf50' }} />}
                      <Typography variant="caption" sx={{ color: item.type === 'note' ? COLORS.primary : '#2e7d32', fontWeight: 600, display: 'block' }}>
                        {item.type === 'note' ? 'Note' : 'Event'}: {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 3.5 }}>
                      {item.content && item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 3.5, mt: 0.5 }}>
                      {new Date(item.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No recent activity
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Announcement Detail Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '600px' },
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: COLORS.white,
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            p: 4
          }}
        >
          {selectedAnnouncement && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.primary, flex: 1 }}>
                  {selectedAnnouncement.title}
                </Typography>
                <IconButton
                  onClick={handleCloseModal}
                  sx={{
                    color: COLORS.primary,
                    '&:hover': {
                      backgroundColor: COLORS.secondary,
                      transform: 'rotate(90deg)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
             
              {selectedAnnouncement.image && (
                <Box
                  component="img"
                  src={`${API_BASE_URL}${selectedAnnouncement.image}`}
                  alt={selectedAnnouncement.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 3
                  }}
                />
              )}
             
              <Typography variant="body1" paragraph sx={{ color: COLORS.darkGray, lineHeight: 1.8 }}>
                {selectedAnnouncement.about}
              </Typography>
             
              <Divider sx={{ my: 2 }} />
             
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Posted on: {new Date(selectedAnnouncement.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleCloseModal}
                  sx={{
                    backgroundColor: COLORS.primary,
                    '&:hover': {
                      backgroundColor: '#8d3333',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(109, 35, 35, 0.3)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Notifications Modal */}
      <Modal open={notifModalOpen} onClose={() => setNotifModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '50%', md: '80px' },
            right: { xs: '50%', md: '20px' },
            transform: { xs: 'translate(50%, -50%)', md: 'none' },
            width: { xs: '90%', sm: '400px' },
            maxHeight: '80vh',
            overflowY: 'auto',
            bgcolor: COLORS.white,
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ color: COLORS.primary, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary }}>
                Notifications
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setNotifModalOpen(false)}
              sx={{
                color: COLORS.primary,
                '&:hover': {
                  backgroundColor: COLORS.secondary,
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s'
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* System Notifications (Payslip, Announcements, etc.) */}
          {Array.isArray(notifications) && notifications.length > 0 && (
            <>
              {notifications.slice(0, 10).map((notif) => {
                const announcement = notif.notification_type === 'announcement' 
                  ? announcementDetails[notif.id] 
                  : null;
                
                // For announcement notifications, show full image with overlaid title
                if (notif.notification_type === 'announcement' && announcement) {
                  return (
                    <Box
                      key={`notif-${notif.id}`}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        opacity: notif.read_status === 1 ? 0.7 : 1,
                        position: 'relative',
                        height: 200,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          opacity: 1
                        }
                      }}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <Box
                        component="img"
                        src={announcement.image ? `${API_BASE_URL}${announcement.image}` : '/api/placeholder/400/200'}
                        alt={announcement.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                          p: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Flag 
                            sx={{ 
                              color: '#ff69b4',
                              fontSize: 18,
                            }} 
                          />
                          <Typography 
                            fontSize="0.75rem"
                            sx={{ 
                              color: '#fff',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5
                            }}
                          >
                            New Announcement
                          </Typography>
                        </Box>
                        <Typography 
                          fontWeight={700} 
                          fontSize="1.1rem" 
                          sx={{ 
                            color: '#fff',
                            mb: 0.5,
                            lineHeight: 1.3,
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                          }}
                        >
                          {announcement.title}
                        </Typography>
                        <Typography 
                          fontSize="0.75rem" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <AccessTime sx={{ fontSize: 12 }} />
                          {notif.created_at
                            ? new Date(notif.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : ''}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }
                
                // For other notifications (payslip, etc.), use the regular style
                return (
                  <Box
                    key={`notif-${notif.id}`}
                    sx={{
                      mb: 2,
                      p: 2.5,
                      backgroundColor: notif.read_status === 0 
                        ? (notif.notification_type === 'payslip' 
                            ? '#e8f5e9' 
                            : notif.notification_type === 'contact'
                            ? '#fff3e0'
                            : COLORS.secondary)
                        : COLORS.lightGray,
                      borderRadius: 2,
                      borderLeft: `4px solid ${
                        notif.notification_type === 'payslip' 
                          ? '#4caf50' 
                          : notif.notification_type === 'contact'
                          ? '#ff9800'
                          : COLORS.primary
                      }`,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      opacity: notif.read_status === 1 ? 0.7 : 1,
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        opacity: 1
                      }
                    }}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: notif.notification_type === 'payslip'
                            ? `linear-gradient(135deg, #4caf50, #2e7d32)`
                            : notif.notification_type === 'contact'
                            ? `linear-gradient(135deg, #ff9800, #f57c00)`
                            : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                          mt: 0.5,
                          flexShrink: 0,
                          opacity: notif.read_status === 0 ? 1 : 0.5,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          fontWeight={700} 
                          fontSize="1rem" 
                          sx={{ 
                            color: notif.notification_type === 'payslip' 
                              ? '#2e7d32' 
                              : notif.notification_type === 'contact'
                              ? '#ff9800'
                              : COLORS.primary, 
                            mb: 0.5,
                            lineHeight: 1.4
                          }}
                        >
                          {notif.notification_type === 'payslip' 
                            ? '💰 Payslip Available' 
                            : notif.notification_type === 'contact'
                            ? '📧 Contact Ticket Response'
                            : '📢 Notification'}
                        </Typography>
                        <Typography fontSize="0.85rem" color="textSecondary" sx={{ mb: 0.5 }}>
                          {notif.description}
                        </Typography>
                        <Typography 
                          fontSize="0.8rem" 
                          color="textSecondary"
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <AccessTime sx={{ fontSize: 12 }} />
                          {notif.created_at
                            ? new Date(notif.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : ''}
                        </Typography>
                      </Box>
                      <ArrowForward
                        sx={{
                          color: COLORS.primary,
                          fontSize: 20,
                          transition: "transform 0.3s",
                          mt: 0.5,
                          flexShrink: 0
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </>
          )}

          {(!Array.isArray(notifications) || notifications.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: COLORS.darkGray, opacity: 0.3, mb: 2 }} />
              <Typography color="textSecondary">No notifications at the moment</Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* View Notes/Events Dialog */}
      <Dialog
        open={viewNotesDialog}
        onClose={() => setViewNotesDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
          {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1, display: 'flex', alignItems: 'center' }}>
            <Note sx={{ mr: 1 }} /> Notes
          </Typography>
          {getNotesForDate(selectedDate).length > 0 ? (
            getNotesForDate(selectedDate).map(note => (
              <Box key={note.id} sx={{ mb: 2, p: 2, backgroundColor: COLORS.secondary, borderRadius: 2 }}>
                <Typography variant="body2">{note.content}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton size="small" onClick={() => handleDeleteNote(note.id)} sx={{ color: '#d32f2f' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>No notes for this date</Typography>
          )}

          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1, mt: 3, display: 'flex', alignItems: 'center' }}>
            <Event sx={{ mr: 1 }} /> Events
          </Typography>
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate).map(event => (
              <Box key={event.id} sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{event.title}</Typography>
                <Typography variant="body2">{event.description}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton size="small" onClick={() => handleDeleteEvent(event.id)} sx={{ color: '#d32f2f' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>No events for this date</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setViewNotesDialog(false); handleAddNote(); }} startIcon={<Note />} sx={{ backgroundColor: "#000000", color: '#FFFFFF' }}>
            Add Note
          </Button>
          <Button onClick={() => { setViewNotesDialog(false); handleAddEvent(); }} startIcon={<Add />} sx={{ backgroundColor: "#000000", color: '#FFFFFF' }}>
            Add Event
          </Button>
          <Button onClick={() => setViewNotesDialog(false)} variant="contained" sx={{ backgroundColor: COLORS.primary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: COLORS.primary, color: COLORS.white }}>Add Note</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Note Content"
            value={currentNote.content}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="textSecondary">
            Date: {currentNote.date && new Date(currentNote.date).toLocaleDateString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenNoteDialog(false)} 
            variant="contained"
            sx={{ backgroundColor: "#000000"}}
            disabled={!currentNote.content}>Cancel</Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            startIcon={<Save />}
            sx={{ backgroundColor: COLORS.primary }}
            disabled={!currentNote.content}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: COLORS.primary, color: COLORS.white }}>Add Event</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Event Title"
            value={currentEvent.title}
            onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Event Description"
            value={currentEvent.description}
            onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="textSecondary">
            Date: {currentEvent.date && new Date(currentEvent.date).toLocaleDateString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
          onClick={() => setOpenEventDialog(false)} 
            variant="contained"
            sx={{ backgroundColor: "#000000" }}
            disabled={!currentNote.content}>Cancel</Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            startIcon={<Save />}
            sx={{ backgroundColor: COLORS.primary }}
            disabled={!currentEvent.title}
          >
            Save Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HAHAHA;