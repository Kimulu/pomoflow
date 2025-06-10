"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchData, postData, putData, deleteData } from "../pages/api/api";
import { Task } from "../types";
import { v4 as uuidv4 } from "uuid"; // Import uuid for local task IDs

// Define the shape of the TaskContext
interface TaskContextType {
  tasks: Task[];
  addTask: (
    text: string,
    pomodoros: number,
    projectId?: string | null
  ) => Promise<void>;
  updateTask: (
    id: string,
    updates: {
      text?: string;
      pomodoros?: number;
      completed?: boolean;
      pomodorosCompleted?: number;
      projectId?: string | null;
    }
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setCurrentTaskId: (id: string | null) => void;
  currentTaskId: string | null;
  incrementPomodoro: (id: string) => Promise<void>;
  setPomodoros: (id: string, newPomodoros: number) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  isLoading: boolean; // This will now primarily represent initial load
  error: string | null;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_TASKS_KEY = "pomoflow_guest_tasks";

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Only for initial load
  const [error, setError] = useState<string | null>(null);

  const saveTasksToLocalStorage = useCallback((tasksToSave: Task[]) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_TASKS_KEY,
        JSON.stringify(tasksToSave)
      );
    } catch (e: unknown) {
      console.error("Failed to save tasks to local storage", e);
    }
  }, []);

  // --- Initial Fetch/Load of Tasks ---
  useEffect(() => {
    const loadTasks = async () => {
      // Only run this effect once authentication status is known and stable
      if (authLoading) return;

      setIsLoading(true); // Set loading for initial fetch
      setError(null);

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Fetch from Backend ---
        try {
          const data = await fetchData<Task[]>("/tasks");
          setTasks(data);
          localStorage.removeItem(LOCAL_STORAGE_TASKS_KEY); // Clear guest tasks if user logs in
        } catch (err: unknown) {
          console.error("Failed to fetch tasks from backend:", err);
          setError(
            (err instanceof Error ? err.message : String(err)) ||
              "Failed to load tasks from server."
          );
          setTasks([]);
        } finally {
          setIsLoading(false); // Reset loading after initial fetch
        }
      } else {
        // --- GUEST USER: Load from Local Storage ---
        try {
          const savedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
          if (savedTasks) {
            const parsedTasks: Task[] = JSON.parse(savedTasks);
            setTasks(parsedTasks);
          } else {
            setTasks([]);
          }
        } catch (err: unknown) {
          console.error("Failed to load tasks from local storage:", err);
          setError(
            (err instanceof Error ? err.message : String(err)) ||
              "Failed to load tasks from local storage."
          );
          setTasks([]);
        } finally {
          setIsLoading(false); // Reset loading after initial fetch
        }
      }
    };

    loadTasks();
  }, [isAuthenticated, authLoading]);

  // Effect to manage currentTaskId
  useEffect(() => {
    if (currentTaskId && !tasks.find((task) => task._id === currentTaskId)) {
      // If current task is deleted or no longer exists, clear currentTaskId
      setCurrentTaskId(null);
    }
    // If no currentTaskId set and tasks are available, set the first task as current
    // Ensure this doesn't run during initial loading to prevent flickering
    if (!currentTaskId && tasks.length > 0 && !isLoading) {
      setCurrentTaskId(tasks[0]._id);
    }
  }, [tasks, currentTaskId, isLoading]);

  // --- CRUD Operations (Hybrid Backend/Local Storage) ---

  const addTask = useCallback(
    async (text: string, pomodoros: number, projectId?: string | null) => {
      setError(null); // Clear errors

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Add via Backend API ---
        // Optimistic update for authenticated users
        const tempId = `optimistic-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const newOptimisticTask: Task = {
          _id: tempId,
          text,
          pomodoros,
          pomodorosCompleted: 0,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(), // Add updatedAt
          projectId: projectId || null,
          userId: "temp", // Placeholder for userId, will be replaced by backend
        };
        setTasks((prevTasks) => [newOptimisticTask, ...prevTasks]);

        try {
          const newTaskFromServer = await postData<Task>("/tasks", {
            text,
            pomodoros,
            projectId,
          });
          // Replace the optimistic task with the server-returned task
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === tempId ? newTaskFromServer : task
            )
          );
        } catch (err: unknown) {
          console.error("Error adding task to backend:", err);
          setError(
            `Failed to add task: ${
              (err instanceof Error ? err.message : String(err)) ||
              "Unknown error"
            }`
          );
          // Revert optimistic update on error
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task._id !== tempId)
          );
        }
      } else {
        // --- GUEST USER: Add to Local Storage ---
        const newTask: Task = {
          _id: uuidv4(), // Generate unique ID for local task
          text,
          pomodoros,
          pomodorosCompleted: 0,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(), // Add updatedAt
          userId: "guest", // Placeholder userId for local tasks
          projectId: null, // Guest users can't assign projects
        };
        setTasks((prevTasks) => {
          const updatedTasks = [newTask, ...prevTasks]; // Add new task to the beginning
          saveTasksToLocalStorage(updatedTasks); // Save updated array to local storage
          return updatedTasks;
        });
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  );

  const updateTask = useCallback(
    async (
      id: string,
      updates: {
        text?: string;
        pomodoros?: number;
        completed?: boolean;
        pomodorosCompleted?: number;
        projectId?: string | null;
      }
    ) => {
      setError(null); // Clear errors

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Update via Backend API ---
        const originalTasks = tasks; // Capture current state for potential rollback
        // Optimistically update UI
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          )
        );

        try {
          const updatedTaskFromServer = await putData<Task>(
            `/tasks/${id}`,
            updates
          );
          if (updatedTaskFromServer) {
            // Update with server's authoritative version.
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === id ? updatedTaskFromServer : task
              )
            );
          } else {
            console.warn(
              `Backend did not return updated task for ID: ${id}. Reverting optimistic update.`
            );
            setTasks(originalTasks); // Revert to original state
            setError("Server did not return updated task data.");
          }
        } catch (err: unknown) {
          console.error("Error updating task on backend:", err);
          setError(
            `Failed to update task: ${
              (err instanceof Error ? err.message : String(err)) ||
              "Unknown error"
            }`
          );
          setTasks(originalTasks); // Revert to original state on error
        }
      } else {
        // --- GUEST USER: Update in Local Storage ---
        setTasks((prevTasks) => {
          const newTasks = prevTasks.map((task) => {
            if (task._id === id) {
              // Ensure projectId is null for guest users if update tries to set it
              const finalUpdates =
                updates.projectId !== undefined && !isAuthenticated
                  ? { ...updates, projectId: null }
                  : updates;
              return {
                ...task,
                ...finalUpdates,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          });
          saveTasksToLocalStorage(newTasks); // Save updated array to local storage
          return newTasks;
        });
      }
    },
    [isAuthenticated, saveTasksToLocalStorage, tasks]
  ); // `tasks` is a dependency here because of `originalTasks`

  const deleteTask = useCallback(
    async (id: string) => {
      setError(null); // Clear errors

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Delete via Backend API ---
        const originalTasks = tasks; // Capture current state for potential rollback
        // Optimistically remove from UI
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));

        try {
          await deleteData(`/tasks/${id}`);
          // If successful, optimistic update stands
        } catch (err: unknown) {
          console.error("Error deleting task on backend:", err);
          setError(
            `Failed to delete task: ${
              (err instanceof Error ? err.message : String(err)) ||
              "Unknown error"
            }`
          );
          setTasks(originalTasks); // Revert optimistic update on error
        }
      } else {
        // --- GUEST USER: Delete from Local Storage ---
        setTasks((prevTasks) => {
          const newTasks = prevTasks.filter((task) => task._id !== id);
          saveTasksToLocalStorage(newTasks); // Save updated array to local storage
          return newTasks;
        });
      }
    },
    [isAuthenticated, saveTasksToLocalStorage, tasks]
  ); // `tasks` is a dependency here because of `originalTasks`

  const incrementPomodoro = useCallback(
    async (id: string) => {
      setError(null); // Clear errors
      let originalPomodorosCompleted: number | undefined;

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === id) {
            originalPomodorosCompleted = task.pomodorosCompleted; // Store original
            return {
              ...task,
              pomodorosCompleted: task.pomodorosCompleted + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        })
      );

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Increment via Backend API ---
        try {
          const updatedTaskFromServer = await putData<Task>(
            `/tasks/${id}/incrementPomodoro`,
            {} // Empty body for a POST-like PUT operation
          );
          if (updatedTaskFromServer) {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === id ? updatedTaskFromServer : task
              )
            );
          } else {
            console.warn(
              `Backend did not return updated task for ID: ${id}. Reverting optimistic update.`
            );
            // Revert the specific task's optimistic update
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === id
                  ? { ...task, pomodorosCompleted: originalPomodorosCompleted! } // Use original
                  : task
              )
            );
            setError("Server did not return updated task data.");
          }
        } catch (err: unknown) {
          console.error("Error incrementing pomodoro on backend:", err);
          setError(
            `Failed to increment pomodoro: ${
              (err instanceof Error ? err.message : String(err)) ||
              "Unknown error"
            }`
          );
          // Revert optimistic update on error
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === id
                ? { ...task, pomodorosCompleted: originalPomodorosCompleted! } // Use original
                : task
            )
          );
        }
      } else {
        // --- GUEST USER: Update in Local Storage (already done by setTasks) ---
        // Ensure local storage is updated after the optimistic UI update
        // We use a functional update for setTasks, so `saveTasksToLocalStorage` must be called after the state update
        // to get the correct, new state.
        setTasks((prevTasks) => {
          const newTasks = prevTasks.map((task) =>
            task._id === id
              ? {
                  ...task,
                  pomodorosCompleted: task.pomodorosCompleted,
                  updatedAt: new Date().toISOString(),
                } // Already incremented, just ensure updatedAt
              : task
          );
          saveTasksToLocalStorage(newTasks);
          return newTasks;
        });
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  ); // No need for 'tasks' dependency if functional updates are used for `setTasks` for optimistic changes

  const setPomodoros = useCallback(
    async (id: string, newPomodoros: number) => {
      setError(null); // Clear errors
      let originalPomodoros: number | undefined;

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === id) {
            originalPomodoros = task.pomodoros; // Store original
            return {
              ...task,
              pomodoros: newPomodoros,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        })
      );

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Set Pomodoros via Backend API ---
        try {
          const updatedTaskFromServer = await putData<Task>(`/tasks/${id}`, {
            pomodoros: newPomodoros,
          });
          if (updatedTaskFromServer) {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === id ? updatedTaskFromServer : task
              )
            );
          } else {
            console.warn(
              `Backend did not return updated task for ID: ${id}. Reverting optimistic update.`
            );
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === id
                  ? { ...task, pomodoros: originalPomodoros! }
                  : task
              )
            );
            setError("Server did not return updated task data.");
          }
        } catch (err: unknown) {
          console.error("Error setting target pomodoros on backend:", err);
          setError(
            `Failed to set target pomodoros: ${
              (err instanceof Error ? err.message : String(err)) ||
              "Unknown error"
            }`
          );
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === id
                ? { ...task, pomodoros: originalPomodoros! }
                : task
            )
          );
        }
      } else {
        // --- GUEST USER: Update in Local Storage (already done by setTasks) ---
        setTasks((prevTasks) => {
          const newTasks = prevTasks.map((task) =>
            task._id === id
              ? {
                  ...task,
                  pomodoros: newPomodoros,
                  updatedAt: new Date().toISOString(),
                }
              : task
          );
          saveTasksToLocalStorage(newTasks);
          return newTasks;
        });
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  ); // No need for 'tasks' dependency

  const toggleTaskCompleted = useCallback(
    async (id: string) => {
      setError(null); // Clear errors
      let originalCompletedStatus: boolean | undefined;

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === id) {
            originalCompletedStatus = task.completed; // Store original
            return {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        })
      );

      if (isAuthenticated) {
        // --- LOGGED-IN USER: Toggle Completed via Backend API ---
        try {
          const updatedTaskFromServer = await putData<Task>(
            `/tasks/${id}/toggleCompleted`,
            {} // Empty body for a POST-like PUT operation
          );
          if (updatedTaskFromServer) {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === id ? updatedTaskFromServer : task
              )
            );
          } else {
            console.warn(
              `Backend did not return updated task for ID: ${id}. Reverting optimistic update.`
            );
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === id
                  ? { ...task, completed: originalCompletedStatus! } // Revert to original
                  : task
              )
            );
            setError("Server did not return updated task data.");
          }
        } catch (err: unknown) {
          console.error("Error toggling task completed on backend:", err);
          setError(
            `Failed to toggle task completed: ${
              (err instanceof Error ? err.message : String(err)) ||
              "Unknown error"
            }`
          );
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === id
                ? { ...task, completed: originalCompletedStatus! } // Revert to original
                : task
            )
          );
        }
      } else {
        // --- GUEST USER: Update in Local Storage (already done by setTasks) ---
        setTasks((prevTasks) => {
          const newTasks = prevTasks.map((task) =>
            task._id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  updatedAt: new Date().toISOString(),
                }
              : task
          );
          saveTasksToLocalStorage(newTasks);
          return newTasks;
        });
      }
    },
    [isAuthenticated, saveTasksToLocalStorage]
  ); // No need for 'tasks' dependency

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
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
