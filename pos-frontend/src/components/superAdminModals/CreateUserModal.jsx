import React, { useState, useEffect } from 'react';
import { registerAdmin } from '../../https/index';

const CreateUserModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  allAdmins = [],
  createdUser = null 
}) => {
  const [userFormData, setUserFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Admin'
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userCreationError, setUserCreationError] = useState('');
  const [userCreationSuccess, setUserCreationSuccess] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'Admin'
      });
      setUserCreationError('');
      setUserCreationSuccess('');
    }
  }, [isOpen]);

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (userCreationError) {
      setUserCreationError('');
    }
  };

  const handleCreateUser = async () => {
    // Reset any previous errors or success messages
    setUserCreationError('');
    setUserCreationSuccess('');
    
    // Validate required fields
    const { name, phone, email, password, role } = userFormData;
    if (!name || !phone || !email || !password || !role) {
      setUserCreationError('All fields are required!');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setUserCreationError('Please enter a valid email address!');
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      setUserCreationError('Password must be at least 6 characters long!');
      return;
    }
    
    setIsCreatingUser(true);
    
    try {
      console.log('Creating admin user:', userFormData);
      
      const response = await registerAdmin(userFormData);
      
      console.log('Admin user created successfully:', response);
      
      // Show success message
      setUserCreationSuccess('Admin user created successfully!');
      
      // Create user data for step completion
      const userData = {
        id: response.data.data._id || Date.now(),
        name: response.data.data.name,
        email: response.data.data.email,
        role: response.data.data.role,
        status: "Active",
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onSuccess(1, userData);
        onClose();
        setUserCreationSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create admin user:', error);
      
      // Handle different error scenarios
      if (error.response?.data) {
        const { message, error: serverError } = error.response.data;
        setUserCreationError(message || 'Failed to create admin user');
        
        if (error.response.status === 400) {
          console.warn('Validation error:', { message, serverError });
        } else if (error.response.status === 401) {
          console.warn('Unauthorized - invalid or missing token');
          setUserCreationError('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          console.warn('Access denied - insufficient permissions');
          setUserCreationError('Access denied. You do not have permission to create admin users.');
        } else if (error.response.status === 500) {
          console.error('Server error during user creation');
          setUserCreationError('Server error. Please try again later.');
        }
      } else if (error.request) {
        console.error('Network error - unable to reach server:', error.request);
        setUserCreationError('Network error. Please check your connection and try again.');
      } else {
        console.error('Unexpected error during user creation:', error.message);
        setUserCreationError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-[450px] max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-6">Create New Admin User</h2>
        
        {/* Error/Success Messages */}
        {userCreationError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">{userCreationError}</p>
          </div>
        )}
        
        {userCreationSuccess && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-green-300 text-sm">{userCreationSuccess}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              name="name"
              value={userFormData.name}
              onChange={handleUserFormChange}
              disabled={isCreatingUser}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input 
              type="tel" 
              name="phone"
              value={userFormData.phone}
              onChange={handleUserFormChange}
              disabled={isCreatingUser}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input 
              type="email" 
              name="email"
              value={userFormData.email}
              onChange={handleUserFormChange}
              disabled={isCreatingUser}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="user@restaurant.com"
            />
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Password <span className="text-red-400">*</span>
            </label>
            <input 
              type="password" 
              name="password"
              value={userFormData.password}
              onChange={handleUserFormChange}
              disabled={isCreatingUser}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter password (min 6 characters)"
            />
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Role <span className="text-red-400">*</span>
            </label>
            <select 
              name="role"
              value={userFormData.role}
              onChange={handleUserFormChange}
              disabled={isCreatingUser}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            disabled={isCreatingUser}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isCreatingUser 
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed' 
                : 'bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateUser}
            disabled={isCreatingUser}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isCreatingUser
                ? 'bg-[#3b82f6] opacity-50 cursor-not-allowed text-white'
                : 'bg-[#60a5fa] hover:bg-[#3b82f6] text-white'
            }`}
          >
            {isCreatingUser ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Admin User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
