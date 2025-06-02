import React, { createContext, useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Task {
  id: string;
  text: string;
  pomodoros: number;
  createdAt: string;
  pomodorosCompleted: number;
  completed: boolean; // ✅ NEW FIELD
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (text: string, pomodoros: number) => void; // changed
  deleteTask: (id: string) => void;
  incrementPomodoro: (id: string) => void;
  setPomodoros: (id: string, count: number) => void; // ✅ NEW METHOD
  toggleTaskCompleted: (id: string) => void; // renamed
  currentTaskId: string | null;
  setCurrentTaskId: (id: string | null) => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined
);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentTaskId && tasks.length > 0) {
      setCurrentTaskId(tasks[0].id);
    }
  }, [tasks, currentTaskId]);

  const addTask = (text: string, pomodoros: number) => {
    const newTask: Task = {
      id: uuidv4(),
      text,
      pomodoros,
      pomodorosCompleted: 0,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (currentTaskId === id) {
      setCurrentTaskId(null);
    }
  };

  const incrementPomodoro = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((task) => {
        if (task.id === id) {
          const newCount = task.pomodorosCompleted + 1;
          const isDone = task.pomodoros > 0 && newCount >= task.pomodoros;
          return {
            ...task,
            pomodorosCompleted: newCount,
            completed: isDone || task.completed,
          };
        }
        return task;
      });
      localStorage.setItem("tasks", JSON.stringify(updated));
      return updated;
    });
  };

  const setPomodoros = (id: string, count: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, pomodoros: count } : task
      )
    );
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        addTask,
        deleteTask,
        incrementPomodoro,
        setPomodoros,
        toggleTaskCompleted,
        currentTaskId,
        setCurrentTaskId,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};
