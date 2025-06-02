//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useTasks } from "../context/TaskContext";

const STORAGE_KEY = "pomodoroData";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { currentTaskId, incrementPomodoro } = useTasks();

  // ✅ Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ✅ Helper function to show a notification
  const showNotification = (title: string, body?: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body || "",
        icon: "/favicon.ico", // Optional: Add your own icon
      });
    }
  };

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { count, lastUpdated } = JSON.parse(saved);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - lastUpdated < twentyFourHours) {
        setPomodoroCount(count);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const updateLocalStorage = (count: number) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count, lastUpdated: Date.now() })
    );
  };

  useEffect(() => {
    if (mode === "pomodoro") setTimeLeft(5);
    else if (mode === "short") setTimeLeft(5);
    else if (mode === "long") setTimeLeft(5);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play the audio
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Audio play error:", err);
        });
      }

      if (mode === "pomodoro") {
        setPomodoroCount((prev) => {
          const newCount = prev + 1;
          updateLocalStorage(newCount);

          if (currentTaskId) {
            incrementPomodoro(currentTaskId);
          }

          if (newCount % 4 === 0) {
            setMode("long");
            setTimeLeft(15 * 60);
            showNotification("Long Break", "Time for a well-earned rest!");
          } else {
            setMode("short");
            setTimeLeft(5 * 60);
            showNotification("Short Break", "Take a short break.");
          }

          return newCount;
        });
      } else {
        setMode("pomodoro");
        setTimeLeft(25 * 60);
        showNotification("Pomodoro", "Back to focus time!");
      }
    }
  }, [timeLeft, isRunning, mode, currentTaskId, incrementPomodoro]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="w-full max-w-md space-y-8 text-center mx-auto">
      {/* Audio for alarm */}
      <audio
        ref={audioRef}
        src="/kids-cartoon-close-bells.wav"
        preload="auto"
      />

      {/* Tabs */}
      <div className="tabs tabs-box justify-center">
        {(["pomodoro", "short", "long"] as const).map((key) => (
          <a
            role="tab"
            key={key}
            className={`tab ${mode === key ? "tab-active" : ""}`}
            onClick={() => setMode(key)}
          >
            {key === "pomodoro" && <span className="sm:hidden">Pomo</span>}
            {key === "short" && <span className="sm:hidden">Short</span>}
            {key === "long" && <span className="sm:hidden">Long</span>}
            <span className="hidden sm:inline">
              {key === "pomodoro" && "Pomodoro"}
              {key === "short" && "Short Break"}
              {key === "long" && "Long Break"}
            </span>
          </a>
        ))}
      </div>

      {/* Timer */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="flex flex-col p-2 text-black-content min-w-[90px]">
          <span className="countdown font-mono text-7xl">
            <span
              style={{ "--value": parseInt(minutes) } as React.CSSProperties}
              aria-label={`${minutes} minutes`}
            >
              {minutes}
            </span>
          </span>
          min
        </div>
        <div className="flex flex-col p-2 text-black-content min-w-[90px]">
          <span className="countdown font-mono text-7xl">
            <span
              style={{ "--value": parseInt(seconds) } as React.CSSProperties}
              aria-label={`${seconds} seconds`}
            >
              {seconds}
            </span>
          </span>
          sec
        </div>
      </div>

      <p className="text-base text-base-content text-center mb-4">
        {mode === "pomodoro" && "Focus time"}
        {mode === "short" && "Take a short break"}
        {mode === "long" && "Take a long break"}
      </p>

      <p className="text-sm text-gray-500 text-center mb-4">
        # {pomodoroCount}
      </p>

      <button
        className="btn btn-outline btn-wide px-10 text-lg"
        onClick={() => setIsRunning(!isRunning)}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
    </div>
  );
}
