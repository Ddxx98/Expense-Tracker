import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { updateProfile, reload } from "firebase/auth";

function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    photoURL: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // Reload to get the latest user info, useful after refresh 
        await reload(auth.currentUser);

        const user = auth.currentUser;
        if (user) {
          setForm({
            username: user.displayName || "",
            photoURL: user.photoURL || "",
          });
        } else {
          // User is not logged in, redirect to login page
          navigate("/login");
        }
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile(auth.currentUser, {
        displayName: form.username,
        photoURL: form.photoURL,
      });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser)
    return (
      <Container maxWidth="xs" sx={{ mt: 6, textAlign: "center" }}>
        <Typography>Loading user data...</Typography>
      </Container>
    );

  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Box
        sx={{ p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: "background.paper" }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Complete Your Profile
        </Typography>

        {form.photoURL && (
          <Avatar
            src={form.photoURL}
            sx={{ width: 64, height: 64, mx: "auto", my: 2 }}
            alt="User Avatar"
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleUpdate} noValidate>
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="User Image URL"
            name="photoURL"
            value={form.photoURL}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            placeholder="https://example.com/your-image.jpg"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Profile;
