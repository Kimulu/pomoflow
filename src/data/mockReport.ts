// data/mockReport.ts
import { ReportData } from "@/types";

export const mockReport: ReportData = {
  summary: {
    totalHours: "47h",
    daysAccessed: 23,
    streak: "6🔥",
  },
  detail: [
    { date: "2025-05-30", task: "Pomoflow UI", hours: 2.6 },
    { date: "2025-05-29", task: "API Integration", hours: 3.0 },
  ],
  rankings: [
    { name: "🧑 Alex", hours: "54h" },
    { name: "🧑 Jamie", hours: "48h" },
    { name: "🧑 You", hours: "47h" },
  ],
};
