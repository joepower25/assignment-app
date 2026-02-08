"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { WorkloadLevel } from "@/lib/types";
import { getToday } from "@/lib/utils";

type ViewMode = "weekly" | "monthly" | "yearly";

const levels: WorkloadLevel[] = ["Light", "Manageable", "Overloaded"];

const levelColors = {
  Light: "bg-emerald-400/70 dark:bg-emerald-400/60",
  Manageable: "bg-amber-400/70 dark:bg-amber-400/60",
  Overloaded: "bg-rose-500/70 dark:bg-rose-400/70",
} satisfies Record<WorkloadLevel, string>;

const levelText = {
  Light: "text-emerald-900 dark:text-emerald-100",
  Manageable: "text-amber-900 dark:text-amber-100",
  Overloaded: "text-rose-900 dark:text-rose-100",
} satisfies Record<WorkloadLevel, string>;

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

const formatDay = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: "short" });

const formatMonth = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "short" });

const formatYear = (date: Date) => date.getFullYear().toString();

export default function WorkloadHistoryPage() {
  const { state } = useAppStore();
  const [view, setView] = useState<ViewMode>("weekly");

  const pulses = useMemo(() => {
    return state.workloadPulses
      .map((pulse) => ({ ...pulse, dateObj: parseDate(pulse.date) }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [state.workloadPulses]);

  const periods = useMemo(() => {
    const today = parseDate(getToday());
    if (view === "weekly") {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        return {
          key,
          label: formatDay(date),
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
        };
      });
    }
    if (view === "monthly") {
      return Array.from({ length: 12 }).map((_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return {
          key,
          label: formatMonth(date),
          start: new Date(date.getFullYear(), date.getMonth(), 1),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
        };
      });
    }
    return Array.from({ length: 5 }).map((_, index) => {
      const year = today.getFullYear() - (4 - index);
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      return {
        key: String(year),
        label: formatYear(start),
        start,
        end,
      };
    });
  }, [view]);

  const series = useMemo(() => {
    return periods.map((period) => {
      const counts = {
        Light: 0,
        Manageable: 0,
        Overloaded: 0,
      };
      pulses.forEach((pulse) => {
        if (pulse.dateObj >= period.start && pulse.dateObj <= period.end) {
          counts[pulse.level] += 1;
        }
      });
      const total = counts.Light + counts.Manageable + counts.Overloaded;
      return { period, counts, total };
    });
  }, [periods, pulses]);

  const maxTotal = Math.max(1, ...series.map((item) => item.total));

  const overloadedPeak = useMemo(() => {
    return series.reduce(
      (acc, item) => (item.counts.Overloaded > acc.count ? { key: item.period.label, count: item.counts.Overloaded } : acc),
      { key: "—", count: 0 }
    );
  }, [series]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Workload History</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-sand-50">
              See your workload trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-sand-200">
              Track when you feel most overloaded and plan ahead.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["weekly", "monthly", "yearly"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  view === mode
                    ? "border-slate-900 bg-slate-900 text-white dark:border-sand-200 dark:bg-sand-200 dark:text-ink-900"
                    : "border-slate-200/60 bg-white text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-sand-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-sand-50">Workload Graph</h4>
          <p className="text-xs text-slate-500 dark:text-sand-200">
            Peak overloaded period: {overloadedPeak.key} ({overloadedPeak.count})
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {series.map((item) => (
            <div key={item.period.key} className="grid gap-2 md:grid-cols-[80px_1fr]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-sand-200">
                {item.period.label}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-950">
                  <div
                    className="absolute inset-y-0 left-0 flex h-full overflow-hidden rounded-full"
                    style={{ width: `${(item.total / maxTotal) * 100}%` }}
                  >
                    {levels.map((level) => (
                      <div
                        key={level}
                        className={levelColors[level]}
                        style={{
                          width: item.total ? `${(item.counts[level] / item.total) * 100}%` : "0%",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-sand-200">
                  <span>{item.total}</span>
                </div>
              </div>
            </div>
          ))}
          {series.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-sand-200">No workload data yet.</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {levels.map((level) => (
            <span key={level} className={`rounded-full border border-slate-200/60 px-3 py-1 ${levelText[level]}`}>
              {level}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-sand-50">Recent Check-ins</h4>
        <div className="mt-4 space-y-2 text-sm">
          {pulses.slice(0, 8).map((pulse) => (
            <div
              key={pulse.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200/60 px-3 py-2 text-xs dark:border-white/10"
            >
              <span className="text-slate-500 dark:text-sand-200">{pulse.date}</span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${levelText[pulse.level]}`}>
                {pulse.level}
              </span>
            </div>
          ))}
          {pulses.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-sand-200">No check-ins yet. Use the Weekly Pulse on Home.</p>
          )}
        </div>
      </section>
    </div>
  );
}
