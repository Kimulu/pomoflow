"use client";

import { useReportData } from "@/context/ReportDataContext";

export default function SummaryTab() {
  const { summary } = useReportData();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Focus Hours</p>
          <p className="text-2xl font-bold text-red-500">
            {summary.totalHours}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-500">Days Accessed</p>
          <p className="text-2xl font-bold text-red-500">
            {summary.daysAccessed}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-500">Day Streak</p>
          <p className="text-2xl font-bold text-red-500">{summary.streak}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-500 mb-2">Focus Hours Chart</p>
        <div className="w-full h-64 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          [Chart Placeholder]
        </div>
      </div>
    </div>
  );
}
