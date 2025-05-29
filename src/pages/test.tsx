//@ts-nocheck
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { taskActions } from "../store/task";
import { RootState } from "../store";

const testTaskId = "test-task-id";

export default function TimerTest() {
  const dispatch = useDispatch();

  const task = useSelector((state: RootState) =>
    state.tasks.list.find((t) => t.id === testTaskId)
  );

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;

      if (!task) {
        console.log("Task not found. Adding test task...");
        dispatch(
          taskActions.addTask({
            id: testTaskId,
            title: "Timer Test Task",
            pomodorosTarget: 2,
          })
        );
      }

      // Wait a little to ensure Redux updates
      setTimeout(() => {
        console.log("Dispatching incrementPomodoro for ID:", testTaskId);
        dispatch(taskActions.incrementPomodoro(testTaskId));
      }, 1500); // Slight delay to allow Redux to update state
    }
  }, [dispatch, task]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">TimerTest Running...</h2>
      <p>Check console after 1.5 sec for increment logs.</p>

      <div className="mt-4">
        <strong>Task:</strong> {task ? task.title : "No task yet"}
        <br />
        <strong>Completed:</strong> {task?.pomodorosCompleted ?? 0}
      </div>
    </div>
  );
}
