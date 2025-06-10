// frontend/components/TaskForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTasks } from "../context/TaskContext";
import { useProjectData } from "../context/ProjectDataContext";
import { useAuth } from "../context/AuthContext";
import { Task } from "../types";

// LockIcon component (keep as is)
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 inline-block ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-2 4h4m-4-11V7a4 4 0 118 0v4m-8 0h8a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2z"
    />
  </svg>
);

interface TaskFormProps {
  onClose: () => void;
  taskToEdit?: Task;
  onDeleteTask?: (taskId: string) => Promise<void>;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onClose,
  taskToEdit,
  onDeleteTask,
}) => {
  const { addTask, updateTask } = useTasks();
  const { projects, loading: projectsLoading, addProject } = useProjectData();
  const { user, isAuthenticated } = useAuth();

  const isFreeUser: boolean = !!(
    isAuthenticated &&
    user &&
    user.plan === "free"
  );
  const disableProjectFeatures: boolean = !isAuthenticated || isFreeUser;

  const [taskText, setTaskText] = useState(taskToEdit?.text || "");
  const [pomodoros, setPomodoros] = useState(taskToEdit?.pomodoros || 1);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    taskToEdit?.projectId || null
  );

  const [isAddingNewProject, setIsAddingNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTaskText(taskToEdit.text);
      setPomodoros(taskToEdit.pomodoros);
      setSelectedProjectId(taskToEdit.projectId || null);
      setIsAddingNewProject(false);
      setNewProjectName("");
    } else {
      setTaskText("");
      setPomodoros(1);
      setSelectedProjectId(disableProjectFeatures ? null : null);
      setIsAddingNewProject(false);
      setNewProjectName("");
    }
  }, [taskToEdit, disableProjectFeatures]);

  const handlePomodoroChange = (change: number) => {
    setPomodoros((prev) => Math.max(1, prev + change));
  };

  const handleDeleteClick = async () => {
    if (taskToEdit && onDeleteTask) {
      if (
        window.confirm(`Are you sure you want to delete "${taskToEdit.text}"?`)
      ) {
        await onDeleteTask(taskToEdit._id);
        onClose();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskText.trim()) {
      alert("Task description cannot be empty.");
      return;
    }

    let finalProjectId = selectedProjectId;

    if (disableProjectFeatures) {
      if (!taskToEdit) {
        finalProjectId = null;
      }
      console.warn(
        "Project features disabled. Cannot add/modify projects for this user type."
      );
    }

    if (isAddingNewProject && newProjectName.trim()) {
      if (disableProjectFeatures) {
        alert(
          "Project features are disabled. Please log in or upgrade your plan to create projects."
        );
        return;
      }
      try {
        const newProj = await addProject(newProjectName.trim());
        if (newProj) {
          finalProjectId = newProj._id;
        } else {
          console.error("Failed to add new project: newProj was null");
          alert("Failed to add new project. Please try again.");
          return;
        }
      } catch (error) {
        console.error("Failed to add new project:", error);
        alert("Failed to add new project. Please try again.");
        return;
      }
    } else if (
      isAddingNewProject &&
      !newProjectName.trim() &&
      !disableProjectFeatures
    ) {
      alert("Please enter a name for the new project.");
      return;
    }

    const taskData = {
      text: taskText.trim(),
      pomodoros: pomodoros,
      projectId: finalProjectId,
    };

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, taskData);
      } else {
        await addTask(taskData.text, taskData.pomodoros, taskData.projectId);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const handleManageProjectsClick = () => {
    // In a real application, you'd navigate or open a new modal here
    if (disableProjectFeatures) {
      alert("Please log in or upgrade your plan to manage projects.");
    } else {
      alert(
        "Navigating to Project Management (TODO: Implement dedicated project management page/modal)"
      );
      // Example: router.push('/projects');
      // Example: openProjectManagementModal();
      console.log("User wants to manage projects.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text sr-only">Task Description</span>
        </label>
        <input
          type="text"
          placeholder="What are you working on?"
          className="input input-bordered w-full text-lg"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Est Pomodoros</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            className="input input-bordered w-24 text-center"
            value={pomodoros}
            onChange={(e) => setPomodoros(parseInt(e.target.value) || 1)}
            required
          />
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => handlePomodoroChange(-1)}
          >
            -
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => handlePomodoroChange(1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Project</span>
        </label>
        {isAddingNewProject ? (
          <input
            type="text"
            placeholder={
              disableProjectFeatures
                ? "Log in or Upgrade for Projects"
                : "New project name"
            }
            className="input input-bordered w-full"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onBlur={() => {
              if (!newProjectName.trim()) {
                setIsAddingNewProject(false);
              }
            }}
            autoFocus
            disabled={disableProjectFeatures}
          />
        ) : (
          <select
            className="select select-bordered w-full"
            value={selectedProjectId || ""}
            onChange={(e) =>
              setSelectedProjectId(
                e.target.value === "" ? null : e.target.value
              )
            }
            disabled={disableProjectFeatures}
          >
            <option value="">No Project</option>
            {projectsLoading ? (
              <option disabled>Loading projects...</option>
            ) : !disableProjectFeatures && projects.length > 0 ? (
              projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))
            ) : (
              taskToEdit?.projectId &&
              !projectsLoading && (
                <option key={taskToEdit.projectId} value={taskToEdit.projectId}>
                  {projects.find((p) => p._id === taskToEdit.projectId)?.name ||
                    "Existing Project (Disabled)"}
                </option>
              )
            )}
          </select>
        )}

        <div className="flex gap-4 mt-2 text-sm">
          {!isAddingNewProject && (
            <>
              <button
                type="button"
                className="text-blue-600 hover:underline flex items-center"
                onClick={() => setIsAddingNewProject(true)}
                disabled={disableProjectFeatures}
              >
                + Add Project
                {!isAuthenticated && <LockIcon />}
              </button>
              {isAuthenticated && ( // Only show "Manage Projects" if authenticated
                <button
                  type="button"
                  className="text-blue-600 hover:underline flex items-center ml-auto" // Pushes to the right
                  onClick={handleManageProjectsClick}
                  disabled={isFreeUser} // Free users can't manage projects either
                >
                  Manage Projects
                  {isFreeUser && <LockIcon />}{" "}
                  {/* Lock for free users here too */}
                </button>
              )}
            </>
          )}
          {isAddingNewProject && (
            <button
              type="button"
              className="text-red-500 hover:underline"
              onClick={() => {
                setIsAddingNewProject(false);
                setNewProjectName("");
              }}
            >
              Cancel New Project
            </button>
          )}
        </div>
        {!isAuthenticated && (
          <p className="text-sm text-red-500 mt-2">
            Please log in to use project features. Tasks are saved locally for
            now.
          </p>
        )}
        {isAuthenticated && isFreeUser && (
          <p className="text-sm text-red-500 mt-2">
            Upgrade to a premium plan to create new projects or manage existing
            ones.
          </p>
        )}
      </div>

      <div className="flex justify-between gap-2 mt-4">
        {taskToEdit && onDeleteTask && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="btn btn-error btn-outline"
          >
            Delete
          </button>
        )}
        <div className="flex gap-2 ml-auto">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {taskToEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
