import React, { useState } from "react";
import { Avatar, Menu, MenuItem, IconButton, Typography } from "@mui/material";
import { Logout, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function NavAvatar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // 1. Get exact strings from sessionStorage
  const userEmail = sessionStorage.getItem("userEmail") || "";
  const userName = sessionStorage.getItem("userName") || "";

  // 2. Set the image ONLY if the email matches
  let avatarUrl = "";
  if (userEmail === "shivanshsingh4539@gmail.com") {
    avatarUrl = "/thise.jpeg";
  }

  // 3. Generate initials (First letter of first name + First letter of second name)
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget); 
  const handleMenuClose = () => setAnchorEl(null);

  const Logoutuser = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <IconButton onClick={handleMenuOpen} style={{ padding: "10px" }}>
        <Avatar src={avatarUrl} alt={userName}>
          {!avatarUrl && getInitials(userName)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        keepMounted
      >
        <MenuItem onClick={handleMenuClose}>
          <Person sx={{ marginRight: 1 }} />
          <Typography>My Profile</Typography>
        </MenuItem>

        <MenuItem onClick={Logoutuser}>
          <Logout sx={{ marginRight: 1, color: "red" }} />
          <Typography color="error">Sign Out</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default NavAvatar;