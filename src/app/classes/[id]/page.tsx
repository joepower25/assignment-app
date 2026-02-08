"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params?.id as string;
  const { state, updateClass, addAssignment } = useAppStore();
  const cls = state.classes.find((item) => item.id === classId);
  const [resourceLabel, setResourceLabel] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");

  if (!cls) {
    return <div className="text-sm text-slate-500">Class not found.</div>;
  }

  const handleAddResource = () => {
    if (!resourceLabel || !resourceUrl) return;
    updateClass({
      ...cls,
      resources: [...cls.resources, { id: uid("res"), label: resourceLabel, url: resourceUrl }],
    });
    setResourceLabel("");
    setResourceUrl("");
  };

  const handleSyllabusUpload = (fileName: string) => {
    const extracted = [
      {
        id: uid("extract"),
        type: "assignment" as const,
        title: "Reading Response",
        date: "2026-02-20",
        time: "23:59",
      },
      {
        id: uid("extract"),
        type: "exam" as const,
        title: "Unit Exam",
        date: "2026-03-08",
        ambiguous: true,
        notes: "Listed as TBD in syllabus",
      },
      {
        id: uid("extract"),
        type: "office-hours" as const,
        title: "Office Hours",
        date: "2026-02-13",
        time: "14:00",
      },
    ];

    updateClass({
      ...cls,
      syllabusUploads: [
        { id: uid("syllabus"), fileName, extractedItems: extracted },
        ...cls.syllabusUploads,
      ],
    });
  };

  const createAssignmentsFromExtracted = () => {
    cls.syllabusUploads.forEach((upload) => {
      upload.extractedItems
        .filter((item) => item.type === "assignment" || item.type === "exam")
        .forEach((item) => {
          addAssignment({
            id: uid("assignment"),
            classId: cls.id,
            title: item.title,
            description: `Imported from ${upload.fileName}`,
            dueDate: item.date,
            dueTime: item.time ?? "23:59",
            category: item.type === "exam" ? "Exam" : "Homework",
            status: "On Track",
            priority: "Medium",
            tags: ["Imported"],
            reminderOffsets: [2880, 1440],
            weight: item.type === "exam" ? 30 : 10,
            completed: false,
            studyLogs: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: cls.color }}>
              {cls.name}
            </span>
            <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">Instructor: {cls.instructor}</p>
            <p className="text-xs text-slate-400">Office Hours: {cls.officeHours}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={cls.instructor}
            onChange={(event) => updateClass({ ...cls, instructor: event.target.value })}
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
          />
          <input
            value={cls.officeHours}
            onChange={(event) => updateClass({ ...cls, officeHours: event.target.value })}
            className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
          <h3 className="text-lg font-semibold">Resources</h3>
          <div className="mt-4 space-y-2 text-sm">
            {cls.resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between">
                <span>{resource.label}</span>
                <span className="text-xs text-slate-400">{resource.url}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <input
              value={resourceLabel}
              onChange={(event) => setResourceLabel(event.target.value)}
              placeholder="Label"
              className="rounded-2xl border border-slate-200/60 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-ink-950"
            />
            <input
              value={resourceUrl}
              onChange={(event) => setResourceUrl(event.target.value)}
              placeholder="URL"
              className="rounded-2xl border border-slate-200/60 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-ink-950"
            />
            <button
              type="button"
              onClick={handleAddResource}
              className="btn rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-sand-200 dark:text-ink-900"
            >
              Add Resource
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
          <h3 className="text-lg font-semibold">Syllabus OCR</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-sand-200">
            Upload a PDF or image. We&apos;ll extract assignments, readings, and exam dates, flagging anything ambiguous.
          </p>
          <div className="mt-4">
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleSyllabusUpload(file.name);
              }}
              className="w-full text-xs"
            />
          </div>
          <button
            type="button"
            onClick={createAssignmentsFromExtracted}
            className="btn mt-4 w-full rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
          >
            Create Assignments from OCR
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h3 className="text-lg font-semibold">OCR Findings</h3>
        <div className="mt-4 space-y-3 text-sm">
          {cls.syllabusUploads.map((upload) => (
            <div key={upload.id} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-white/10 dark:bg-ink-950">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{upload.fileName}</p>
              <div className="mt-3 space-y-2">
                {upload.extractedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-sand-50">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-sand-200">
                        {item.type} • {item.date} {item.time ?? ""}
                      </p>
                    </div>
                    {item.ambiguous && (
                      <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">
                        Needs Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {cls.syllabusUploads.length === 0 && (
            <p className="text-slate-500 dark:text-sand-200">No syllabus uploads yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h3 className="text-lg font-semibold">Community Tips</h3>
        <p className="mt-2 text-xs text-slate-400">
          Moderated tips curated by students in this major. (Mocked UI)
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 dark:border-white/10 dark:bg-ink-950">
            Attend office hours before lab report due dates — professors drop key hints.
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 dark:border-white/10 dark:bg-ink-950">
            Build a shared glossary with classmates for midterm review.
          </div>
        </div>
      </section>
    </div>
  );
}
