import React, { useEffect } from "react";
import { FaUserTie } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import Login from "../components/adminAuth/Login";

const Auth = () => {
  useEffect(() => {
    document.title = "POS | Employee Login";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#404040] p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-full mb-4">
              <FaUserTie className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] mb-2">
              Employee Login
            </h1>
            <p className="text-[#a0a0a0] text-sm sm:text-base">
              Restaurant POS System Access
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <MdRestaurant className="text-[#f59e0b] text-lg" />
              <span className="text-[#f59e0b] text-sm font-medium">
                Employee Portal
              </span>
            </div>
          </div>

          {/* Login Component */}
          <div>
            <Login />
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#404040]">
            <div className="text-center">
              <p className="text-xl text-gray-400">
                Powered by{" "}
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

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full opacity-10 blur-xl"></div>
      </div>
    </div>
  );
};

export default Auth;
