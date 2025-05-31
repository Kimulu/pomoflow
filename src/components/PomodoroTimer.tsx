//@ts-nocheck

import React, { useState, useEffect, useContext } from "react";
import { useTasks } from "../context/TaskContext";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 min
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const { currentTaskId, incrementPomodoro } = useTasks();

  // Update timeLeft based on mode
  useEffect(() => {
    if (mode === "pomodoro") setTimeLeft(5);
    else if (mode === "short") setTimeLeft(5 * 60);
    else if (mode === "long") setTimeLeft(15 * 60);
    setIsRunning(false);
  }, [mode]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Timer finished effect
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);

      if (mode === "pomodoro") {
        setPomodoroCount((prev) => {
          const newCount = prev + 1;

          // Update pomodoro count for current task
          if (currentTaskId) {
            incrementPomodoro(currentTaskId);
          }

          // Determine next mode
          if (newCount % 4 === 0) {
            setMode("long");
            setTimeLeft(15 * 60); // 15 minutes
          } else {
            setMode("short");
            setTimeLeft(5 * 60); // 5 minutes
          }

          return newCount;
        });
      } else {
        // After any break, return to Pomodoro
        setMode("pomodoro");
        setTimeLeft(25 * 60);
      }
    }
  }, [timeLeft, isRunning, mode, currentTaskId, incrementPomodoro]);
  // Format minutes and seconds
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="w-full max-w-md space-y-8 text-center mx-auto">
      {/* Tabs */}
      <div className="tabs tabs-box justify-center">
        {(["pomodoro", "short", "long"] as const).map((key) => (
          <a
            role="tab"
            key={key}
            className={`tab ${mode === key ? "tab-active" : ""}`}
            onClick={() => setMode(key)}
          >
            {/* Short label on small screens */}
            {key === "pomodoro" && <span className="sm:hidden">Pomo</span>}
            {key === "short" && <span className="sm:hidden">Short</span>}
            {key === "long" && <span className="sm:hidden">Long</span>}

            {/* Full label on sm+ screens */}
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
              aria-live="polite"
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
              aria-live="polite"
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

      {/* Start/Pause button */}
      <button
        className="btn btn-outline btn-wide px-10 text-lg"
        onClick={() => setIsRunning(!isRunning)}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
    </div>
  );
}
