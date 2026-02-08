"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { sum } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/assignments", label: "Assignments" },
  { href: "/completed-assignments", label: "Completed" },
  { href: "/classes", label: "Classes" },
  { href: "/grades", label: "Grades" },
  { href: "/notes", label: "Notes" },
  { href: "/search", label: "Search" },
  { href: "/export", label: "Export" },
  { href: "/changelog", label: "Changelog" },
  { href: "/profile", label: "Profile" },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { state } = useAppStore();
  const isAuth = pathname.startsWith("/auth");
  const isSetup = pathname.startsWith("/semester-setup");

  const active = useMemo(() => navItems.find((item) => pathname === item.href), [pathname]);
  const streak = useMemo(() => {
    const completions = state.assignments
      .filter((a) => a.completed)
      .map((a) => (a.updatedAt ? a.updatedAt.slice(0, 10) : a.dueDate))
      .filter(Boolean)
      .sort()
      .reverse();
    if (completions.length === 0) return 0;
    let count = 0;
    let cursor = new Date().toISOString().slice(0, 10);
    const completedSet = new Set(completions);
    while (completedSet.has(cursor)) {
      count += 1;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    }
    return count;
  }, [state.assignments]);

  if (isAuth) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-8 lg:flex-row">
        <aside className="flex w-full flex-col gap-6 rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-ink-900/70 lg:w-64">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">PulseTrack</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-sand-50">
              {state.user.name}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-sand-300">{state.user.email}</p>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`btn rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-slate-900 text-white dark:bg-sand-200 dark:text-ink-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-sand-200 dark:hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="rounded-2xl bg-slate-900 px-4 py-4 text-sm text-white shadow-lg dark:bg-sand-200 dark:text-ink-900">
            <p className="text-xs uppercase tracking-[0.3em]">Streak</p>
            <p className="mt-2 text-2xl font-semibold">{streak} days</p>
            <p className="mt-1 text-xs">Keep the momentum. Complete 1 task today.</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/40 bg-white/80 px-6 py-4 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{active?.label ?? "Workspace"}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-sand-50">
                {active?.label ?? "PulseTrack"}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isSetup && (
                <Link
                  href="/semester-setup"
                  className="btn rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                >
                  Semester Setup
                </Link>
              )}
              <Link
                href="/assignments"
                className="btn rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:-translate-y-0.5 dark:bg-sand-200 dark:text-ink-900"
              >
                New Assignment
              </Link>
            </div>
          </header>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
