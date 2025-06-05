// @ts-nocheck
"use client";

import { useState, useContext } from "react"; // Removed useEffect as it's not needed here
import { AuthContext } from "../context/AuthContext"; // Ensure this path is correct
import {
  Settings,
  BarChart2,
  LogIn,
  User,
  MoreVertical,
  LogOut,
} from "lucide-react"; // LogOut icon is now part of the dropdown
import NavButton from "./Navbutton";
import ReportsModal from "./Reports/ReportsModal";
import Link from "next/link";
import { useRouter } from "next/router"; // Import useRouter for client-side navigation

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const router = useRouter(); // Initialize router

  // Destructure user, isLoading, and the logout function from AuthContext
  const { user, isLoading, logout } = useContext(AuthContext); // Get logout from context

  // The handleLogout now simply calls the logout function from AuthContext
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from AuthContext
      setOpen(false); // Close the dropdown after logout
      // AuthContext's logout function handles setting user to null and isAuthenticated to false
      // It also handles redirection if implemented in AuthContext.
    } catch (err) {
      console.error("Navbar: Logout failed", err);
      // AuthContext's logout function will likely handle the error display via its 'error' state
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-red-500 flex items-center gap-2"
          >
            <span className="sm:hidden">🍅</span>
            <span className="hidden sm:inline-flex items-center gap-2">
              🍅 Pomoflow
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-4">
            <NavButton
              icon={<BarChart2 className="w-5 h-5" />}
              label="Report"
              onClick={() => setShowReports(true)}
            />
            <NavButton
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
            />

            {/* Conditional Rendering based on isLoading */}
            {isLoading ? (
              // Show a subtle loading skeleton or spinner while authentication status is being determined
              <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            ) : user ? ( // User is logged in
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="text-gray-600 hover:text-blue-500 transition p-1 rounded-md hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50">
                    <div className="px-4 py-2 text-gray-800 text-sm border-b font-medium">
                      {user.email} {/* Display user's email */}
                      {user.username && (
                        <span className="block text-xs text-gray-500">
                          @{user.username}
                        </span>
                      )}{" "}
                      {/* Display username if available */}
                    </div>
                    <ul className="text-sm text-gray-700">
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Pomoflow Plus
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Learn
                      </li>
                      <li
                        onClick={handleLogout} // Call the simplified handleLogout
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
                    icon={<LogIn className="w-5 h-5" />}
                    label="Sign In"
                  />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    className="text-gray-600 hover:text-blue-500 transition p-1 rounded-md hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
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
                        {/* Removed duplicate login link as it's already a NavButton */}
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
