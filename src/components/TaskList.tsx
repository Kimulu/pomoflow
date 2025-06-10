// frontend/components/TaskList.tsx
"use client";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { useTasks } from "../context/TaskContext";
import { useProjectData } from "../context/ProjectDataContext";
import TaskForm from "./TaskForm";
import { Task /* Removed: , Project */ } from "../types"; // Removed Project import
import { BsThreeDotsVertical } from "react-icons/bs";

// --- START: Memoized TaskItem Component ---
// This component will only re-render if its props change.
// This is crucial for preventing unnecessary re-renders of all list items
// when only one task's pomodoro count changes.
interface TaskItemProps {
  task: Task;
  currentTaskId: string | null;
  setCurrentTaskId: (id: string | null) => void; // Added here for click handler
  getProjectName: (projectId: string | null | undefined) => string | null;
  toggleTaskCompleted: (taskId: string) => void;
  handleOpenEditTaskForm: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = memo(
  ({
    task,
    currentTaskId,
    setCurrentTaskId,
    getProjectName,
    toggleTaskCompleted,
    handleOpenEditTaskForm,
  }) => {
    const isCompleted =
      task.completed || task.pomodorosCompleted >= task.pomodoros;
    const projectName = getProjectName(task.projectId);

    return (
      <li
        key={task._id} // Key should still be on the outermost element in map, but good to have here too
        className={`flex justify-between items-center p-3 rounded border ${
          currentTaskId === task._id ? "bg-primary text-white" : "bg-base-200"
        }`}
      >
        {/* Main content area for checkbox and text details */}
        <div
          className="flex items-start gap-2 flex-grow min-w-0"
          onClick={() => setCurrentTaskId(task._id)} // Clickable to set current task
        >
          <input
            type="checkbox"
            className="checkbox checkbox-sm mt-1"
            checked={isCompleted}
            onClick={(e) => e.stopPropagation()} // Prevent setting current task when clicking checkbox
            onChange={() => toggleTaskCompleted(task._id)}
          />
          <div className="flex flex-col flex-grow min-w-0">
            <p
              className={`font-medium flex flex-wrap items-center gap-x-2 text-sm ${
                isCompleted ? "line-through opacity-60" : ""
              }`}
            >
              <span className="break-words">{task.text}</span>{" "}
              {projectName && (
                <span className="px-2 py-0.5 bg-gray-300 text-gray-700 text-xs rounded-full whitespace-nowrap">
                  {projectName}
                </span>
              )}
            </p>
            <small>
              {task.pomodorosCompleted} / {task.pomodoros} pomodoros
            </small>
          </div>
        </div>

        {/* Action buttons on the right */}
        <div
          className="flex items-center flex-shrink-0"
          onClick={(e) => e.stopPropagation()} // Prevent setting current task when clicking options
        >
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => handleOpenEditTaskForm(task)}
            title="More options"
          >
            <BsThreeDotsVertical className="h-5 w-5" />
          </button>
        </div>
      </li>
    );
  }
);
TaskItem.displayName = "TaskItem"; // Good practice for React DevTools
// --- END: Memoized TaskItem Component ---

