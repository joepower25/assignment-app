"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { addDays, formatDate, getToday, sum } from "@/lib/utils";

export default function HomePage() {
  const { state } = useAppStore();
  const today = getToday();
  const [pulse, setPulse] = useState<string | null>(null);
  const [session, setSession] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        setSession(data.session?.user ? { email: data.session.user.email ?? "" } : null);
      } catch {
        setSession(null);
      }
    };
    init();
  }, []);

  const dueToday = state.assignments.filter((a) => a.dueDate === today);
  const upcomingWeek = state.assignments.filter(
    (a) => a.dueDate >= today && a.dueDate <= addDays(today, 7)
  );

  const conflicts = useMemo(() => {
    const map = new Map<string, number>();
    state.assignments.forEach((a) => {
      map.set(a.dueDate, (map.get(a.dueDate) ?? 0) + 1);
    });
    return Array.from(map.entries()).filter(([, count]) => count > 1);
  }, [state.assignments]);

  const studyMinutesThisWeek = useMemo(() => {
    return sum(
      state.assignments.flatMap((a) =>
        a.studyLogs.map((log) => log.minutes)
      )
    );
  }, [state.assignments]);

  const studyByClass = useMemo(() => {
    const map = new Map<string, number>();
    state.assignments.forEach((assignment) => {
      const minutes = sum(assignment.studyLogs.map((log) => log.minutes));
      map.set(assignment.classId, (map.get(assignment.classId) ?? 0) + minutes);
    });
    return Array.from(map.entries()).map(([classId, minutes]) => ({
      classId,
      minutes,
      name: state.classes.find((cls) => cls.id === classId)?.name ?? "Unknown",
    }));
  }, [state.assignments, state.classes]);

  const activeTerm = state.terms.find((term) => term.active);
  const termEnded = activeTerm ? activeTerm.endDate < today : false;

  return (
    <div className="space-y-6">
      {termEnded && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900 shadow-sm dark:border-amber-400/40 dark:bg-amber-900/20 dark:text-amber-100">
          Your active term ended on {formatDate(activeTerm?.endDate ?? today)}. Run the semester setup wizard to start the next term.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <Widget
          title="Due Today"
          value={`${dueToday.length} assignments`}
          description="Countdown timers keep you honest."
          accent="from-rose-500/20 to-amber-200/40"
        >
          <div className="mt-4 space-y-3 text-sm">
            {dueToday.length === 0 && (
              <p className="text-slate-500 dark:text-sand-200">No deadlines today.</p>
            )}
            {dueToday.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>{item.title}</span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white dark:bg-sand-200 dark:text-ink-900">
                  {item.dueTime} • {timeUntil(item.dueDate, item.dueTime)}
                </span>
              </div>
            ))}
          </div>
        </Widget>
        <Widget
          title="Upcoming Week"
          value={`${upcomingWeek.length} items`}
          description="Your next 7 days, condensed."
          accent="from-emerald-400/20 to-amber-200/40"
        >
          <div className="mt-4 space-y-3 text-sm">
            {upcomingWeek.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>{item.title}</span>
                <span className="text-xs text-slate-500 dark:text-sand-200">
                  {formatDate(item.dueDate)}
                </span>
              </div>
            ))}
            <Link href="/calendar" className="btn inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-sand-200">
              View Calendar
            </Link>
          </div>
        </Widget>
        <Widget
          title="Completion Streak"
          value={`${state.ui.completionStreak} days`}
          description="Gamified progress with badges."
          accent="from-indigo-500/20 to-slate-200/40"
        >
          <div className="mt-4 flex flex-wrap gap-2">
            {state.ui.badges.map((badge) => (
              <span
                key={badge.id}
                className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white dark:bg-sand-200 dark:text-ink-900"
              >
                {badge.label}
              </span>
            ))}
          </div>
        </Widget>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Widget
          title="Conflict Detector"
          value={`${conflicts.length} conflict days`}
          description="Double-booked deadlines flagged."
          accent="from-amber-400/20 to-rose-200/50"
        >
          <div className="mt-4 space-y-2 text-sm">
            {conflicts.length === 0 && (
              <p className="text-slate-500 dark:text-sand-200">No clashes this week.</p>
            )}
            {conflicts.map(([date, count]) => (
              <div key={date} className="flex items-center justify-between">
                <span>{formatDate(date)}</span>
                <span className="text-xs font-semibold">{count} due</span>
              </div>
            ))}
          </div>
        </Widget>
        <Widget
          title="Study Time"
          value={`${Math.round(studyMinutesThisWeek / 60)} hrs`}
          description="Weekly hours tracked across classes."
          accent="from-cyan-400/20 to-slate-200/40"
        >
          <div className="mt-4 space-y-2 text-sm">
            {state.assignments.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>{item.title}</span>
                <span className="text-xs text-slate-500 dark:text-sand-200">
                  {sum(item.studyLogs.map((log) => log.minutes))} min
                </span>
              </div>
            ))}
            <div className="mt-3 border-t border-slate-200/60 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-sand-200">
              {studyByClass.map((item) => (
                <div key={item.classId} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span>{Math.round(item.minutes / 60)} hrs</span>
                </div>
              ))}
            </div>
            <Link href="/assignments" className="btn inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-sand-200">
              Log Hours
            </Link>
          </div>
        </Widget>
        <Widget
          title="Quick Actions"
          value="Stay proactive"
          description="Jump into the biggest wins."
          accent="from-fuchsia-400/20 to-slate-200/40"
        >
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/classes" className="btn rounded-2xl border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200">
              Add a Class
            </Link>
            <Link href="/notes" className="btn rounded-2xl border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200">
              New Note
            </Link>
            <Link href="/grades" className="btn rounded-2xl border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200">
              Run What-if
            </Link>
          </div>
        </Widget>
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Account</p>
            <p className="text-sm text-slate-500 dark:text-sand-200">
              {session?.email ? `Signed in as ${session.email}` : "Not signed in"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!session?.email ? (
              <>
                <Link
                  href="/auth/login"
                  className="btn rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200 dark:hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-sand-200 dark:text-ink-900"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
                  const supabase = createSupabaseBrowserClient();
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200 dark:hover:bg-white/10"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Weekly Pulse</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-sand-50">
              How&apos;s your workload this week?
            </h3>
            <p className="text-xs text-slate-500 dark:text-sand-200">
              Quick check-in with well-being tips and micro-breaks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Light", "Manageable", "Overloaded"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPulse(level)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:-translate-y-0.5 hover:shadow-sm ${
                  pulse === level
                    ? "border-slate-900 bg-slate-900 text-white dark:border-sand-200 dark:bg-sand-200 dark:text-ink-900"
                    : "border-slate-200/60 bg-white text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-100">
          {pulse
            ? `Thanks for checking in. Based on "${pulse}", take a 5-minute breathing reset between study blocks.`
            : "Tip: Take a 5-minute breathing reset between study blocks. Link: a short guided meditation."}
        </div>
      </section>
    </div>
  );
}

const Widget = ({
  title,
  value,
  description,
  accent,
  children,
}: {
  title: string;
  value: string;
  description: string;
  accent: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
      <div className={`rounded-2xl bg-gradient-to-r ${accent} px-4 py-3`}>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-sand-200">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-sand-50">{value}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-sand-200">{description}</p>
      </div>
      {children}
    </div>
  );
};

const timeUntil = (date: string, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const due = new Date(date);
  due.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  const diff = due.getTime() - Date.now();
  if (diff <= 0) return "due now";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
};
