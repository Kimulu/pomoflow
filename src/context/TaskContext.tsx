// @ts-nocheck
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchData, postData, putData, deleteData } from "../pages/api/api";

// Define the Task type to match your backend model
interface Task {
  _id: string; // MongoDB's ID for backend tasks, or a client-generated ID for local tasks
  userId?: string; // Optional for local tasks, present for backend tasks
  text: string;
  pomodoros: number; // Target pomodoros
  pomodorosCompleted: number; // Actual completed pomodoros
  completed: boolean;
  createdAt: string; // Date string
}

// Define the shape of the TaskContext
interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, pomodoros: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setCurrentTaskId: (id: string | null) => void;
  currentTaskId: string | null;
  incrementPomodoro: (id: string) => Promise<void>;
  setPomodoros: (id: string, newPomodoros: number) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_TASKS_KEY = "pomoflow_guest_tasks"; // New localStorage key for guest tasks

export const TaskProvider = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to save tasks to local storage for guest users
  const saveTasksToLocalStorage = useCallback((tasksToSave: Task[]) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_TASKS_KEY,
        JSON.stringify(tasksToSave)
      );
    } catch (e) {
      console.error("Failed to save tasks to local storage", e);
    }
  }, []);

  // --- Initial Fetch/Load of Tasks ---
  useEffect(() => {
    const loadTasks = async () => {
      // Only run this effect once authentication status is known
      if (authLoading) return;

      setIsLoading(true);
      setError(null);

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Fetch from Backend ---
        try {
          const data = await fetchData("/api/tasks");
          setTasks(data);
          // Clear guest tasks from local storage to avoid conflicts
          localStorage.removeItem(LOCAL_STORAGE_TASKS_KEY);
        } catch (err) {
          console.error("Failed to fetch tasks from backend:", err);
          setError("Failed to load tasks from server.");
          setTasks([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // --- GUEST USER: Load from Local Storage ---
        try {
          const savedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
          if (savedTasks) {
            const parsedTasks: Task[] = JSON.parse(savedTasks);
            setTasks(parsedTasks);
          } else {
            setTasks([]); // No tasks saved for guest
          }
        } catch (err) {
          console.error("Failed to load tasks from local storage:", err);
          setError("Failed to load tasks from local storage.");
          setTasks([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTasks();
  }, [isAuthenticated, authLoading]); // Re-run when auth status changes

  // Effect to manage currentTaskId
  useEffect(() => {
    // If the currently selected task ID no longer exists in the task list, clear it
    if (currentTaskId && !tasks.find((task) => task._id === currentTaskId)) {
      setCurrentTaskId(null);
    }
    // If there are tasks but no currentTaskId is selected, select the first one
    // Only do this if not already loading, to prevent flashing
    if (!currentTaskId && tasks.length > 0 && !isLoading) {
      setCurrentTaskId(tasks[0]._id);
    }
  }, [tasks, currentTaskId, isLoading]);

  // --- CRUD Operations (Hybrid Backend/Local Storage) ---

  const addTask = useCallback(
    async (text: string, pomodoros: number) => {
      setIsLoading(true);
      setError(null);
      try {
        if (isAuthenticated) {
          // Backend persistence for authenticated users
          const newTask = await postData("/api/tasks", { text, pomodoros });
          setTasks((prevTasks) => [newTask, ...prevTasks]);
        } else {
          // Local storage persistence for guest users
          // Generate a temporary ID for local tasks
          const tempId = `local-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          const newLocalTask: Task = {
            _id: tempId,
            text,
            pomodoros,
            pomodorosCompleted: 0,
            completed: false,
            createdAt: new Date().toISOString(),
          };
          setTasks((prevTasks) => {
            const updatedTasks = [newLocalTask, ...prevTasks];
            saveTasksToLocalStorage(updatedTasks); // Save to local storage
            return updatedTasks;
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error adding task:", err);
        setError(`Failed to add task: ${err.message || "Unknown error"}`);
        setIsLoading(false);
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (isAuthenticated) {
          await deleteData(`/api/tasks/${id}`);
          setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
        } else {
          setTasks((prevTasks) => {
            const updatedTasks = prevTasks.filter((task) => task._id !== id);
            saveTasksToLocalStorage(updatedTasks); // Save to local storage
            return updatedTasks;
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error deleting task:", err);
        setError(`Failed to delete task: ${err.message || "Unknown error"}`);
        setIsLoading(false);
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  );

  const incrementPomodoro = useCallback(
    async (id: string) => {
      setIsLoading(true); // Setting loading true briefly for API call feedback
      setError(null);
      try {
        if (isAuthenticated) {
          const updatedTask = await putData(
            `/api/tasks/${id}/incrementPomodoro`,
            {}
          );
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === id ? updatedTask : task))
          );
        } else {
          setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) =>
              task._id === id
                ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 }
                : task
            );
            saveTasksToLocalStorage(updatedTasks); // Save to local storage
            return updatedTasks;
          });
        }
        // setIsLoading(false); // Only set to false after the entire action is complete, not just the API call.
      } catch (err) {
        console.error("Error incrementing pomodoro:", err);
        setError(
          `Failed to increment pomodoro: ${err.message || "Unknown error"}`
        );
      } finally {
        setIsLoading(false); // Ensure loading is reset
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  );

  const setPomodoros = useCallback(
    async (id: string, newPomodoros: number) => {
      setIsLoading(true);
      setError(null);
      try {
        if (isAuthenticated) {
          const updatedTask = await putData(`/api/tasks/${id}`, {
            pomodoros: newPomodoros,
          });
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === id ? updatedTask : task))
          );
        } else {
          setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) =>
              task._id === id ? { ...task, pomodoros: newPomodoros } : task
            );
            saveTasksToLocalStorage(updatedTasks);
            return updatedTasks;
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error setting target pomodoros:", err);
        setError(
          `Failed to set target pomodoros: ${err.message || "Unknown error"}`
        );
        setIsLoading(false);
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  );

  const toggleTaskCompleted = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (isAuthenticated) {
          const updatedTask = await putData(
            `/api/tasks/${id}/toggleCompleted`,
            {}
          );
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === id ? updatedTask : task))
          );
        } else {
          setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) =>
              task._id === id ? { ...task, completed: !task.completed } : task
            );
            saveTasksToLocalStorage(updatedTasks);
            return updatedTasks;
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error toggling task completed:", err);
        setError(
          `Failed to toggle task completed: ${err.message || "Unknown error"}`
        );
        setIsLoading(false);
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        deleteTask,
        setCurrentTaskId,
        currentTaskId,
        incrementPomodoro,
        setPomodoros,
        toggleTaskCompleted,
        isLoading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
