import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./task"; // Assuming task.ts is in same folder

const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export default store;
