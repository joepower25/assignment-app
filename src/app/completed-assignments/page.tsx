"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function CompletedAssignmentsPage() {
  const { state, updateAssignment, deleteAssignment } = useAppStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const completed = state.assignments.filter((a) => a.completed);

  return (
    <div className="space-y-4">
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/40 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900/95">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">Delete Assignment</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">
              This action cannot be undone. The assignment will be permanently removed.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn flex-1 rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAssignment(deleteTarget);
                  setDeleteTarget(null);
                }}
                className="btn flex-1 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Okay, Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
                <button
                  type="button"
                  onClick={() => setDeleteTarget(assignment.id)}
                  className="btn rounded-full border border-rose-200/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:border-rose-200/20 dark:bg-ink-900 dark:text-rose-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
