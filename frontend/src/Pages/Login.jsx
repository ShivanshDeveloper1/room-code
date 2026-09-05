import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./login.css";
import axios from "axios";
import logo from "../images/gnet-logo.jpg";
import robot from "../images/robot-icon.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import Base_url from "./config";


const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const socialLinks = [
    {
      icon: <FaGoogle />,
      url: "https://share.google/HyP263Tcx3BeSAq5V",
      color: "#DB4437",
    },
  ];

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === "login") {
      setLoginForm({ ...loginForm, [name]: value });
    } else {
      setRegisterForm({ ...registerForm, [name]: value });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = `${Base_url}/auth/login`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      const requestBody = {
        email: loginForm.email,
        password: loginForm.password,
      };

      const response = await axios.post(url, requestBody, { headers });
      console.log("response of login api", response.data);
      if (response.data.message === "User login successfully") {
        toast.success("Logged in successfully!");

        const token = response.data.token;
        const userData = response.data.user;

        // Store complete user data in session storage
        sessionStorage.setItem("accessToken", token);
        sessionStorage.setItem("userData", JSON.stringify(userData));
        sessionStorage.setItem("userRole", userData?.role);
        sessionStorage.setItem("userId", userData?.id);
        sessionStorage.setItem("userName", userData?.name);
        sessionStorage.setItem("userEmail", userData?.email);

        switch (userData?.role) {
          case "superadmin":
            navigate("/super-admin-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "user":
            navigate("/welcome");
            break;
          default:
            toast.error("Unknown user role");
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = `${Base_url}/auth/register`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const response = await axios.post(url, registerForm, { headers });
      console.log("user register", response.data);
      if (response.data.message === "User registered successfully") {
        toast.success("Registration successful! Please login.");
        setIsLogin(true);
        setRegisterForm({ name: "", email: "", password: "" });
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="login-container">
      <div className="header-section">
        <img src={logo} alt="Company Logo" className="logo" />
        <img src={robot} alt="Flying Robot" className="robot" />
      </div>

      <div className="welcome-section">
        <h2 className="welcome-title">Welcome to Infun India</h2>
      </div>

      <div className="auth-container">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={loginForm.email}
                onChange={(e) => handleInputChange(e, "login")}
                required
                className="form-input"
              />
            </div>
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => handleInputChange(e, "login")}
                required
                className="form-input"
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button
              type="submit"
              className="auth-btn"
              disabled={isLoading || !loginForm.email || !loginForm.password}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={registerForm.name}
                onChange={(e) => handleInputChange(e, "register")}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={registerForm.email}
                onChange={(e) => handleInputChange(e, "register")}
                required
                className="form-input"
              />
            </div>
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => handleInputChange(e, "register")}
                required
                className="form-input"
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button
              type="submit"
              className="auth-btn"
              disabled={
                isLoading ||
                !registerForm.name ||
                !registerForm.email ||
                !registerForm.password
              }
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "Register"
              )}
            </button>
          </form>
        )}

        {/* <div className="social-section">
          <p className="social-text">Connect with us</p>
          <div className="social-icons">
            {socialLinks.map((social, index) => (
              <div
                key={index}
                className="social-icon"
                style={{ "--icon-color": social.color }}
                onClick={() => handleSocialClick(social.url)}
              >
                {social.icon}
              </div>
            ))}
          </div>
        </div> */}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
