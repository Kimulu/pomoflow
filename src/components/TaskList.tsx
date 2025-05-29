//@ts-nocheck
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { taskActions } from "../store/task";
import { RootState } from "../store";
import { v4 as uuidv4 } from "uuid";

const TaskList = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.list);

  useEffect(() => {
    let userId = Cookies.get("user_id");
    if (!userId) {
      userId = uuidv4();
      Cookies.set("user_id", userId, { expires: 365 });
      console.log("🆕 New user ID created:", userId);
    } else {
      console.log("🔐 Existing user ID:", userId);
    }
  }, []);

  useEffect(() => {
    const userId = Cookies.get("user_id");
    if (userId) {
      Cookies.set(`tasks_${userId}`, JSON.stringify(tasks), { expires: 7 });
    }
  }, [tasks]);

  useEffect(() => {
    const userId = Cookies.get("user_id");
    if (userId) {
      const savedTasks = Cookies.get(`tasks_${userId}`);
      if (savedTasks) {
        try {
          const parsed = JSON.parse(savedTasks);
          parsed.forEach((task: any) => {
            dispatch(taskActions.addTask(task));
          });
        } catch (err) {
          console.error("Failed to load tasks from cookie:", err);
        }
      }
    }
  }, []);

  const [title, setTitle] = useState("");
  const [pomodorosTarget, setPomodorosTarget] = useState(1);

  const addHandler = () => {
    if (!title.trim()) return;
    const taskId = Math.random().toString();
    dispatch(taskActions.addTask({ id: taskId, title, pomodorosTarget }));
    dispatch(taskActions.setCurrentTask(taskId));

    setTitle("");
    setPomodorosTarget(1);
  };

  const toggleHandler = (id) => {
    dispatch(taskActions.toggleTaskComplete(id));
  };

  const deleteHandler = (id) => {
    dispatch(taskActions.deleteTask(id));
  };

  const incrementHandler = (id) => {
    dispatch(taskActions.incrementPomodoro(id));
  };

  return (
    <main className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Task List</h1>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Task title"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          className="input input-bordered w-30"
          placeholder="Add Pomos needed"
          value={pomodorosTarget}
          onChange={(e) => setPomodorosTarget(Number(e.target.value))}
        />
        <button onClick={addHandler} className="btn btn-primary">
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between bg-base-200 p-4 rounded-box shadow"
          >
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={task.completed}
                  onChange={() => toggleHandler(task.id)}
                />
                <span
                  className={`font-medium ${
                    task.completed ? "line-through opacity-60" : ""
                  }`}
                >
                  {task.title}
                </span>
              </label>
              <div className="text-sm mt-1 text-base-content">
                🍅 {task.pomodorosCompleted}/{task.pomodorosTarget} Pomodoros
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-accent"
                onClick={() => incrementHandler(task.id)}
              >
                +1 Pomo
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={() => deleteHandler(task.id)}
              >
                x
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default TaskList;
