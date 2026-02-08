"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { NoteItem } from "@/lib/types";
import { uid } from "@/lib/utils";

export default function NotesPage() {
  const { state, addNote, updateNote, deleteNote } = useAppStore();
  const [selected, setSelected] = useState<NoteItem | null>(state.notes[0] ?? null);
  const [tagInput, setTagInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NoteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selected && state.notes.length) {
      setSelected(state.notes[0]);
      return;
    }
    if (selected && !state.notes.some((note) => note.id === selected.id)) {
      setSelected(state.notes[0] ?? null);
    }
  }, [selected, state.notes]);

  const handleSave = () => {
    if (!selected) return;
    if (state.notes.find((n) => n.id === selected.id)) {
      updateNote({ ...selected, updatedAt: new Date().toISOString() });
    } else {
      addNote({ ...selected, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
  };

  const exportMarkdown = () => {
    if (!selected) return;
    const content = `# ${selected.title}\n\n${selected.content}\n\nTags: ${selected.tags.join(", ")}`;
    downloadFile(`${selected.title}.md`, "text/markdown", content);
  };

  const exportWord = () => {
    if (!selected) return;
    const html = `<html><body><h1>${selected.title}</h1><pre>${selected.content}</pre><p>Tags: ${selected.tags.join(", ")}</p></body></html>`;
    downloadFile(`${selected.title}.doc`, "application/msword", html);
  };

  const exportPdf = () => {
    if (!selected) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<pre>${selected.title}\n\n${selected.content}</pre>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/40 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900/95">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">Delete Note</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">
              This action cannot be undone. The note will be permanently removed.
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
                  const removedId = deleteTarget.id;
                  setDeleteTarget(null);
                  deleteNote(removedId);
                  if (selected?.id === removedId) {
                    const next =
                      state.notes
                        .filter((note) => note.id !== removedId)
                        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0] ?? null;
                    setSelected(next);
                  }
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
        <button
          type="button"
          onClick={() =>
            setSelected({
              id: uid("note"),
              title: "Untitled",
              content: "",
              tags: [],
              createdAt: "",
              updatedAt: "",
            })
          }
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
        >
          New Note
        </button>
        {state.notes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => setSelected(note)}
            className={`w-full rounded-3xl border px-4 py-3 text-left ${
              selected?.id === note.id
                ? "border-slate-900 bg-slate-900 text-white dark:border-sand-200 dark:bg-sand-200 dark:text-ink-900"
                : "border-slate-200/60 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
            }`}
          >
            <p className="text-sm font-semibold">{note.title}</p>
            <p className="text-xs opacity-70">{note.tags.join(", ")}</p>
          </button>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        {!selected ? (
          <p className="text-sm text-slate-500 dark:text-sand-200">Select a note to begin.</p>
        ) : (
          <div className="space-y-4">
            <input
              value={selected.title}
              onChange={(event) => setSelected({ ...selected, title: event.target.value })}
              className="w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-lg font-semibold dark:border-white/10 dark:bg-ink-950"
            />
            <textarea
              value={selected.content}
              onChange={(event) => setSelected({ ...selected, content: event.target.value })}
              className="min-h-[260px] w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200/60 px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Add tag"
                  className="flex-1 rounded-2xl border border-slate-200/60 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-ink-950"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!tagInput.trim()) return;
                    setSelected({
                      ...selected,
                      tags: Array.from(new Set([...selected.tags, tagInput.trim()])),
                    });
                    setTagInput("");
                  }}
                  className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="btn rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
              >
                Save Note
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(selected)}
                className="btn rounded-full border border-rose-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:border-rose-200/20 dark:text-rose-200"
              >
                Delete Note
              </button>
              <button
                type="button"
                onClick={exportMarkdown}
                className="btn rounded-full border border-slate-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
              >
                Download Markdown
              </button>
              <button
                type="button"
                onClick={exportWord}
                className="btn rounded-full border border-slate-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
              >
                Download Word
              </button>
              <button
                type="button"
                onClick={exportPdf}
                className="btn rounded-full border border-slate-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
              >
                Print to PDF
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const downloadFile = (name: string, type: string, content: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};
