"use client";

import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function CompletedAssignmentsPage() {
  const { state, updateAssignment } = useAppStore();
  const completed = state.assignments.filter((a) => a.completed);

  return (
    <div className="space-y-4">
      {completed.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-sand-200">No completed assignments yet.</p>
      )}
      {completed.map((assignment) => {
        const cls = state.classes.find((c) => c.id === assignment.classId);
        return (
          <div
            key={assignment.id}
            className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-sand-50">
                  {assignment.title}
                </p>
                <p className="text-sm text-slate-500 dark:text-sand-200">{cls?.name}</p>
                <p className="text-xs text-slate-400">Completed • Due {formatDate(assignment.dueDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: cls?.color ?? "#e2e8f0" }}
                >
                  {assignment.status}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateAssignment({
                      ...assignment,
                      completed: false,
                      status: "On Track",
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="btn rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                >
                  Uncomplete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
