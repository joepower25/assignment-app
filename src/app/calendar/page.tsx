"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { addDays, daysInMonth, formatDate, monthLabel } from "@/lib/utils";

const views = ["Month", "Week", "Day"] as const;

type View = (typeof views)[number];

export default function CalendarPage() {
  const { state, updateAssignment } = useAppStore();
  const [view, setView] = useState<View>("Month");
  const [cursor, setCursor] = useState(new Date());

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const days = daysInMonth(cursor.getFullYear(), cursor.getMonth());
  const startDay = (monthStart.getDay() + 6) % 7;
  const toLocalDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const cells = Array.from({ length: startDay + days }, (_, i) => {
    const dayIndex = i - startDay + 1;
    if (dayIndex <= 0) return null;
    const date = toLocalDateString(new Date(cursor.getFullYear(), cursor.getMonth(), dayIndex));
    return date;
  });

  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, typeof state.assignments>();
    state.assignments.forEach((assignment) => {
      map.set(assignment.dueDate, [...(map.get(assignment.dueDate) ?? []), assignment]);
    });
    return map;
  }, [state.assignments]);

  const handleDrop = (date: string, assignmentId: string) => {
    const assignment = state.assignments.find((item) => item.id === assignmentId);
    if (!assignment) return;
    updateAssignment({ ...assignment, dueDate: date, updatedAt: new Date().toISOString() });
  };

  const weekStart = new Date(cursor);
  const dayOfWeek = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - ((dayOfWeek + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    toLocalDateString(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i))
  );

  const dayAssignments = state.assignments.filter(
    (assignment) => assignment.dueDate === toLocalDateString(cursor)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Calendar View</p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-sand-50">
            {monthLabel(cursor)}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {views.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                view === item
                  ? "bg-slate-900 text-white dark:bg-sand-200 dark:text-ink-900"
                  : "border border-slate-200/60 bg-white text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {view === "Month" && (
        <div className="grid gap-4 rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/70">
          <div className="grid grid-cols-7 text-xs uppercase tracking-[0.3em] text-slate-400">
            {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((day) => (
              <span key={day} className="pb-2">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {cells.map((date, idx) => (
              <div
                key={`${date ?? "blank"}-${idx}`}
                className="min-h-[120px] rounded-2xl border border-dashed border-slate-200/60 bg-white/70 p-3 text-xs text-slate-400 dark:border-white/10 dark:bg-ink-900"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const assignmentId = event.dataTransfer.getData("text/plain");
                  if (date && assignmentId) handleDrop(date, assignmentId);
                }}
              >
                {date && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-sand-200">
                      {date.split("-")[2]}
                    </span>
                    <div className="flex flex-col gap-2">
                      {(assignmentsByDate.get(date) ?? []).map((assignment) => {
                        const cls = state.classes.find((c) => c.id === assignment.classId);
                        return (
                          <div
                            key={assignment.id}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData("text/plain", assignment.id);
                            }}
                            className="cursor-grab rounded-xl px-2 py-1 text-[11px] font-medium text-slate-900"
                            style={{ background: `${cls?.color ?? "#e2e8f0"}33`, border: `1px solid ${cls?.color ?? "#e2e8f0"}` }}
                          >
                            {assignment.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "Week" && (
        <div className="grid gap-4 rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/70">
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((date) => (
              <div key={date} className="rounded-2xl border border-slate-200/60 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-ink-900">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{formatDate(date)}</p>
                <div className="mt-3 flex flex-col gap-2">
                  {(assignmentsByDate.get(date) ?? []).map((assignment) => {
                    const cls = state.classes.find((c) => c.id === assignment.classId);
                    return (
                      <div
                        key={assignment.id}
                        className="rounded-xl px-2 py-2 text-xs"
                        style={{ background: `${cls?.color ?? "#e2e8f0"}33`, border: `1px solid ${cls?.color ?? "#e2e8f0"}` }}
                      >
                        <p className="font-semibold text-slate-900 dark:text-sand-50">
                          {assignment.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-sand-200">{assignment.dueTime}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "Day" && (
        <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/70">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Day Focus</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCursor(new Date(cursor.getTime() - 86400000))}
                className="rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs dark:border-white/10 dark:bg-ink-900"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCursor(new Date(cursor.getTime() + 86400000))}
                className="rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs dark:border-white/10 dark:bg-ink-900"
              >
                Next
              </button>
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-sand-50">
            {formatDate(toLocalDateString(cursor))}
          </h3>
          <div className="mt-4 grid gap-3">
            {dayAssignments.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-sand-200">No assignments scheduled.</p>
            )}
            {dayAssignments.map((assignment) => {
              const cls = state.classes.find((c) => c.id === assignment.classId);
              return (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-ink-950"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-sand-50">
                        {assignment.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-sand-200">{cls?.name}</p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: cls?.color ?? "#e2e8f0" }}
                    >
                      {assignment.dueTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
        >
          Previous Month
        </button>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
        >
          Next Month
        </button>
      </div>
    </div>
  );
}
