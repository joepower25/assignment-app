"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Assignment, StatusTag } from "@/lib/types";
import { formatDate, uid } from "@/lib/utils";

const statusOptions: StatusTag[] = ["Urgent", "In Progress", "Blocked", "On Track", "Completed"];

const reminderOptions = [
  { label: "1 week", value: 10080 },
  { label: "2 days", value: 2880 },
  { label: "1 day", value: 1440 },
  { label: "2 hours", value: 120 },
];

export default function AssignmentsPage() {
  const { state, addAssignment, updateAssignment } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const draftBase: Assignment = {
    id: uid("assignment"),
    classId: state.classes[0]?.id ?? "",
    title: "",
    description: "",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "23:59",
    category: state.weightCategories[0]?.label ?? "General",
    status: "On Track",
    priority: "Medium",
    tags: [],
    reminderOffsets: [2880, 1440],
    weight: 10,
    completed: false,
    studyLogs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [draft, setDraft] = useState<Assignment>(draftBase);

  const assignments = useMemo(() => {
    if (filter === "overdue") {
      const today = new Date().toISOString().slice(0, 10);
      return state.assignments.filter((a) => !a.completed && a.dueDate < today);
    }
    if (filter === "incomplete") {
      return state.assignments.filter((a) => !a.completed);
    }
    if (filter === "urgent") {
      return state.assignments.filter((a) => a.status === "Urgent");
    }
    return state.assignments;
  }, [filter, state.assignments]);

  const handleSave = () => {
    if (!draft.title.trim()) return;
    addAssignment({ ...draft, updatedAt: new Date().toISOString() });
    setDraft({ ...draftBase, id: uid("assignment") });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateAssignment({ ...draft, id: editingId, updatedAt: new Date().toISOString() });
    setEditingId(null);
    setDraft({ ...draftBase, id: uid("assignment") });
  };

  const startEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setDraft({ ...assignment });
  };

  const toggleReminder = (value: number) => {
    setDraft((prev) => ({
      ...prev,
      reminderOffsets: prev.reminderOffsets.includes(value)
        ? prev.reminderOffsets.filter((v) => v !== value)
        : [...prev.reminderOffsets, value],
    }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "overdue", label: "Overdue" },
            { id: "urgent", label: "Urgent" },
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

        {assignments.map((assignment) => {
          const cls = state.classes.find((c) => c.id === assignment.classId);
          return (
            <div
              key={assignment.id}
              className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-sand-50">
                    {assignment.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-sand-200">{cls?.name}</p>
                  <p className="text-xs text-slate-400">
                    Due {formatDate(assignment.dueDate)} • {assignment.dueTime}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: cls?.color ?? "#e2e8f0" }}
                  >
                    {assignment.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(assignment)}
                    className="rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                  >
                    Edit
                  </button>
                  <Link
                    href={`/assignments/${assignment.id}`}
                    className="btn rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                  >
                    Focus
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {assignment.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200/60 px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-sand-200">
                <span>Weight: {assignment.weight}%</span>
                <span>Category: {assignment.category}</span>
                <span>Priority: {assignment.priority}</span>
                <span>Grade: {assignment.grade ?? "-"}</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assignment.completed}
                    onChange={() =>
                      updateAssignment({
                        ...assignment,
                        completed: !assignment.completed,
                        status: !assignment.completed ? "Completed" : "On Track",
                        updatedAt: new Date().toISOString(),
                      })
                    }
                  />
                  Completed
                </label>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">
          {editingId ? "Edit Assignment" : "New Assignment"}
        </h3>
        <div className="mt-4 grid gap-3 text-sm">
          <input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Assignment title"
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <textarea
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            placeholder="Description"
            className="min-h-[90px] rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <select
            value={draft.classId}
            onChange={(event) => setDraft({ ...draft, classId: event.target.value })}
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          >
            {state.classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
              className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
            />
            <input
              type="time"
              value={draft.dueTime}
              onChange={(event) => setDraft({ ...draft, dueTime: event.target.value })}
              className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
            />
          </div>
          <select
            value={draft.category}
            onChange={(event) => {
              const category = event.target.value;
              const weight = state.weightCategories.find((c) => c.label === category)?.weight ?? draft.weight;
              setDraft({ ...draft, category, weight });
            }}
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          >
            {state.weightCategories.map((category) => (
              <option key={category.id} value={category.label}>
                {category.label} ({category.weight}%)
              </option>
            ))}
            <option value="Custom">Custom</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value as StatusTag })}
              className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={draft.priority}
              onChange={(event) => setDraft({ ...draft, priority: event.target.value as Assignment["priority"] })}
              className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Assignment Weight (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.weight}
            onChange={(event) => setDraft({ ...draft, weight: Number(event.target.value) })}
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    tags: prev.tags.includes(tag)
                      ? prev.tags.filter((t) => t !== tag)
                      : [...prev.tags, tag],
                  }))
                }
                className={`rounded-full px-3 py-1 text-xs ${
                  draft.tags.includes(tag)
                    ? "bg-slate-900 text-white dark:bg-sand-200 dark:text-ink-900"
                    : "border border-slate-200/60 text-slate-600 dark:border-white/10 dark:text-sand-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Reminders</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {reminderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleReminder(option.value)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    draft.reminderOffsets.includes(option.value)
                      ? "bg-slate-900 text-white dark:bg-sand-200 dark:text-ink-900"
                      : "border border-slate-200/60 text-slate-600 dark:border-white/10 dark:text-sand-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.grade ?? ""}
            onChange={(event) => setDraft({ ...draft, grade: Number(event.target.value) })}
            placeholder="Grade (optional)"
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <div className="flex gap-2">
            {editingId ? (
              <button
                type="button"
                onClick={handleUpdate}
                className="btn flex-1 rounded-full bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
              >
                Update Assignment
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="btn flex-1 rounded-full bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
              >
                Save Assignment
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
