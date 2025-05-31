import type { AppProps } from "next/app";
import { TaskProvider } from "../context/TaskContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TaskProvider>
      <Component {...pageProps} />
    </TaskProvider>
  );
}
