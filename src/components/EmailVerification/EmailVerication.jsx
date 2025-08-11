import React, { useState, useEffect } from "react";
import { Button, Alert, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { verifyEmailAsync } from "../../store/Auth";

const API_KEY = "AIzaSyCN82e4ls26Z0UrYCNkCoV3bjgs1f_Xpj8"
const SEND_VERIFY = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;
const LOOKUP = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`;

function EmailVerificationBanner() {
  const dispatch = useDispatch();
  const { userId, token, isVerified } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkVerificationStatus = async () => {
    if (!token) return false;
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const response = await axios.post(LOOKUP, { idToken: token });
      const userData = response.data.users?.[0];
      if (!userData) throw new Error("No user data found.");
      const verified = userData.emailVerified;
      if (verified) {
        setStatus("Your email is now verified!");
        setSent(false);
        dispatch(verifyEmailAsync(token));
        navigate("/home");
      } else {
        setStatus("Your email is still not verified. Please check your inbox.");
      }
      return verified;
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to check verification status."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || !userId) return;
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const verified = await checkVerificationStatus();
      if (verified) {
        setStatus("Your email is already verified!");
        navigate("/home");
        return;
      }
      await axios.post(SEND_VERIFY, {
        requestType: "VERIFY_EMAIL",
        idToken: token,
      });
      setSent(true);
      setStatus("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Something went wrong. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) {
      checkVerificationStatus();
    }
  }, [token, userId, isVerified]); // Only when token/userId changes

  if (!token || !userId) return null;

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
