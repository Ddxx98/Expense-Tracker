import React, { useState } from "react";
import { Button, Alert, Typography } from "@mui/material";
import { auth } from "../../firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function EmailVerificationBanner() {
  const user = auth.currentUser;
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async () => {
    setError("");
    setStatus("");
    setLoading(true);
    try {
      // Reload before checking verification status
      await reload(user);

      if (user.emailVerified) {
        setStatus("Your email is already verified!");
        setSent(false);
        navigate("/");
        return;
      }

      await sendEmailVerification(user);
      setSent(true);
      setStatus("Verification email sent! Please check your inbox and follow the instructions.");
    } catch (err) {
      // Handle errors per Firebase doc
      let friendly = "Something went wrong. Try again later.";
      if (err.code === "auth/too-many-requests") {
        friendly = "Too many requests. Please wait before trying again.";
      } else if (err.code === "auth/user-not-found") {
        friendly = "User not found. Please login again.";
      } else if (err.code === "auth/invalid-user-token" || err.code === "auth/user-token-expired") {
        friendly = "Session expired. Please log in again.";
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

  // Only show the banner if the user is NOT verified
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
      >
        {loading ? "Sending..." : sent ? "Sent!" : "Verify Email"}
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
