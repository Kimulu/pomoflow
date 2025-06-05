import type { AppProps } from "next/app";
import { TaskProvider } from "../context/TaskContext";
import { ReportDataProvider } from "../context/ReportDataContext";
import { AuthProvider } from "@/context/AuthContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <TaskProvider>
        <ReportDataProvider>
          <Component {...pageProps} />
        </ReportDataProvider>
      </TaskProvider>
    </AuthProvider>
  );
}
