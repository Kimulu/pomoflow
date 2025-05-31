import React, { createContext, useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Task {
  id: string;
  text: string;
  pomodoros: number;
  createdAt: string;
  pomodorosCompleted: number;
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (text: string) => void;
  deleteTask: (id: string) => void;
  incrementPomodoro: (id: string) => void;
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

  const addTask = (text: string) => {
    const newTask: Task = {
      id: uuidv4(),
      text,
      pomodoros: 0,
      pomodorosCompleted: 0,
      createdAt: new Date().toISOString(),
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
      const updated = prev.map((task) =>
        task.id === id
          ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 0.5 }
          : task
      );
      localStorage.setItem("tasks", JSON.stringify(updated));
      console.log(currentTaskId);
      console.log("incremented succesfully");
      return updated;
    });
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
        currentTaskId,
        setCurrentTaskId,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook for cleaner usage
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};
