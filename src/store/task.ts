import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  pomodorosTarget: number;
  pomodorosCompleted: number;
};

type TaskState = {
  list: Task[];
};

const initialState: TaskState = {
  list: [],
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action) => {
      const newTask = {
        id: Math.random().toString(),
        title: action.payload.title,
        pomodorosTarget: action.payload.pomodorosTarget,
        pomodorosCompleted: 0,
        completed: false,
      };
      state.list.push(newTask);
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.list = state.list.filter((task) => task.id !== action.payload);
    },

    toggleTaskComplete(state, action: PayloadAction<string>) {
      const task = state.list.find((task) => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    incrementPomodoro: (state, action) => {
      const task = state.list.find((t) => t.id === action.payload);
      if (task && task.pomodorosCompleted < task.pomodorosTarget) {
        task.pomodorosCompleted++;
        if (task.pomodorosCompleted === task.pomodorosTarget) {
          task.completed = true;
        }
      }
    },
  },
});

export const taskActions = taskSlice.actions;

export default taskSlice.reducer;
