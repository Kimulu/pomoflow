import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskList() {
  const {
    tasks,
    addTask,
    deleteTask,
    setCurrentTaskId,
    currentTaskId,
    incrementPomodoro,
    setPomodoros,
    toggleTaskCompleted,
  } = useTasks();

  const [newTaskText, setNewTaskText] = useState("");
  const [newPomodoros, setNewPomodoros] = useState(1);

  const handleAddTask = () => {
    if (newTaskText.trim() !== "" && newPomodoros > 0) {
      addTask(newTaskText.trim(), newPomodoros);
      setNewTaskText("");
      setNewPomodoros(1);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Task Section Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button className="text-xl px-2 cursor-pointer">⋮</button>
      </div>
      <hr className="mb-4 border-base-300" />
      {/* Task input row */}
      <div className="flex gap-2">
        <input
          className="input input-bordered flex-grow"
          type="text"
          placeholder="New task"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <input
          type="number"
          min="1"
          className="input input-bordered w-20"
          value={newPomodoros}
          onChange={(e) => setNewPomodoros(parseInt(e.target.value) || 1)}
        />
        <button className="btn btn-primary" onClick={handleAddTask}>
          Add
        </button>
      </div>

      {/* Task list */}
      <ul className="space-y-2">
        {tasks.map((task) => {
          const isCompleted =
            task.completed || task.pomodorosCompleted >= task.pomodoros;
          return (
            <li
              key={task.id}
              className={`flex justify-between items-center p-3 rounded border cursor-pointer ${
                currentTaskId === task.id
                  ? "bg-primary text-white"
                  : "bg-base-200"
              }`}
              onClick={() => setCurrentTaskId(task.id)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={isCompleted}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleTaskCompleted(task.id)}
                />
                <div className="flex flex-col">
                  <p
                    className={`font-medium ${
                      isCompleted ? "line-through opacity-60" : ""
                    }`}
                  >
                    {task.text}
                  </p>
                  <small>
                    {task.pomodorosCompleted} / {task.pomodoros} pomodoros
                  </small>
                </div>
              </div>

              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-xs btn-accent"
                  onClick={() => incrementPomodoro(task.id)}
                >
                  ➕
                </button>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => deleteTask(task.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
