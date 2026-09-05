import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CssBaseline,
  Grid,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";

const defaultTheme = createTheme();

const ForgetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const url = `http://localhost:5000/api/admin/reset-password/${token}`;
      const response = await axios.post(url, { newPassword });

      // console.log("Response of reset password", response.data);

      Swal.fire({
        icon: "success",
        title: "Password Updated!",
        text: "Your password has been successfully updated.",
      });
      navigate("/");
    } catch (error) {
      // console.error("Error resetting password:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          p: 2,
          backgroundColor: (theme) => theme.palette.grey[50],
        }}
      >
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography
              component="h1"
              variant="h5"
              align="center"
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Set New Password
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                required
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default ForgetPassword;
 
