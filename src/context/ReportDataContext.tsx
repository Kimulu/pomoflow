// context/ReportDataContext.tsx
import { createContext, useContext } from "react";
import { ReportData } from "@/types";
import { mockReport } from "@/data/mockReport";

const ReportDataContext = createContext<ReportData | null>(null);

export const ReportDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ReportDataContext.Provider value={mockReport}>
      {children}
    </ReportDataContext.Provider>
  );
};

export const useReportData = () => {
  const context = useContext(ReportDataContext);
  if (!context) {
    throw new Error("useReportData must be used within a ReportDataProvider");
  }
  return context;
};
