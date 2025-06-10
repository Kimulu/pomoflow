// src/components/Navbar.tsx
"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Settings,
  BarChart2,
  LogIn,
  User,
  MoreVertical,
  LogOut,
} from "lucide-react";
import NavButton from "./Navbutton";
import ReportsModal from "./Reports/ReportsModal";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (err) {
      console.error("Navbar: Logout failed", err);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md px-2 py-3 sm:px-4 sm:py-4">
        {" "}
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {" "}
          {/* No default gap here, rely on internal elements */}
          {/* Logo - Adjusting text size and gap for even smaller screens */}
          <Link
            href="/"
            // text-base (16px) on smallest, sm:text-lg (18px), md:text-2xl (24px)
            // gap-0.5 (2px) on smallest, sm:gap-1 (4px), md:gap-2 (8px)
            className="text-base sm:text-lg md:text-2xl font-bold text-red-500 flex items-center gap-0.5 sm:gap-1 md:gap-2"
          >
            🍅 Pomoflow {/* The full text is always present and scales */}
          </Link>
          {/* Nav Items - Reduced gap between them */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
            {" "}
            {/* Even smaller gap for icons on tiny screens */}
            <NavButton
              // Icons: w-3 h-3 (12px) on smallest, sm:w-4 sm:h-4 (16px), md:w-5 md:h-5 (20px)
              icon={
                <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              }
              label="Report"
              onClick={() => setShowReports(true)}
              hideLabelOnSmall={true}
            />
            <NavButton
              icon={
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              }
              label="Settings"
              hideLabelOnSmall={true}
            />
            {isLoading ? (
              // Loading skeleton also scales with new smaller dimensions
              <div className="w-12 sm:w-16 h-6 sm:h-7 bg-gray-200 rounded-md animate-pulse"></div>
            ) : user ? (
              // User is logged in
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  // Padding reduced for very small screens
                  className="text-gray-600 hover:text-blue-500 transition p-0.5 sm:p-1 rounded-md hover:bg-gray-100"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50">
                    <div className="px-4 py-2 text-gray-800 text-sm border-b font-medium">
                      {user.email}
                      {user.username && (
                        <span className="block text-xs text-gray-500">
                          @{user.username}
                        </span>
                      )}
                    </div>
                    <ul className="text-sm text-gray-700">
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Pomoflow Plus
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Learn
                      </li>
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              // User is NOT logged in
              <>
                <Link href="/login">
                  <NavButton
                    icon={
                      <LogIn className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    }
                    label="Sign In"
                    hideLabelOnSmall={true}
                  />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    // Padding reduced for very small screens
                    className="text-gray-600 hover:text-blue-500 transition p-0.5 sm:p-1 rounded-md hover:bg-gray-100"
                  >
                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                      <ul className="text-sm text-gray-700">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          Pomoflow Plus
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          Learn
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          <Link href="/register">Sign Up</Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Reports Modal */}
      {showReports && <ReportsModal onClose={() => setShowReports(false)} />}
    </>
  );
}
