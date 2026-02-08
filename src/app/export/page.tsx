"use client";

import { useAppStore } from "@/lib/store";

export default function ExportPage() {
  const { state } = useAppStore();

  const exportJson = () => {
    downloadFile("pulsetrack-export.json", "application/json", JSON.stringify(state, null, 2));
  };

  const exportCsv = () => {
    const header = ["Assignment", "Class", "Due Date", "Due Time", "Status", "Priority", "Grade"].join(",");
    const rows = state.assignments.map((a) => {
      const cls = state.classes.find((c) => c.id === a.classId)?.name ?? "";
      return [a.title, cls, a.dueDate, a.dueTime, a.status, a.priority, a.grade ?? ""].join(",");
    });
    downloadFile("pulsetrack-assignments.csv", "text/csv", [header, ...rows].join("\n"));
  };

  const exportIcs = () => {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PulseTrack//EN"];
    state.assignments.forEach((a) => {
      const dt = `${a.dueDate.replace(/-/g, "")}T${a.dueTime.replace(":", "")}00Z`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${a.id}@pulsetrack`,
        `DTSTAMP:${dt}`,
        `DTSTART:${dt}`,
        `SUMMARY:${a.title}`,
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    downloadFile("pulsetrack-calendar.ics", "text/calendar", lines.join("\n"));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-sand-50">One-Click Export</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">
          Export assignments, grades, notes, and classes. Data portability builds trust.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportJson}
            className="btn rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="btn rounded-full border border-slate-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-slate-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
          >
            Print to PDF
          </button>
          <button
            type="button"
            onClick={exportIcs}
            className="btn rounded-full border border-slate-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
          >
            Export Calendar (.ics)
          </button>
        </div>
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
