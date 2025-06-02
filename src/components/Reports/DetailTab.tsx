"use client";

import { useReportData } from "@/context/ReportDataContext";

export default function DetailTab() {
  const { detail } = useReportData();

  return (
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
          {detail.map((entry, index) => (
            <tr key={index} className="border-t">
              <td className="py-2 px-4">{entry.date}</td>
              <td className="py-2 px-4">{entry.task}</td>
              <td className="py-2 px-4">{entry.hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
