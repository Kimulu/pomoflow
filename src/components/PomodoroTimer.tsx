// src/components/PomodoroTimer.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "pomodoroDailyCount";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  // Set to 5 seconds for quick testing, remember to change back to 25 * 60 (1500) for production
  const [timeLeft, setTimeLeft] = useState(5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { currentTaskId, incrementPomodoro } = useTasks();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading, // Renamed to authLoading for clarity
    incrementUserDailyCycles,
  } = useAuth();

  // guestOverallPomodoroCount is ONLY for guest users. Authenticated users will read from user.cycles.
  const [guestOverallPomodoroCount, setGuestOverallPomodoroCount] = useState(0);

  // Helper to check if two dates are on the same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Helper to show a notification
  const showNotification = useCallback((title: string, body?: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body || "",
        icon: "/favicon.ico",
      });
    }
  }, []); // Empty dependency array as it doesn't depend on component state/props

  // Helper to update local storage for guest users
  const updateGuestLocalStorage = useCallback((count: number) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count, lastUpdated: Date.now() })
    );
  }, []); // Empty dependency array as it doesn't depend on component state/props

  // ✅ Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // --- Initialize guestOverallPomodoroCount from Local Storage (if guest) ---
  // For authenticated users, overall count comes directly from `user.cycles`
  useEffect(() => {
    // Only proceed if auth status is known and it's a guest session
    if (!authLoading && !isAuthenticated) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { count, lastUpdated } = JSON.parse(saved);
        const lastUpdatedDate = new Date(lastUpdated);
        const now = new Date();

        if (!isSameDay(lastUpdatedDate, now)) {
          localStorage.removeItem(STORAGE_KEY);
          setGuestOverallPomodoroCount(0); // Reset for new day
        } else {
          setGuestOverallPomodoroCount(count);
        }
      } else {
        setGuestOverallPomodoroCount(0); // No saved data for guest, start at 0
      }
    }
  }, [isAuthenticated, authLoading]); // Depend on isAuthenticated and authLoading

  // Timer mode settings
  useEffect(() => {
    if (mode === "pomodoro") setTimeLeft(5); // Change to 25 * 60 for production
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
    // Only proceed if timer is running and time has hit zero
    if (timeLeft === 0 && isRunning) {
      // Stop the timer
      setIsRunning(false);

      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Audio play error:", err);
        });
      }

      if (mode === "pomodoro") {
        let currentOverallCountForNextMode: number; // Declared here

        // Handle authenticated user
        if (isAuthenticated) {
          // This is the CRUCIAL check: Only call API if auth state is fully loaded and user data is available
          if (!authLoading && user && user._id && user.username) {
            incrementUserDailyCycles();
            currentOverallCountForNextMode = (user.cycles ?? 0) + 1;
            console.log(
              "Calling incrementUserDailyCycles for authenticated user. Expected next count:",
              currentOverallCountForNextMode
            );
          } else {
            console.warn(
              "Skipping incrementUserDailyCycles: Auth is still loading or user data is incomplete.",
              { isAuthenticated, user, authLoading }
            );
            // Ensure currentOverallCountForNextMode is assigned even if API call is skipped
            currentOverallCountForNextMode = user?.cycles ?? 0;
          }
        } else {
          // Guest user logic
          // FIX: Calculate next count directly and assign to currentOverallCountForNextMode
          const nextGuestCount = guestOverallPomodoroCount + 1;
          setGuestOverallPomodoroCount(nextGuestCount); // Asynchronous state update
          updateGuestLocalStorage(nextGuestCount); // Synchronous local storage update
          currentOverallCountForNextMode = nextGuestCount; // Ensure it's assigned for immediate use
        }

        // Also increment task-specific pomodoros if a task is selected
        if (currentTaskId) {
          incrementPomodoro(currentTaskId);
        }

        // Determine next mode based on the current overall count
        // currentOverallCountForNextMode is now guaranteed to be assigned in all paths
        const effectiveOverallCount = currentOverallCountForNextMode;

        if (effectiveOverallCount % 4 === 0) {
          setMode("long");
          setTimeLeft(15 * 60);
          showNotification("Long Break", "Time for a well-earned rest!");
        } else {
          setMode("short");
          setTimeLeft(5 * 60);
          showNotification("Short Break", "Take a short break.");
        }
      } else {
        // Handle break modes
        setMode("pomodoro");
        setTimeLeft(25 * 60); // Change to 25 * 60 for production
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
    user,
    authLoading,
    incrementUserDailyCycles,
    setGuestOverallPomodoroCount,
    guestOverallPomodoroCount, // Added as a dependency because it's now directly read for calculation
    updateGuestLocalStorage,
    showNotification,
  ]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  // Determine the count to display based on authentication status
  const displayOverallCount = isAuthenticated
    ? user?.cycles ?? 0
    : guestOverallPomodoroCount;

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

      {/* Displaying the overall pomodoro count */}
      <p className="text-sm text-gray-500 text-center mb-4">
        # {displayOverallCount}
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
