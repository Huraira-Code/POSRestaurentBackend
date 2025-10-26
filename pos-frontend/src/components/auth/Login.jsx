import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query"
import { login } from "../../https/index"
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
 
const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Validation function
    const validateForm = () => {
      const newErrors = {};
      
      // Email validation
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      
      // Password validation
      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({...formData, [name]: value});
      
      // Clear specific field error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Validate form before submission
      if (!validateForm()) {
        enqueueSnackbar("Please fix the errors before submitting", { variant: "error" });
        return;
      }
      
      loginMutation.mutate(formData);
    };

    const loginMutation = useMutation({
      mutationFn: (reqData) => login(reqData),
      onMutate: () => {
        setIsLoading(true);
      },
      onSuccess: (res) => {
          const { data } = res;
          console.log(data);
          
          if (data.success) {
            const { _id, name, email, phone, role } = data.data;
            dispatch(setUser({ _id, name, email, phone, role }));
            enqueueSnackbar(data.message || "Login successful!", { variant: "success" });
            navigate("/dashboard");
          } else {
            enqueueSnackbar(data.message || "Login failed", { variant: "error" });
          }
      },
      onError: (error) => {
        console.error('Login error:', error);
        const errorMessage = error?.response?.data?.message || "Login failed. Please try again.";
        enqueueSnackbar(errorMessage, { variant: "error" });
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Employee Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter employee email"
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-[#262626] border rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-[#404040]'
              } ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-[#262626] border rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-[#404040]'
              } ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed text-gray-300'
              : 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
