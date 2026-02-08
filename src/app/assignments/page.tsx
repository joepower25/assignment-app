"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const { state, addAssignment, updateAssignment, deleteAssignment } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const draftBase = useMemo<Assignment>(
    () => ({
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
      subtasks: [],
      studyLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [state.classes, state.weightCategories]
  );

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
      return state.assignments.filter((a) => a.status === "Urgent" && !a.completed);
    }
    return state.assignments.filter((a) => !a.completed);
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
    setDraft({
      ...assignment,
      grade: assignment.grade ?? undefined,
      dueDate: assignment.dueDate || new Date().toISOString().slice(0, 10),
      dueTime: assignment.dueTime || "23:59",
      subtasks: assignment.subtasks ?? [],
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200/40 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900/95">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">Edit Assignment</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraft({ ...draftBase, id: uid("assignment") });
                }}
                className="btn rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <AssignmentForm
                draft={draft}
                setDraft={setDraft}
                state={state}
                reminderOptions={reminderOptions}
                statusOptions={statusOptions}
                primaryLabel="Update Assignment"
                onPrimary={handleUpdate}
              />
            </div>
          </div>
        </div>
      )}
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
                  if (!deleteTarget) return;
                  setIsDeleting(true);
                  const targetId = deleteTarget.id;
                  setDeleteTarget(null);
                  deleteAssignment(targetId);
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
                className="btn flex-1 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Okay, Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
              className={`btn rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
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
                    className="btn rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(assignment)}
                    className="btn rounded-full border border-rose-200/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:border-rose-200/20 dark:bg-ink-900 dark:text-rose-200"
                  >
                    Delete
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
                {assignment.subtasks.length > 0 && (
                  <span className="rounded-full border border-slate-200/60 px-3 py-1 text-xs text-slate-500 dark:text-sand-200">
                    Subtasks {assignment.subtasks.filter((task) => task.completed).length}/
                    {assignment.subtasks.length}
                  </span>
                )}
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
        <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">New Assignment</h3>
        <div className="mt-4">
          <AssignmentForm
            draft={draft}
            setDraft={setDraft}
            state={state}
            reminderOptions={reminderOptions}
            statusOptions={statusOptions}
            primaryLabel="Save Assignment"
            onPrimary={handleSave}
          />
        </div>
      </section>
    </div>
  );
}

const AssignmentForm = ({
  draft,
  setDraft,
  state,
  reminderOptions,
  statusOptions,
  primaryLabel,
  onPrimary,
}: {
  draft: Assignment;
  setDraft: React.Dispatch<React.SetStateAction<Assignment>>;
  state: ReturnType<typeof useAppStore>["state"];
  reminderOptions: { label: string; value: number }[];
  statusOptions: StatusTag[];
  primaryLabel: string;
  onPrimary: () => void;
}) => {
  const [subtaskTitle, setSubtaskTitle] = useState("");

  useEffect(() => {
    setSubtaskTitle("");
  }, [draft.id]);

  const toggleReminder = (value: number) => {
    setDraft((prev) => ({
      ...prev,
      reminderOffsets: prev.reminderOffsets.includes(value)
        ? prev.reminderOffsets.filter((v) => v !== value)
        : [...prev.reminderOffsets, value],
    }));
  };

  return (
    <div className="grid gap-3 text-sm">
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
                tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
              }))
            }
            className={`btn rounded-full px-3 py-1 text-xs ${
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
              className={`btn rounded-full px-3 py-1 text-xs ${
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
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Subtasks</p>
        {draft.subtasks.length > 0 && (
          <div className="space-y-2">
            {draft.subtasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/60 px-3 py-2 text-xs">
                <label className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      setDraft((prev) => ({
                        ...prev,
                        subtasks: prev.subtasks.map((item) =>
                          item.id === task.id ? { ...item, completed: !item.completed } : item
                        ),
                      }))
                    }
                  />
                  <input
                    value={task.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        subtasks: prev.subtasks.map((item) =>
                          item.id === task.id ? { ...item, title } : item
                        ),
                      }));
                    }}
                    className={`w-full bg-transparent text-xs focus:outline-none ${
                      task.completed ? "text-slate-400 line-through" : ""
                    }`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      subtasks: prev.subtasks.filter((item) => item.id !== task.id),
                    }))
                  }
                  className="text-[10px] uppercase tracking-[0.2em] text-rose-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={subtaskTitle}
            onChange={(event) => setSubtaskTitle(event.target.value)}
            placeholder="Add a subtask"
            className="flex-1 rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
          />
          <button
            type="button"
            onClick={() => {
              const title = subtaskTitle.trim();
              if (!title) return;
              setDraft((prev) => ({
                ...prev,
                subtasks: [...prev.subtasks, { id: uid("subtask"), title, completed: false }],
              }));
              setSubtaskTitle("");
            }}
            className="btn rounded-full border border-slate-200/60 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
          >
            Add
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrimary}
          className="btn flex-1 rounded-full bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
};
