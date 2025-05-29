//@ts-nocheck

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { taskActions } from "../store/task";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 min pomodoro

  const dispatch = useDispatch();
  const currentTaskId = useSelector((state: any) => state.tasks.currentTaskId);

  // Update timeLeft based on mode
  useEffect(() => {
    if (mode === "pomodoro") setTimeLeft(1 * 60);
    else if (mode === "short") setTimeLeft(5 * 60);
    else if (mode === "long") setTimeLeft(15 * 60);
    setIsRunning(false);
  }, [mode]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);

      // Only increment if we're in a Pomodoro session
      if (mode === "pomodoro" && currentTaskId) {
        dispatch(taskActions.incrementPomodoro(currentTaskId));
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Format minutes and seconds
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="w-full max-w-md space-y-8 text-center mx-auto">
      {/* Tabs */}
      <div className="tabs tabs-boxed justify-center">
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
