"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatDate, sum, uid } from "@/lib/utils";

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params?.id as string;
  const { state, updateAssignment } = useAppStore();
  const assignment = state.assignments.find((item) => item.id === assignmentId);
  const cls = state.classes.find((c) => c.id === assignment?.classId);
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  if (!assignment) {
    return <div className="text-sm text-slate-500">Assignment not found.</div>;
  }

  const totalMinutes = sum(assignment.studyLogs.map((log) => log.minutes));

  const logTime = () => {
    const minutes = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;
    if (minutes === 0) return;
    updateAssignment({
      ...assignment,
      studyLogs: [
        { id: uid("log"), minutes, date: new Date().toISOString().slice(0, 10) },
        ...assignment.studyLogs,
      ],
      updatedAt: new Date().toISOString(),
    });
    setSeconds(0);
    setTimerActive(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus Mode</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-sand-50">
              {assignment.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-sand-200">{cls?.name}</p>
            <p className="text-xs text-slate-400">
              Due {formatDate(assignment.dueDate)} • {assignment.dueTime}
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: cls?.color ?? "#e2e8f0" }}
          >
            {assignment.status}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
          <h4 className="text-lg font-semibold">Study Timer</h4>
          <p className="text-xs text-slate-400">Built-in sprint timer with auto logging.</p>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-4xl font-semibold text-slate-900 dark:text-sand-50">
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
              </p>
              <p className="text-xs text-slate-400">Total logged: {totalMinutes} min</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTimerActive((prev) => !prev)}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-sand-200 dark:text-ink-900"
              >
                {timerActive ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={logTime}
                className="btn rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
              >
                Log Time
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
          <h4 className="text-lg font-semibold">Study Logs</h4>
          <div className="mt-4 space-y-2 text-sm">
            {assignment.studyLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between">
                <span>{log.date}</span>
                <span>{log.minutes} min</span>
              </div>
            ))}
            {assignment.studyLogs.length === 0 && (
              <p className="text-slate-500 dark:text-sand-200">No time logged yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-lg font-semibold">Subtasks</h4>
          {assignment.subtasks.length > 0 && (
            <p className="text-xs text-slate-400">
              {assignment.subtasks.filter((task) => task.completed).length}/{assignment.subtasks.length} completed
            </p>
          )}
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {assignment.subtasks.map((task) => (
            <label
              key={task.id}
              className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/60 px-3 py-2"
            >
              <span className="flex flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    updateAssignment({
                      ...assignment,
                      subtasks: assignment.subtasks.map((item) =>
                        item.id === task.id ? { ...item, completed: !item.completed } : item
                      ),
                      updatedAt: new Date().toISOString(),
                    })
                  }
                />
                <input
                  value={task.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    updateAssignment({
                      ...assignment,
                      subtasks: assignment.subtasks.map((item) =>
                        item.id === task.id ? { ...item, title } : item
                      ),
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                  className={`w-full bg-transparent text-sm focus:outline-none ${
                    task.completed ? "text-slate-400 line-through" : ""
                  }`}
                />
              </span>
            </label>
          ))}
          {assignment.subtasks.length === 0 && (
            <p className="text-slate-500 dark:text-sand-200">No subtasks yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
