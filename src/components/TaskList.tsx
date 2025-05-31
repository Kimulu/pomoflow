import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskList() {
  const { tasks, addTask, deleteTask, currentTaskId, setCurrentTaskId } =
    useTasks();

  const [newTaskText, setNewTaskText] = useState("");

  const handleAddTask = () => {
    if (newTaskText.trim() !== "") {
      addTask(newTaskText.trim());
      setNewTaskText("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex gap-2">
        <input
          className="input input-bordered flex-grow"
          type="text"
          placeholder="New task"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAddTask}>
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex justify-between items-center p-3 rounded border cursor-pointer ${
              currentTaskId === task.id
                ? "bg-primary text-white"
                : "bg-base-200"
            }`}
            onClick={() => setCurrentTaskId(task.id)}
          >
            <div>
              <p className="font-medium">{task.text}</p>
              <small>Pomodoros: {task.pomodorosCompleted}</small>
            </div>
            <button
              className="btn btn-sm btn-error"
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering setCurrentTaskId
                deleteTask(task.id);
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
