"use client";

import { useReportData } from "@/context/ReportDataContext";

export default function RankingTab() {
  const { rankings } = useReportData();

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-2">Top Users (Total Hours)</p>
      <ul className="space-y-2">
        {rankings.map((user, index) => (
          <li
            key={index}
            className="flex justify-between bg-gray-100 p-2 rounded-md"
          >
            <span>{user.name}</span>
            <span className="font-semibold">{user.hours}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
