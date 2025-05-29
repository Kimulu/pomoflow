import Layout from "../components/Layout";
import PomodoroTimer from "@/components/PomodoroTimer";
import TaskList from "../components/TaskList";

export default function Home() {
  return (
    <Layout>
      <main className="max-w-6xl mx-auto w-full px-4 pt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Pomodoro Timer Section */}
          <section className="w-full lg:w-1/2 flex justify-center">
            <PomodoroTimer />
          </section>

          {/* Tasks Placeholder */}
          <section className="w-full lg:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Tasks</h3>
            <div className="bg-base-200 rounded-box p-6 text-base-content">
              <TaskList />
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
