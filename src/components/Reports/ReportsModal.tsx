"use client";

import { useState } from "react";
import { X } from "lucide-react";

const tabs = ["Summary", "Detail", "Rankings"] as const;
type TabType = (typeof tabs)[number];

interface ReportsModalProps {
  onClose: () => void;
}

export default function ReportsModal({ onClose }: ReportsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Summary");

  return (
    <div className="fixed inset-0 bg-indigo-800 bg-opacity-100 z-50 flex justify-center items-center p-4">
      <div className="bg-white w-[700px] max-w-4xl rounded-xl shadow-xl overflow-hidden">
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
        {/* Tabs (consistent style) */}
        <div className="tabs tabs-box justify-center px-4">
          {tabs.map((tab) => (
            <a
              role="tab"
              key={tab}
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="sm:hidden">{tab.slice(0, 3)}</span>
              <span className="hidden sm:inline">{tab}</span>
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "Summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Total Focus Hours</p>
                  <p className="text-2xl font-bold text-red-500">47h</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Days Accessed</p>
                  <p className="text-2xl font-bold text-red-500">23</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Day Streak</p>
                  <p className="text-2xl font-bold text-red-500">6🔥</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Focus Hours Chart</p>
                <div className="w-full h-64 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                  [Chart Placeholder]
                </div>
              </div>
            </div>
          )}

          {activeTab === "Detail" && (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Task / Project</th>
                    <th className="py-2 px-4">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 px-4">2025-05-30</td>
                    <td className="py-2 px-4">Pomoflow UI</td>
                    <td className="py-2 px-4">2.5</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">2025-05-29</td>
                    <td className="py-2 px-4">API Integration</td>
                    <td className="py-2 px-4">3.0</td>
                  </tr>
                  {/* Add dynamic rows here */}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Rankings" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">
                Top Users (Total Hours)
              </p>
              <ul className="space-y-2">
                <li className="flex justify-between bg-gray-100 p-2 rounded-md">
                  <span>🧑 Alex</span>
                  <span className="font-semibold">54h</span>
                </li>
                <li className="flex justify-between bg-gray-100 p-2 rounded-md">
                  <span>🧑 Jamie</span>
                  <span className="font-semibold">48h</span>
                </li>
                <li className="flex justify-between bg-gray-100 p-2 rounded-md">
                  <span>🧑 You</span>
                  <span className="font-semibold">47h</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
