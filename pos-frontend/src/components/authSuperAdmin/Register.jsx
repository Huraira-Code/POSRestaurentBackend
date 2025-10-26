import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaUserShield, FaLock, FaEnvelope, FaUser, FaPhone, FaUserTag, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';
import { register as registerAPI } from '../../https/index';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "POS | Super Admin Register";
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success' or 'error'
    title: '',
    message: ''
  });

  // Notification helper functions
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData(prev => ({
      ...prev,
      role: selectedRole
    }));
    // Clear error when user selects a role
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name should only contain letters and spaces';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,15}$/.test(formData.phone.replace(/[\s-()]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must not exceed 100 characters';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password must not exceed 128 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Validation Error', 'Please fix the errors in the form and try again.');
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('Submitting registration data:', formData);
      
      const response = await registerAPI(formData);
      
      console.log('Registration successful:', response);
      
      showNotification(
        'success', 
        'Registration Successful!', 
        `${formData.role} account has been created successfully. You can now login.`
      );
      
      // Clear form after successful registration
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: ''
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/superAdminlogin');
      }, 3000);
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      let errorTitle = 'Registration Failed';
      
      if (error.response?.data) {
        const { message, error: serverError } = error.response.data;
        errorMessage = message || serverError || errorMessage;
        
        // Handle specific error cases
        if (error.response.status === 400) {
          if (errorMessage.toLowerCase().includes('user already exist')) {
            errorTitle = 'Account Already Exists';
            errorMessage = 'An account with this email address already exists. Please use a different email or try logging in.';
          } else if (errorMessage.toLowerCase().includes('all fields are required')) {
            errorTitle = 'Missing Information';
            errorMessage = 'Please fill in all required fields.';
          }
        } else if (error.response.status === 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Server is currently unavailable. Please try again later.';
        }
      } else if (error.request) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      showNotification('error', errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = ['SuperAdmin', 'Restaurant Manager', 'System Administrator'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] via-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center p-4">
      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#404040] p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === 'success' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-red-900 text-red-300'
              }`}>
                {notification.type === 'success' ? (
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
                  notification.type === 'success'
                    ? 'bg-green-900 hover:bg-green-800 text-green-100'
                    : 'bg-red-900 hover:bg-red-800 text-red-100'
                }`}
              >
                {notification.type === 'success' ? 'Continue' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#404040] p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] rounded-full mb-4">
              <FaUserShield className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] mb-2">
              Create Super Admin
            </h1>
            <p className="text-[#a0a0a0] text-sm sm:text-base">
              Register New Administrative Account
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <MdRestaurant className="text-[#60a5fa] text-lg" />
              <span className="text-[#60a5fa] text-sm font-medium">Administrative Access</span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-[#f5f5f5] text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-[#a0a0a0]" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 bg-[#262626] text-[#f5f5f5] rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    errors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#404040] hover:border-[#505050]'
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-[#f5f5f5] text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-[#a0a0a0]" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 bg-[#262626] text-[#f5f5f5] rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#404040] hover:border-[#505050]'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[#f5f5f5] text-sm font-medium mb-2">
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
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#404040] hover:border-[#505050]'
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
              <label htmlFor="password" className="block text-[#f5f5f5] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-[#a0a0a0]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 bg-[#262626] text-[#f5f5f5] rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#404040] hover:border-[#505050]'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
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

            {/* Role Selection */}
            <div>
              <label className="block text-[#f5f5f5] text-sm font-medium mb-3">
                <FaUserTag className="inline-block mr-2" />
                Select Role
              </label>
              <div className="grid grid-cols-1 gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRoleSelection(role)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      isLoading 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    } ${
                      formData.role === role
                        ? 'bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-white border-[#60a5fa]'
                        : 'bg-[#262626] text-[#a0a0a0] border-[#404040] hover:border-[#505050] hover:bg-[#303030]'
                    }`}
                  >
                    <span className="font-medium">{role}</span>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-400">{errors.role}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform ${
                isLoading
                  ? 'bg-[#404040] text-[#a0a0a0] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-white hover:from-[#3b82f6] hover:to-[#2563eb] hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering Account...
                </div>
              ) : (
                'Create Super Admin Account'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-[#262626] rounded-lg border border-[#404040]">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-yellow-900 rounded-full flex items-center justify-center">
                  <span className="text-yellow-300 text-xs">⚠️</span>
                </div>
              </div>
              <div>
                <h4 className="text-[#f5f5f5] text-sm font-medium mb-1">Security Notice</h4>
                <p className="text-[#a0a0a0] text-xs leading-relaxed">
                  Super Admin accounts have full system access. Ensure strong passwords and secure credentials management.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[#606060] text-sm">
            © 2025 Restaurant POS System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;