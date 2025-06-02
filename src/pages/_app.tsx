import type { AppProps } from "next/app";
import { TaskProvider } from "../context/TaskContext";
import { ReportDataProvider } from "../context/ReportDataContext"; // ✅ Add this line
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TaskProvider>
      <ReportDataProvider>
        {" "}
        {/* ✅ Wrap with ReportDataProvider */}
        <Component {...pageProps} />
      </ReportDataProvider>
    </TaskProvider>
  );
}
