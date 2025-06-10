// types/index.ts
export interface SummaryData {
  totalHours: string;
  daysAccessed: number;
  streak: string;
}

export interface DetailEntry {
  date: string;
  task: string;
  hours: number;
}

export interface RankingEntry {
  name: string;
  hours: string;
}

export interface ReportData {
  summary: SummaryData;
  detail: DetailEntry[];
  rankings: RankingEntry[];
}

// NEW: Define the Task type
export interface Task {
  _id: string; // MongoDB's ID
  userId?: string; // Optional, present for backend tasks
  text: string;
  pomodoros: number; // Target pomodoros
  pomodorosCompleted: number; // Actual completed pomodoros
  completed: boolean;
  createdAt: string; // Date string (ISO 8601)
  projectId?: string | null; // Optional Project ID
  updatedAt: string;
}

// NEW: Define the Project type
export interface Project {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties as they appear in your backend Project model
}
