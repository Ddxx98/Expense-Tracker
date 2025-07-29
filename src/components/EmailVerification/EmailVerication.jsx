import React, { useState, useEffect } from "react";
import { Button, Alert, Typography } from "@mui/material";
import { auth } from "../../firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function EmailVerificationBanner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update user state on mount and when auth state changes (optional)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Check if user exists and is verified right away
  useEffect(() => {
    if (user && user.emailVerified) {
      // Navigate to /home if verified already
      navigate("/home");
    }
  }, [user, navigate]);

  // Function to reload user and update verification status
  const checkVerificationStatus = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    setStatus("");
    try {
      await reload(user);
      const refreshedUser = auth.currentUser;
      setUser(refreshedUser);

      if (refreshedUser.emailVerified) {
        setStatus("Your email is now verified!");
        setSent(false);
        // Navigate after small delay so user can see message
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setStatus("Your email is still not verified. Please check your inbox.");
      }
    } catch (err) {
      let friendly = "Failed to check verification status.";
      if (err.code === "auth/user-token-expired" || err.code === "auth/invalid-user-token") {
        friendly = "Session expired. Please log in again.";
      } else if (err.message) {
        friendly = err.message;
      }
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    setStatus("");
    try {
      // Reload before sending to ensure latest state
      await reload(user);

      if (auth.currentUser.emailVerified) {
        setStatus("Your email is already verified!");
        setSent(false);
        // Navigate immediately
        navigate("/home");
        return;
      }

      await sendEmailVerification(user);
      setSent(true);
      setStatus("Verification email sent! Please check your inbox and follow the instructions.");
    } catch (err) {
      let friendly = "Something went wrong. Try again later.";
      if (err.code === "auth/too-many-requests") {
        friendly = "Too many requests. Please wait before trying again.";
      } else if (err.code === "auth/user-not-found") {
        friendly = "User not found. Please login again.";
      } else if (err.code === "auth/invalid-recipient-email") {
        friendly = "Invalid email address.";
      } else if (err.message) {
        friendly = err.message;
      }
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.emailVerified) return null;

  return (
    <div style={{ margin: "24px 0" }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Your email is not verified. Please verify to access all features.
      </Alert>

      <Button
        variant="contained"
        color="primary"
        disabled={loading || sent}
        onClick={handleVerify}
        sx={{ mr: 2, mb: 1 }}
      >
        {loading ? "Sending..." : sent ? "Sent!" : "Send Verification Email"}
      </Button>

      <Button
        variant="outlined"
        color="primary"
        disabled={loading}
        onClick={checkVerificationStatus}
        sx={{ mb: 2 }}
      >
        {loading ? "Checking..." : "Check Verification Status"}
      </Button>

      {status && (
        <Typography color="primary" sx={{ mt: 2 }}>
          {status}
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </div>
  );
}

export default EmailVerificationBanner;
