"use client";

import { useState } from "react";
import {
  MoreVertical,
  Settings,
  BarChart2,
  LogIn,
  UserPlus,
} from "lucide-react";
import NavButton from "./Navbutton";
import ReportsModal from "./Reports/ReportsModal"; // ⬅️ Import the modal

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showReports, setShowReports] = useState(false); // ⬅️ New state

  return (
    <>
      <nav className="bg-white shadow-md px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-red-500">
            <span className="sm:hidden">🍅</span>
            <span className="hidden sm:inline-flex items-center gap-2">
              🍅 Pomoflow
            </span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-4">
            <NavButton
              icon={<BarChart2 className="w-5 h-5" />}
              label="Report"
              onClick={() => setShowReports(true)} // ⬅️ Open modal
            />
            <NavButton
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
            />
            <NavButton icon={<LogIn className="w-5 h-5" />} label="Sign In" />

            {/* Dropdown */}
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
                      Sign Up
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showReports && <ReportsModal onClose={() => setShowReports(false)} />}{" "}
      {/* ⬅️ Render modal */}
    </>
  );
}
