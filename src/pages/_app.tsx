// pages/_app.tsx
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext"; // AuthProvider should be first
import { ProjectDataProvider } from "../context/ProjectDataContext"; // ProjectDataProvider depends on Auth
import { TaskProvider } from "../context/TaskContext"; // TaskProvider depends on Auth and potentially ProjectData
import { ReportDataProvider } from "../context/ReportDataContext"; // ReportDataProvider depends on Auth, ProjectData, TaskData

import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProjectDataProvider>
        <TaskProvider>
          <ReportDataProvider>
            <Component {...pageProps} />
          </ReportDataProvider>
        </TaskProvider>
      </ProjectDataProvider>
    </AuthProvider>
  );
}
