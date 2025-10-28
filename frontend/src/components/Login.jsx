import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import {
  Alert,
  TextField,
  Button,
  Container,
  Link,
  Box,
  Paper,
  Typography,
  Modal,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
} from "@mui/material";
import {
  BadgeOutlined,
  LockOutlined,
  LoginOutlined,
  CheckCircleOutline,
  ErrorOutline,
  VerifiedUserOutlined,
  Visibility,
  VisibilityOff,
  KeyboardArrowDown,
  Announcement as AnnouncementIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon ,
  Campaign as CampaignIcon,
  Pause,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import LoadingOverlay from "../components/LoadingOverlay";
import logo from "../assets/logo.PNG";
import bg from "../assets/EaristBG.PNG";


const Login = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ employeeNumber: "", password: "" });
  const [errMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [pin, setPin] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [success, setSuccess] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [codeTimer, setCodeTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openPolicy, setOpenPolicy] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [showLaterModal, setShowLaterModal] = useState(false);


  const primaryGradient = "linear-gradient(135deg, #800020, #A52A2A)";
  const primaryHoverGradient = "linear-gradient(135deg, #A52A2A, #800020)";
  const lightText = "#FFF8E7";
  const darkText = "#4B0000";
  const mediumText = "#800020";


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);


    return () => clearInterval(timer);
  }, []);


  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/announcements`);
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    fetchAnnouncements();
  }, []);


  // Slideshow auto-play
  useEffect(() => {
    if (announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);


  // Lock timer
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            setTwoFactorError("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);


  // Code timer
  useEffect(() => {
    let interval;
    if (codeTimer > 0) interval = setInterval(() => setCodeTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [codeTimer]);


  // Auto-hide login error after 3 seconds
  useEffect(() => {
    if (errMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errMessage]);


  // Auto-hide 2FA errors and success after 3 seconds
  useEffect(() => {
    if (twoFactorError) {
      const timer = setTimeout(() => setTwoFactorError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [twoFactorError]);


  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);


  const handleChanges = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // Send 2FA code
  const send2FACode = async (email, empNumber) => {
    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/send-2fa-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, employeeNumber: empNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Verification code sent to your email.");
        setCodeTimer(2 * 60);
        setAttempts(0);
        setIsLocked(false);
        setTwoFactorError("");
      } else setTwoFactorError(data.error || "Failed to send code.");
    } catch {
      setTwoFactorError("Failed to send verification code.");
    } finally {
      setResendLoading(false);
    }
  };


  // Verify 2FA code and complete login
  const verify2FACode = async () => {
    if (!pin.trim()) {
      setTwoFactorError("Please enter the verification code");
      return;
    }
    if (isLocked) {
      setTwoFactorError(`Too many failed attempts. Wait ${formatTime(lockTimer)}.`);
      return;
    }


    setTwoFactorLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/verify-2fa-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code: pin }),
      });
      const data = await res.json();


      if (res.ok && data.verified) {
        const loginRes = await fetch(`${API_BASE_URL}/complete-2fa-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, employeeNumber: formData.employeeNumber }),
        });
        const loginData = await loginRes.json();


        if (loginRes.ok) {
          localStorage.setItem("token", loginData.token);
          const decoded = JSON.parse(atob(loginData.token.split(".")[1]));
          localStorage.setItem("employeeNumber", decoded.employeeNumber || "");
          localStorage.setItem("role", decoded.role || "");


          // Check if user has default password
          if (loginData.isDefaultPassword) {
            setIsDefaultPassword(true);
            setShowPasswordPrompt(true);
            setShow2FA(false);
          } else {
            if (decoded.role === "superadmin" || decoded.role === "administrator") {
              window.location.href = "/admin-home";
            } else {
              window.location.href = "/home";
            }
          }
        } else {
          setTwoFactorError(loginData.error || "Login completion failed.");
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockTimer(60);
          setTwoFactorError("Too many failed attempts. Locked for 1 min.");
        } else {
          setTwoFactorError(data.error || "Invalid verification code. Try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setTwoFactorError("Verification failed. Please try again.");
    } finally {
      setTwoFactorLoading(false);
    }
  };


  const formatTime = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };


  const handleLogin = async e => {
    e.preventDefault();
    if (!formData.employeeNumber || !formData.password) {
      setErrorMessage("Please fill all credentials");
      return;
    }


    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setUserEmail(data.email);
        await send2FACode(data.email, formData.employeeNumber);
        setShow2FA(true);
      } else setErrorMessage(data.error || "Invalid credentials");
    } catch {
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const blobPositions = React.useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      size: 60 + i * 20,
      top: Math.random() * 70,
      left: Math.random() * 70,
      delay: i * 0.3,
      duration: 1 + i * 2,
    }));
  }, []);


  const blobs = blobPositions.map((blob, i) => (
    <Box
      key={i}
      sx={{
        position: "absolute",
        width: blob.size,
        height: blob.size,
        borderRadius: "50%",
        background: primaryGradient,
        opacity: 0.15 + i * 0.1,
        top: `${blob.top}%`,
        left: `${blob.left}%`,
        animation: `float${i} ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
        [`@keyframes float${i}`]: {
          "0%,100%": { transform: `translate(0,0)` },
          "50%": { transform: `translate(15px, -10px) rotate(20deg)` },
        },
      }}
    />
  ));


  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          animation: "zoomPulse 20s ease-in-out infinite",
          "@keyframes zoomPulse": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.05)" },
          },
        }}
      />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          animation: "subtlePulse 8s ease-in-out infinite",
          "@keyframes subtlePulse": {
            "0%, 100%": { opacity: 0.75 },
            "50%": { opacity: 0.7 },
          },
        }}
      />


      <Box sx={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", overflow: "hidden", zIndex: 10 }}>
        <LoadingOverlay open={loading} message="Please wait..." />


        <Box
          sx={{
            height: "100vh",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Left Side - Announcement Slideshow */}
          <Box
            sx={{
              width: "100%",
              maxWidth: 800,
              mx: "auto",
              py: 2,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {announcements.length > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  width: "max-content",
                  animation: `slide ${announcements.length * 5}s linear infinite`,
                  "&:hover": { animationPlayState: "paused" },
                }}
              >
                {[...announcements, ...announcements].map((ann, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: "0 0 650px",
                      borderRadius: 3,
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={ann.image ? `${API_BASE_URL}${ann.image}` : "/api/placeholder/350/300"}
                      alt={ann.title || "Announcement"}
                      sx={{
                        width: "100%",
                        height: 500,
                        objectFit: "cover",
                        borderRadius: 2,
                        filter: "brightness(0.65)",
                        transition: "transform 0.3s, filter 0.3s",
                        "&:hover": { filter: "brightness(0.55)" },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        bgcolor: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        p: 2,
                        textAlign: "left",
                        transition: "bgcolor 0.3s",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
                      }}
                    >
                      <Typography variant="caption" sx={{ textTransform: "uppercase", opacity: 0.8 }}>
                        Announcement
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {ann.title}
                      </Typography>
                      <Typography variant="body2">{new Date(ann.date).toDateString()}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", py: 4 }}>
                No announcements available
              </Typography>
            )}
            <style>{`
              @keyframes slide {
                0% { transform: translateX(0); }
                100% { transform: translateX(-30%); }
              }
            `}</style>
          </Box>


          {/* Right Side - Login Form */}
          <Container maxWidth="sm" sx={{ position: "relative" }}>
            <Paper
              elevation={24}
              sx={{
                padding: { xs: 3, md: 3 },
                borderRadius: 4,
                textAlign: "center",
                background: "rgba(255,248,231,0.85)",
                backdropFilter: "blur(15px)",
                boxShadow: "0 15px 40px rgba(128,0,32,0.2)",
                border: "1px solid rgba(128,0,32,0.15)",
                transition: "transform 0.6s ease, box-shadow 0.6s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: "0 25px 50px rgba(128,0,32,0.35)",
                },
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  margin: "0 auto 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={logo} alt="Logo" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
              </Box>


              <Typography variant="h4" sx={{ color: darkText, fontWeight: 800, mb: 1 }}>
                Human Resources Information System
              </Typography>
              <Typography sx={{ mb: 3, color: mediumText }}>Sign in to access your account</Typography>


              {errMessage && <Alert severity="error" sx={{ mb: 3 }}>{errMessage}</Alert>}


              <form onSubmit={handleLogin}>
                <TextField
                  name="employeeNumber"
                  placeholder="Employee Number"
                  fullWidth
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(128,0,32,0.1)",
                      "& fieldset": { borderColor: mediumText },
                      "&.Mui-focused fieldset": { borderColor: mediumText },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlined sx={{ color: mediumText }} />
                      </InputAdornment>
                    ),
                  }}
                  onChange={handleChanges}
                />
                <TextField
                  name="password"
                  placeholder="Password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(128,0,32,0.1)",
                      "& fieldset": { borderColor: mediumText },
                      "&.Mui-focused fieldset": { borderColor: mediumText },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: mediumText }} />
                      </InputAdornment>
                    ),
                  }}
                  onChange={handleChanges}
                />
                <Box sx={{ textAlign: "right", mb: 3 }}>
                  <Link href="/forgot-password" underline="hover" sx={{ color: mediumText }}>
                    Forgot password?
                  </Link>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  startIcon={<LoginOutlined />}
                  sx={{ py: 1.8, mb: 1, background: primaryGradient, "&:hover": { background: primaryHoverGradient } }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Paper>
          </Container>
        </Box>


        {/* Glassy Intro Slide */}
        {showIntro && (
          <Box
            id="introSlide"
            onClick={() => {
              document.getElementById("introSlide").style.transform = "translateY(-100%)";
              setTimeout(() => setShowIntro(false), 800);
            }}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(15px)",
              borderRadius: 2,
              overflow: "hidden",
              transform: "translateY(0%)",
              transition: "transform 0.8s ease-in-out",
              cursor: "pointer",
              flexDirection: "column",
            }}
          >
            {blobs}


            <Box sx={{ textAlign: "center", px: 3, mb: 2 }} onClick={e => e.stopPropagation()}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  mb: 2,
                  background: "linear-gradient(90deg, #bd7486ff, #e84a72ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "2px 2px 8px rgba(35, 1, 1, 0.7)",
                }}
              >
                H R I S
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 2, color: "#FFFFFF", textShadow: "1px 1px 5px rgba(0,0,0,0.5)" }}
              >
                Human Resources Information System
              </Typography>
            </Box>


            <Box
              sx={{
                position: "absolute",
                bottom: 80,
                right: 16,
                textAlign: "right",
                color: "#FFF8E7",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography sx={{ fontSize: "2.2rem", fontWeight: 500 }}>
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>


            <Box
              sx={{
                position: "absolute",
                bottom: 55,
                right: 16,
                display: "flex",
                justifyContent: "space-between",
                width: "181px",
                color: "#FFF8E7",
                fontSize: "0.9rem",
              }}
            >
              <Link
                component="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPolicy(true);
                }}
                underline="hover"
                sx={{ color: "#FFF8E7", fontWeight: 500 }}
              >
                Privacy Policy
              </Link>
              <Link
                component="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFAQ(true);
                }}
                underline="hover"
                sx={{ color: "#FFF8E7", fontWeight: 500 }}
              >
                FAQs
              </Link>
            </Box>


            <Dialog open={openPolicy} onClose={() => setOpenPolicy(false)} fullWidth maxWidth="md">
              <Box p={3} position="relative">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenPolicy(false);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#6d2323",
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" gutterBottom>
                  Privacy Policy
                </Typography>
                <Typography variant="body2">
                  This is the Privacy Policy content.
                </Typography>
              </Box>
            </Dialog>


            <Dialog open={openFAQ} onClose={() => setOpenFAQ(false)} fullWidth maxWidth="md">
              <Box p={3} position="relative">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFAQ(false);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#6d2323",
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" gutterBottom>
                  FAQs
                </Typography>
                <Typography variant="body2">
                  This is the FAQs content.
                </Typography>
              </Box>
            </Dialog>


            <IconButton
              onClick={() => {
                document.getElementById("introSlide").style.transform = "translateY(-100%)";
                setTimeout(() => setShowIntro(false), 800);
              }}
              sx={{
                color: "#FFF8E7",
                fontSize: "3rem",
                animation: "bounce 2s infinite",
              }}
            >
              <KeyboardArrowDown fontSize="inherit" />
            </IconButton>


            <style>{`
              @keyframes bounce {
                0%,100% { transform: translateY(0); }
                50% { transform: translateY(15px); }
              }
            `}</style>
          </Box>
        )}


        {/* 2FA Modal */}
        <Modal open={show2FA} onClose={() => setShow2FA(false)}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 480,
            maxWidth: "90%",
            bgcolor: "rgba(255,248,231,0.85)",
            borderRadius: 4,
            p: 5,
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 50px rgba(128,0,32,0.3)"
          }}>
            <Typography variant="h5" sx={{ color: darkText, fontWeight: "bold", mb: 3 }}>Email Verification</Typography>
            <Typography sx={{ mb: 3, color: mediumText }}>Verification code sent to <b>{userEmail}</b></Typography>
            {success && <Alert icon={<CheckCircleOutline />} severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {twoFactorError && <Alert icon={<ErrorOutline />} severity="error" sx={{ mb: 2 }}>{twoFactorError}</Alert>}
            <TextField
              fullWidth
              placeholder="• • • • • •"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
              inputProps={{ maxLength: 6, style: { letterSpacing: "1rem", fontSize: "2rem", textAlign: "center" } }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: mediumText },
                  "&:hover fieldset": { borderColor: mediumText },
                  "&.Mui-focused fieldset": { borderColor: mediumText },
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{
                mb: 2,
                py: 1.8,
                background: primaryGradient,
                "&:hover": { background: primaryHoverGradient, transform: "scale(1.05)" },
                transition: "transform 0.2s ease-in-out"
              }}
              onClick={verify2FACode}
              startIcon={<VerifiedUserOutlined sx={{ fontSize: 28, color: "#FFF8E7" }} />}
            >
              {twoFactorLoading ? "Verifying..." : "Verify"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.8,
                color: "#000",
                borderColor: "#000",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.05)",
                  borderColor: "#000",
                },
              }}
              onClick={() => send2FACode(userEmail, formData.employeeNumber)}
              disabled={resendLoading || codeTimer > 0}
            >
              {codeTimer > 0 ? `Resend in ${formatTime(codeTimer)}` : resendLoading ? "Sending..." : "Resend Code"}
            </Button>
          </Box>
        </Modal>


        {/* Change Default Password Prompt */}
        <Modal open={showPasswordPrompt} onClose={() => {}}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            maxWidth: "90%",
            bgcolor: "rgba(255,248,231,0.95)",
            borderRadius: 4,
            p: 5,
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 50px rgba(128,0,32,0.3)",
            border: "2px solid rgba(128,0,32,0.2)"
          }}>
            <Box sx={{ mb: 3 }}>
              <LockOutlined sx={{ fontSize: 60, color: mediumText, mb: 2 }} />
              <Typography variant="h5" sx={{ color: darkText, fontWeight: "bold", mb: 2 }}>
                Secure Your Account
              </Typography>
              <Typography sx={{ color: mediumText, mb: 1 }}>
                You are currently using a default password. For your security, we strongly recommend changing it to a more secure password.
              </Typography>
              <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
                <Typography variant="body2">
                  <strong>Security Tip:</strong> Use a combination of letters, numbers, and special characters for a stronger password.
                </Typography>
              </Alert>
            </Box>


            <Button
              fullWidth
              variant="contained"
              sx={{
                mb: 2,
                py: 1.8,
                background: primaryGradient,
                "&:hover": { background: primaryHoverGradient, transform: "scale(1.02)" },
                transition: "transform 0.2s ease-in-out"
              }}
              onClick={() => {
                const decoded = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
                if (decoded.role === "superadmin" || decoded.role === "administrator") {
                  window.location.href = "/admin-settings?tab=security";
                } else {
                  window.location.href = "/settings?tab=security";
                }
              }}
              startIcon={<LockOutlined />}
            >
              Change Password Now
            </Button>


            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.8,
                color: mediumText,
                borderColor: mediumText,
                "&:hover": {
                  backgroundColor: "rgba(128,0,32,0.05)",
                  borderColor: mediumText,
                },
              }}
              onClick={() => {
                setShowPasswordPrompt(false);
                setShowLaterModal(true);
              }}
            >
              I'll Do This Later
            </Button>


            <Typography variant="caption" sx={{ display: "block", mt: 2, color: mediumText, fontStyle: "italic" }}>
              You can change your password later in Settings → Security
            </Typography>
          </Box>
        </Modal>


        {/* Reminder Modal - I'll Do This Later */}
        <Modal open={showLaterModal} onClose={() => {}}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            maxWidth: "90%",
            bgcolor: "rgba(255,248,231,0.95)",
            borderRadius: 4,
            p: 4,
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 50px rgba(128,0,32,0.3)",
            border: "2px solid rgba(128,0,32,0.2)"
          }}>
            <Box sx={{ mb: 3 }}>
              <CheckCircleOutline sx={{ fontSize: 60, color: "#4caf50", mb: 2 }} />
              <Typography variant="h5" sx={{ color: darkText, fontWeight: "bold", mb: 2 }}>
                Reminder
              </Typography>
              <Typography sx={{ color: mediumText, mb: 1 }}>
                You can change your password anytime by going to:
              </Typography>
              <Typography sx={{ color: darkText, fontWeight: 600, fontSize: "1.1rem", mt: 2 }}>
                Settings → Security → Change Password
              </Typography>
            </Box>


            <Button
              fullWidth
              variant="contained"
              sx={{
                py: 1.8,
                background: primaryGradient,
                "&:hover": { background: primaryHoverGradient, transform: "scale(1.02)" },
                transition: "transform 0.2s ease-in-out"
              }}
              onClick={() => {
                setShowLaterModal(false);
                const decoded = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
                if (decoded.role === "superadmin" || decoded.role === "administrator") {
                  window.location.href = "/admin-home";
                } else {
                  window.location.href = "/home";
                }
              }}
            >
              Continue to Dashboard
            </Button>
          </Box>
        </Modal>
      </Box>
    </>
  );
};


export default Login;



