import { JSX } from "react";
import React from "react";

interface NavButtonProps {
  icon: JSX.Element;
  label: string;
  onClick?: () => void; // Add optional onClick handler
  hideLabelOnSmall?: boolean;
}

// Reusable nav button with icon + label + tooltip
export default function NavButton({ icon, label, onClick }: NavButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition duration-200"
      >
        {icon}
        <span className="hidden lg:inline">{label}</span>
      </button>

      {/* Tooltip: only visible on hover when label is hidden */}
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition duration-200 text-xs bg-gray-800 text-white px-2 py-1 rounded-md whitespace-nowrap z-10 lg:hidden">
        {label}
      </span>
    </div>
  );
}
