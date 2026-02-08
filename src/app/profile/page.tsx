"use client";

import { useAppStore } from "@/lib/store";

export default function ProfilePage() {
  const { state } = useAppStore();

  const totalAssignments = state.assignments.length;
  const completedAssignments = state.assignments.filter((a) => a.completed).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-sand-50">{state.user.name}</h3>
        <p className="text-sm text-slate-500 dark:text-sand-200">{state.user.email}</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <Stat title="Total Assignments" value={totalAssignments} />
        <Stat title="Completed" value={completedAssignments} />
        <Stat title="Active Classes" value={state.classes.length} />
      </section>
    </div>
  );
}

const Stat = ({ title, value }: { title: string; value: number }) => (
  <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 text-center shadow-sm dark:border-white/10 dark:bg-ink-900/80">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-sand-50">{value}</p>
  </div>
);
