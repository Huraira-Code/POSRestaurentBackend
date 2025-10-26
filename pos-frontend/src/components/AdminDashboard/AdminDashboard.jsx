import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import BottomNav from "../shared/BottomNav";
import BackButton from "../shared/BackButton";
import Menu from "../../pages/Menu";
import Modal from "../shared/Modal";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";

const AdminDashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logout();
      if (response.data.success) {
        // Clear user data from Redux store
        dispatch(removeUser());
        // Navigate to login page
        navigate('/auth');
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if API fails, clear local state and redirect
      dispatch(removeUser());
      navigate('/auth');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <section className="bg-[#1f1f1f] min-h-screen">
      {/* Admin Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdDashboard className="text-[#f59e0b] text-2xl sm:text-3xl" />
            <h1 className="text-[#f5f5f5] text-lg sm:text-xl lg:text-2xl font-bold tracking-wider">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaUser className="text-[#f5f5f5] text-lg sm:text-xl" />
              <div className="hidden sm:flex flex-col items-start">
                <h2 className="text-sm sm:text-md text-[#f5f5f5] font-semibold tracking-wide">
                  {userData.name || "Admin User"}
                </h2>
                <p className="text-xs text-[#ababab] font-medium">
                  Role: {userData.role || "Administrator"}
                </p>
              </div>
              <span className="sm:hidden text-[#f5f5f5] text-sm font-medium">
                {userData.name || "Admin"}
              </span>
            </div>
            
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <MdLogout className="text-lg" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Component */}
      <div className="relative">
        <Menu />
      </div>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={handleLogoutCancel} title="Confirm Logout">
        <div className="text-center">
          <div className="mb-6">
            <MdLogout className="mx-auto text-red-500 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">
              Are you sure you want to logout?
            </h3>
            <p className="text-[#ababab] text-sm">
              You will be redirected to the login page and will need to sign in again.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleLogoutCancel}
              className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#f5f5f5] rounded-lg transition-colors duration-200 font-medium"
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <MdLogout className="text-lg" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default AdminDashboard;