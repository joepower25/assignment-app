"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import { ClassItem } from "@/lib/types";

const palette = ["#38bdf8", "#f59e0b", "#a78bfa", "#22c55e", "#f97316", "#14b8a6"];

export default function ClassesPage() {
  const { state, addClass, updateClass, deleteClass } = useAppStore();
  const [draft, setDraft] = useState<ClassItem>({
    id: uid("class"),
    name: "",
    color: palette[0],
    instructor: "",
    officeHours: "",
    location: "",
    credits: 3,
    termId: state.terms[0]?.id ?? "",
    resources: [],
    syllabusUploads: [],
  });
  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);

  const handleSubmit = () => {
    if (!draft.name.trim()) return;
    addClass(draft);
    setDraft({
      ...draft,
      id: uid("class"),
      name: "",
      instructor: "",
      officeHours: "",
      location: "",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/40 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900/95">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">Delete Class</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">
              This action cannot be undone. All assignments in this class will also be removed.
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
                  deleteClass(deleteTarget.id);
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
      <section className="space-y-4">
        {state.classes.map((cls) => (
          <div
            key={cls.id}
            className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: cls.color }}
                >
                  {cls.name}
                </span>
                <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">
                  Instructor: {cls.instructor || "TBD"} • {cls.location}
                </p>
                <p className="text-xs text-slate-400">Office Hours: {cls.officeHours || "TBD"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/classes/${cls.id}`}
                  className="btn rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                >
                  Manage
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cls)}
                  className="btn rounded-full border border-rose-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:border-rose-200/20 dark:bg-ink-900 dark:text-rose-200"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-xs text-slate-500 dark:text-sand-200 sm:grid-cols-2">
              <p>Credits: {cls.credits}</p>
              <p>Term: {state.terms.find((t) => t.id === cls.termId)?.name}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {cls.resources.map((resource) => (
                <span key={resource.id} className="rounded-full border border-slate-200/60 px-3 py-1 text-xs">
                  {resource.label}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Quick Edit</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  value={cls.instructor}
                  onChange={(event) => updateClass({ ...cls, instructor: event.target.value })}
                  placeholder="Instructor"
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-ink-950"
                />
                <input
                  value={cls.officeHours}
                  onChange={(event) => updateClass({ ...cls, officeHours: event.target.value })}
                  placeholder="Office Hours"
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-ink-950"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">Add Class</h3>
        <div className="mt-4 grid gap-3 text-sm">
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Class name"
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <input
            value={draft.instructor}
            onChange={(event) => setDraft({ ...draft, instructor: event.target.value })}
            placeholder="Instructor"
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <input
            value={draft.officeHours}
            onChange={(event) => setDraft({ ...draft, officeHours: event.target.value })}
            placeholder="Office hours"
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <input
            value={draft.location}
            onChange={(event) => setDraft({ ...draft, location: event.target.value })}
            placeholder="Location"
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <select
            value={draft.termId}
            onChange={(event) => setDraft({ ...draft, termId: event.target.value })}
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          >
            {state.terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setDraft({ ...draft, color })}
                className={`h-10 w-10 rounded-full border-2 ${draft.color === color ? "border-slate-900" : "border-transparent"}`}
                style={{ background: color }}
              />
            ))}
          </div>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Credit Hours</label>
          <input
            type="number"
            min={1}
            max={5}
            value={draft.credits}
            onChange={(event) => setDraft({ ...draft, credits: Number(event.target.value) })}
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="btn rounded-full bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
          >
            Save Class
          </button>
        </div>
      </section>
    </div>
  );
}
