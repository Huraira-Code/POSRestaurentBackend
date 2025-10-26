import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaUserTie,
  FaUtensils,
  FaCashRegister,
} from "react-icons/fa";
import { MdRestaurant, MdAnalytics } from "react-icons/md";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "POS System | Welcome";
  }, []);

  const handleAdminLogin = () => {
    navigate("/auth");
  };

  const handleSuperAdminLogin = () => {
    navigate("/superAdminlogin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1f1f1f] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] p-4 rounded-full">
              <FaCashRegister className="text-4xl text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] to-[#3b82f6]">
              POS System
            </span>
          </h1>

          {/* Powered by */}
          <div className="mt-8 text-xl text-gray-400 mb-2">
            Powered by{" "}
            <a
              href="https://miteminds.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#60a5fa] hover:underline"
            >
              MiteMinds
            </a>
            
          </div>

          <p className="text-xl text-[#a0a0a0] mb-2">
            Complete Restaurant Management Solution
          </p>
          <p className="text-lg text-[#606060]">
            Streamline your restaurant operations with our powerful
            point-of-sale system
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#262626] p-6 rounded-xl border border-[#404040] hover:border-[#60a5fa] transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-lg mb-4">
              <MdRestaurant className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Menu Management
            </h3>
            <p className="text-[#a0a0a0]">
              Create and manage your restaurant menu with categories, items, and
              pricing.
            </p>
          </div>

          <div className="bg-[#262626] p-6 rounded-xl border border-[#404040] hover:border-[#60a5fa] transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-lg mb-4">
              <FaUtensils className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Order Processing
            </h3>
            <p className="text-[#a0a0a0]">
              Efficient order management with real-time tracking and status
              updates.
            </p>
          </div>

          <div className="bg-[#262626] p-6 rounded-xl border border-[#404040] hover:border-[#60a5fa] transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] rounded-lg mb-4">
              <MdAnalytics className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Analytics & Reports
            </h3>
            <p className="text-[#a0a0a0]">
              Comprehensive analytics to track sales, performance, and growth.
            </p>
          </div>
        </div>

        {/* Login Options */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Choose Your Access Level
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Admin Login Card */}
            <div className="bg-gradient-to-br from-[#262626] to-[#1a1a1a] p-8 rounded-2xl border border-[#404040] hover:border-[#60a5fa] transition-all duration-300 hover:shadow-2xl hover:shadow-[#60a5fa]/20">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] rounded-full mb-6 mx-auto">
                <FaUserTie className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Admin Login
              </h3>
              <p className="text-[#a0a0a0] mb-6 leading-relaxed">
                Access restaurant management features including menu creation,
                order processing, and basic analytics.
              </p>
              <ul className="text-left text-[#a0a0a0] mb-8 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#60a5fa] rounded-full mr-3"></span>
                  Manage restaurant operations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#60a5fa] rounded-full mr-3"></span>
                  Process orders and payments
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#60a5fa] rounded-full mr-3"></span>
                  View sales analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#60a5fa] rounded-full mr-3"></span>
                  Manage menu items
                </li>
              </ul>
              <button
                onClick={handleAdminLogin}
                className="w-full py-4 bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Login as Admin
              </button>
            </div>

            {/* Super Admin Login Card */}
            <div className="bg-gradient-to-br from-[#262626] to-[#1a1a1a] p-8 rounded-2xl border border-[#404040] hover:border-[#10b981] transition-all duration-300 hover:shadow-2xl hover:shadow-[#10b981]/20">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full mb-6 mx-auto">
                <FaUserShield className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Super Admin Login
              </h3>
              <p className="text-[#a0a0a0] mb-6 leading-relaxed">
                Complete system control with advanced management capabilities
                and multi-restaurant oversight.
              </p>
              <ul className="text-left text-[#a0a0a0] mb-8 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#10b981] rounded-full mr-3"></span>
                  Manage multiple restaurants
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#10b981] rounded-full mr-3"></span>
                  Create and manage admin accounts
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#10b981] rounded-full mr-3"></span>
                  System-wide analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#10b981] rounded-full mr-3"></span>
                  Advanced configuration
                </li>
              </ul>
              <button
                onClick={handleSuperAdminLogin}
                className="w-full py-4 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Login as Super Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
