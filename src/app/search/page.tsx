"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function SearchPage() {
  const { state } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const assignments = state.assignments
      .filter((a) => a.title.toLowerCase().includes(q))
      .map((a) => ({ type: "Assignment", title: a.title, detail: a.dueDate, id: a.id }));
    const notes = state.notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .map((n) => ({ type: "Note", title: n.title, detail: n.tags.join(", "), id: n.id }));
    const classes = state.classes
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => ({ type: "Class", title: c.name, detail: c.instructor, id: c.id }));

    const all = [...assignments, ...notes, ...classes];

    if (filter === "overdue") {
      const today = new Date().toISOString().slice(0, 10);
      return assignments.filter((a) => a.detail < today);
    }
    if (filter === "priority") {
      const priorityRank = { High: 3, Medium: 2, Low: 1 } as const;
      return state.assignments
        .filter((a) => a.title.toLowerCase().includes(q))
        .sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])
        .map((a) => ({ type: "Assignment", title: a.title, detail: a.dueDate, id: a.id }));
    }
    if (filter === "incomplete") {
      const incomplete = state.assignments.filter((a) => !a.completed).map((a) => ({
        type: "Assignment",
        title: a.title,
        detail: a.dueDate,
        id: a.id,
      }));
      return incomplete.filter((a) => a.title.toLowerCase().includes(q));
    }
    return all;
  }, [filter, query, state.assignments, state.classes, state.notes]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search assignments, notes, classes"
          className="w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "overdue", label: "Overdue" },
            { id: "priority", label: "By Priority" },
            { id: "incomplete", label: "Incomplete" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                filter === item.id
                  ? "bg-slate-900 text-white dark:bg-sand-200 dark:text-ink-900"
                  : "border border-slate-200/60 bg-white text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={`${result.type}-${result.id}`}
            className="rounded-3xl border border-slate-200/40 bg-white/80 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-ink-900/80"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{result.type}</p>
                <p className="text-base font-semibold text-slate-900 dark:text-sand-50">{result.title}</p>
              </div>
              <span className="text-xs text-slate-400">
                {result.type === "Assignment" ? formatDate(result.detail) : result.detail}
              </span>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-sand-200">No matches found.</p>
        )}
      </div>
    </div>
  );
}
