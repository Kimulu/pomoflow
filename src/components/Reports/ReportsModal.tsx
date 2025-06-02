"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import usePortal from "@/hooks/usePortal";
import SummaryTab from "./SummaryTab";
import DetailTab from "./DetailTab";
import RankingTab from "./RankingsTab";

const tabs = ["Summary", "Detail", "Rankings"] as const;
type TabType = (typeof tabs)[number];

interface ReportsModalProps {
  onClose: () => void;
}

export default function ReportsModal({ onClose }: ReportsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Summary");
  const portalTarget = usePortal();

  if (!portalTarget) return null;

  return createPortal(
    <div className="fixed h-screen left-0 right-0  top-[64px] sm:top-[72px] z-40 flex justify-center items-start p-2 sm:p-4  pointer-events-none">
      {/* Backdrop */}
      <div
        className=" bg-indigo-600 opacity-25  fixed inset-0 z-30 pointer-events-auto"
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div className="relative z-40 bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden mx-2 pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold">📊 Reports & Stats</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-box justify-center">
          {tabs.map((tab) => (
            <a
              key={tab}
              role="tab"
              onClick={() => setActiveTab(tab)}
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
            >
              <span className="sm:hidden">{tab.slice(0, 3)}</span>
              <span className="hidden sm:inline">{tab}</span>
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "Summary" && <SummaryTab />}
          {activeTab === "Detail" && <DetailTab />}
          {activeTab === "Rankings" && <RankingTab />}
        </div>
      </div>
    </div>,
    portalTarget
  );
}
