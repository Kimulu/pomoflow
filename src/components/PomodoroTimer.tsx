// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "pomodoroDailyCount"; // <-- RE-INTRODUCE STORAGE_KEY (changed name for clarity)

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { currentTaskId, incrementPomodoro } = useTasks();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    incrementUserDailyCycles,
  } = useAuth(); // <-- Added authLoading

  const [overallPomodoroCount, setOverallPomodoroCount] = useState(0);

  // Helper to check if two dates are on the same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Helper to update local storage for guest users
  const updateGuestLocalStorage = (count: number) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count, lastUpdated: Date.now() })
    );
  };

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
        icon: "/favicon.ico",
      });
    }
  };

  // --- Initialize overallPomodoroCount from AuthContext (if authenticated) or Local Storage (if guest) ---
  useEffect(() => {
    // Only run this effect once authentication status is known and user data is loaded
    if (!authLoading) {
      if (isAuthenticated && user?.cycles !== undefined) {
        // If authenticated and user data is available, use database value
        setOverallPomodoroCount(user.cycles);
        // Clear any old local storage data that might conflict
        localStorage.removeItem(STORAGE_KEY);
      } else {
        // If not authenticated (guest), try to load from local storage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { count, lastUpdated } = JSON.parse(saved);
          const lastUpdatedDate = new Date(lastUpdated);
          const now = new Date();

          if (!isSameDay(lastUpdatedDate, now)) {
            // It's a new day for the guest, reset local storage count
            localStorage.removeItem(STORAGE_KEY);
            setOverallPomodoroCount(0); // Reset for new day
          } else {
            // Same day, load the saved count
            setOverallPomodoroCount(count);
          }
        } else {
          // No saved data for guest, start at 0
          setOverallPomodoroCount(0);
        }
      }
    }
  }, [isAuthenticated, user?.cycles, authLoading]); // Depend on isAuthenticated and user.cycles

  // Timer mode settings
  useEffect(() => {
    if (mode === "pomodoro") setTimeLeft(5);
    else if (mode === "short") setTimeLeft(5 * 60);
    else if (mode === "long") setTimeLeft(15 * 60);
    setIsRunning(false); // Stop timer when mode changes
  }, [mode]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Logic when timer hits zero
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Audio play error:", err);
        });
      }

      if (mode === "pomodoro") {
        let newOverallCount;
        if (isAuthenticated) {
          // Logged-in user: Update backend (AuthContext will refresh `user.cycles`)
          incrementUserDailyCycles();
          // For immediate UI update, predict the next count.
          // The backend will handle the daily reset.
          newOverallCount = user?.cycles !== undefined ? user.cycles + 1 : 1;
        } else {
          // Guest user: Update local state and local storage
          setOverallPomodoroCount((prev) => {
            newOverallCount = prev + 1;
            updateGuestLocalStorage(newOverallCount); // Save to local storage
            return newOverallCount;
          });
        }

        // Also increment task-specific pomodoros if a task is selected
        if (currentTaskId) {
          incrementPomodoro(currentTaskId);
        }

        // Determine next mode based on the `newOverallCount`
        if (newOverallCount % 4 === 0) {
          setMode("long");
          setTimeLeft(15 * 60);
          showNotification("Long Break", "Time for a well-earned rest!");
        } else {
          setMode("short");
          setTimeLeft(5 * 60);
          showNotification("Short Break", "Take a short break.");
        }
      } else {
        setMode("pomodoro");
        setTimeLeft(25 * 60);
        showNotification("Pomodoro", "Back to focus time!");
      }
    }
  }, [
    timeLeft,
    isRunning,
    mode,
    currentTaskId,
    incrementPomodoro,
    isAuthenticated,
    user?.cycles,
    incrementUserDailyCycles,
    updateGuestLocalStorage,
    showNotification,
    isSameDay,
  ]); // Added new dependencies and helper functions

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="w-full max-w-md space-y-8 text-center mx-auto">
      <audio
        ref={audioRef}
        src="/kids-cartoon-close-bells.wav"
        preload="auto"
      />

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
        # {overallPomodoroCount}
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