export default function TaskList() {
  const {
    tasks,
    deleteTask,
    setCurrentTaskId,
    currentTaskId,
    // incrementPomodoro is called elsewhere (e.g., PomodoroTimer),
    // but its update to 'tasks' is what triggers TaskList re-render.
    toggleTaskCompleted,
    isLoading: tasksLoading,
    error: tasksError,
  } = useTasks();

  const { projects, loading: projectsLoading } = useProjectData();

  // --- ADDED DEBUGGING LOGS HERE ---
  useEffect(() => {
    console.log(
      `[TaskList] Rendered. tasks.length: ${tasks.length}, projects.length: ${projects.length}, projectsLoading: ${projectsLoading}`
    );
  });
  // --- END DEBUGGING LOGS ---

  const [isFormOverlayVisible, setIsFormOverlayVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

  const formOverlayRef = useRef<HTMLDivElement>(null);

  const handleOpenAddTaskForm = useCallback(() => {
    setTaskToEdit(undefined);
    setIsFormOverlayVisible(true);
  }, []);

  const handleOpenEditTaskForm = useCallback((task: Task) => {
    setTaskToEdit(task);
    setIsFormOverlayVisible(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOverlayVisible(false);
    setTaskToEdit(undefined);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseForm();
      }
    };

    if (isFormOverlayVisible) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFormOverlayVisible, handleCloseForm]);

  // IMPORTANT: Make getProjectName a useCallback
  // It depends on 'projects' and 'projectsLoading'
  const getProjectName = useCallback(
    (projectId: string | null | undefined) => {
      // --- ADDED DEBUGGING LOGS HERE ---
      console.log(
        `[TaskList - getProjectName] Called for projectId: ${projectId}`
      );
      console.log(`   projectsLoading: ${projectsLoading}`);
      console.log(`   projects.length: ${projects.length}`);
      // --- END DEBUGGING LOGS ---

      // If projects are still loading, provide a loading message.
      // This prevents "Unknown Project" flashes during transient loading.
      if (projectsLoading) {
        return "Loading Project..."; // Or null, depending on desired UX
      }
      if (!projectId) return null; // No project assigned to task

      const project = projects.find((p) => p._id === projectId);
      return project ? project.name : "Unknown Project";
    },
    [projects, projectsLoading]
  ); // Depends on projects and projectsLoading

  if (tasksLoading) {
    // Only check tasksLoading here as projectsLoading is handled inside getProjectName
    return (
      <div className="max-w-md mx-auto p-4 text-center">Loading tasks...</div>
    );
  }

  if (tasksError) {
    return (
      <div className="max-w-md mx-auto p-4 text-center text-red-500">
        Error: {tasksError}
      </div>
    );
  }

  // If projects are still loading, you might want a different message for the *entire* list,
  // or rely on "Loading Project..." within each item.
  // For now, let's keep the main loading check on tasksLoading primarily.

  return (
    <div className="max-w-md mx-auto space-y-4 relative bg-white rounded-lg shadow-md p-4 min-h-[450px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Tasks</h2>
        {!isFormOverlayVisible && (
          <button
            onClick={handleOpenAddTaskForm}
            className="btn btn-sm btn-primary"
          >
            Add New Task
          </button>
        )}
      </div>
      <hr className="mb-4 border-base-300" />

      <ul className="space-y-2 max-h-[calc(100%-90px)] overflow-y-auto pb-4">
        {tasks.length === 0 ? (
          <li className="p-3 text-center text-gray-500">
            {/* FIX: Escaped the double quotes */}
            No tasks yet. Click &quot;Add New Task&quot; to get started!
          </li>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task._id} // Key goes here when mapping memoized components
              task={task}
              currentTaskId={currentTaskId}
              setCurrentTaskId={setCurrentTaskId} // Pass setCurrentTaskId here
              getProjectName={getProjectName} // Pass the memoized helper
              toggleTaskCompleted={toggleTaskCompleted}
              handleOpenEditTaskForm={handleOpenEditTaskForm}
            />
          ))
        )}
      </ul>

      {isFormOverlayVisible && (
        <div
          ref={formOverlayRef}
          className="absolute inset-0 z-20 flex items-end justify-center pb-4"
          onClick={(e) => {
            if (formOverlayRef.current && e.target === formOverlayRef.current) {
              handleCloseForm();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-4 space-y-4 relative">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {taskToEdit ? "Edit Task" : "Add New Task"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close form"
              >
                &times;
              </button>
            </div>
            <TaskForm
              onClose={handleCloseForm}
              taskToEdit={taskToEdit}
              onDeleteTask={taskToEdit ? deleteTask : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
