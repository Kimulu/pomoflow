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
