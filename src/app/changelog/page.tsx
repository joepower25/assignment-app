"use client";

import { useAppStore } from "@/lib/store";

export default function ChangelogPage() {
  const { state } = useAppStore();

  return (
    <div className="space-y-4">
      {state.changelog.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border border-slate-200/40 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-ink-900/80"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-sand-50">{item.message}</p>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.type}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-sand-200">{new Date(item.at).toLocaleString()}</p>
        </div>
      ))}
      {state.changelog.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-sand-200">No activity yet.</p>
      )}
    </div>
  );
}
