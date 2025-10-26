import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaLock,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import { login as loginAPI } from "../../https/index";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "POS | Super Admin Login";

    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem("superAdminEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "", // 'success' or 'error'
    title: "",
    message: "",
  });

  // Notification helper functions
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    // Auto hide after 5 seconds for error, 3 seconds for success
    setTimeout(
      () => {
        setNotification((prev) => ({ ...prev, show: false }));
      },
      type === "error" ? 5000 : 3000
    );
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email must not exceed 100 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (formData.password.length > 128) {
      newErrors.password = "Password must not exceed 128 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification(
        "error",
        "Validation Error",
        "Please fix the errors in the form and try again."
      );
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log("Submitting login data:", {
        ...formData,
        password: "***masked***",
      });

      const response = await loginAPI(formData);

      console.log("Login successful:", response);

      // Store user data in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem("superAdminEmail", formData.email);
      } else {
        localStorage.removeItem("superAdminEmail");
      }

      showNotification(
        "success",
        "Login Successful!",
        `Welcome back! Redirecting to your dashboard...`
      );

      // Clear form after successful login
      setFormData({
        email: "",
        password: "",
      });

      // Redirect to super admin dashboard after 2 seconds
      setTimeout(() => {
        navigate("/superAdmin");
      }, 2000);
    } catch (error) {
      console.error("Login failed:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Login Failed";

      if (error.response?.data) {
        const { message, error: serverError } = error.response.data;
        errorMessage = message || serverError || errorMessage;

        // Handle specific error cases
        if (error.response.status === 400) {
          if (errorMessage.toLowerCase().includes("all fields are required")) {
            errorTitle = "Missing Information";
            errorMessage = "Please fill in all required fields.";
          }
        } else if (error.response.status === 401) {
          if (errorMessage.toLowerCase().includes("invalid credentials")) {
            errorTitle = "Invalid Credentials";
            errorMessage =
              "The email or password you entered is incorrect. Please check your credentials and try again.";
          }
        } else if (error.response.status === 500) {
          errorTitle = "Server Error";
          errorMessage =
            "Server is currently unavailable. Please try again later.";
        }
      } else if (error.request) {
        errorTitle = "Network Error";
        errorMessage =
          "Unable to connect to the server. Please check your internet connection and try again.";
      }

      showNotification("error", errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] via-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center p-4">
      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#404040] p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === "success"
                    ? "bg-green-900 text-green-300"
                    : "bg-red-900 text-red-300"
                }`}
              >
                {notification.type === "success" ? (
                  <FaCheckCircle className="text-lg" />
                ) : (
                  <FaExclamationCircle className="text-lg" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">
                  {notification.title}
                </h3>
                <p className="text-[#a0a0a0] text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={closeNotification}
                className="flex-shrink-0 text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={closeNotification}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  notification.type === "success"
                    ? "bg-green-900 hover:bg-green-800 text-green-100"
                    : "bg-red-900 hover:bg-red-800 text-red-100"
                }`}
              >
                {notification.type === "success" ? "Continue" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#404040] p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] rounded-full mb-4">
              <FaUserShield className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] mb-2">
              Super Admin
            </h1>
            <p className="text-[#a0a0a0] text-sm sm:text-base">
              Restaurant POS System Management
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <MdRestaurant className="text-[#60a5fa] text-lg" />
              <span className="text-[#60a5fa] text-sm font-medium">
                Administrative Access
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[#f5f5f5] text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-[#a0a0a0]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 bg-[#262626] text-[#f5f5f5] rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-[#404040] hover:border-[#505050]"
                  }`}
                  placeholder="admin@restaurant.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[#f5f5f5] text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-[#a0a0a0]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 bg-[#262626] text-[#f5f5f5] rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-[#404040] hover:border-[#505050]"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className={`h-4 w-4 text-[#60a5fa] bg-[#262626] border-[#404040] rounded focus:ring-[#60a5fa] focus:ring-2 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-[#a0a0a0]"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-[#60a5fa] hover:text-[#3b82f6] transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform ${
                isLoading
                  ? "bg-[#404040] text-[#a0a0a0] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-white hover:from-[#3b82f6] hover:to-[#2563eb] hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-[#262626] rounded-lg border border-[#404040]">
            <div className="flex items-start gap-3">
              <div className="text-center">
                <p className="text-[white] text-sm">
                  © 2025 Restaurant POS System. All rights reserved. | Powered
                  by{" "}
                  <a
                    href="https://miteminds.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:underline"
                  >
                    MiteMinds
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default Login;
