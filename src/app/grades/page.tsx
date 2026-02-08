"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { GradeScale } from "@/lib/types";
import { average, clamp, sum, uid } from "@/lib/utils";

const presetScales: GradeScale[] = [
  {
    id: "scale-standard",
    name: "Standard A-F",
    ranges: [
      { label: "A", min: 90, max: 100 },
      { label: "B", min: 80, max: 89 },
      { label: "C", min: 70, max: 79 },
      { label: "D", min: 60, max: 69 },
      { label: "F", min: 0, max: 59 },
    ],
  },
  {
    id: "scale-plus",
    name: "Plus/Minus",
    ranges: [
      { label: "A", min: 93, max: 100 },
      { label: "A-", min: 90, max: 92 },
      { label: "B+", min: 87, max: 89 },
      { label: "B", min: 83, max: 86 },
      { label: "B-", min: 80, max: 82 },
      { label: "C+", min: 77, max: 79 },
      { label: "C", min: 73, max: 76 },
      { label: "C-", min: 70, max: 72 },
      { label: "D", min: 60, max: 69 },
      { label: "F", min: 0, max: 59 },
    ],
  },
];

export default function GradesPage() {
  const { state, addGradeScale, updateGradeScale, setActiveGradeScale, updateAssignment } = useAppStore();
  const [whatIfScore, setWhatIfScore] = useState(85);
  const [targetGpa, setTargetGpa] = useState(3.5);

  const activeScale = state.gradeScales.find((scale) => scale.id === state.activeGradeScaleId);

  const classGrades = useMemo(() => {
    return state.classes.map((cls) => {
      const assignments = state.assignments.filter((a) => a.classId === cls.id);
      const weightedScores = assignments.map((a) => ({
        score: a.grade ?? 0,
        weight: a.weight,
      }));
      const totalWeight = sum(weightedScores.map((w) => w.weight)) || 1;
      const weightedAverage =
        sum(weightedScores.map((w) => (w.score * w.weight) / totalWeight)) || 0;
      return { cls, assignments, weightedAverage };
    });
  }, [state.assignments, state.classes]);

  const overallGpa = useMemo(() => {
    const totalCredits = sum(state.classes.map((cls) => cls.credits || 0)) || 1;
    const totalPoints = sum(
      classGrades.map((grade) => {
        const gpa = grade.weightedAverage >= 90 ? 4 : grade.weightedAverage >= 80 ? 3 : grade.weightedAverage >= 70 ? 2 : grade.weightedAverage >= 60 ? 1 : 0;
        return gpa * (grade.cls.credits || 0);
      })
    );
    return Math.round((totalPoints / totalCredits) * 100) / 100;
  }, [classGrades, state.classes]);

  const whatIfResult = useMemo(() => {
    const allGrades = state.assignments.map((a) => a.grade ?? 0);
    const simulated = average([...allGrades, clamp(whatIfScore, 0, 100)]);
    return Math.round(simulated * 10) / 10;
  }, [state.assignments, whatIfScore]);

  const applyPreset = (scale: GradeScale) => {
    const next = { ...scale, id: uid("scale") };
    addGradeScale(next);
    setActiveGradeScale(next.id);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Overall GPA</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-sand-50">{overallGpa}</h3>
            <p className="text-xs text-slate-500 dark:text-sand-200">Target: {targetGpa}</p>
          </div>
          <div className="w-full max-w-xs">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Progress</p>
            <div className="mt-2 h-3 w-full rounded-full bg-slate-100 dark:bg-ink-950">
              <div
                className="h-3 rounded-full bg-emerald-500"
                style={{ width: `${Math.min((overallGpa / targetGpa) * 100, 100)}%` }}
              />
            </div>
            <input
              type="number"
              step="0.1"
              value={targetGpa}
              onChange={(event) => setTargetGpa(Number(event.target.value))}
              className="mt-3 w-full rounded-2xl border border-slate-200/60 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-ink-950"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {classGrades.map((grade) => (
            <div key={grade.cls.id} className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-sand-50">{grade.cls.name}</p>
                  <p className="text-xs text-slate-400">Credits: {grade.cls.credits}</p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: grade.cls.color }}
                >
                  {Math.round(grade.weightedAverage)}%
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {grade.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between">
                    <span>{assignment.title}</span>
                    <input
                      type="number"
                      value={assignment.grade ?? ""}
                      onChange={(event) =>
                        updateAssignment({
                          ...assignment,
                          grade: Number(event.target.value),
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className="w-20 rounded-xl border border-slate-200/60 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-ink-950"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
            <h4 className="text-lg font-semibold">What-if Simulator</h4>
            <p className="text-xs text-slate-400">If I score...</p>
            <input
              type="number"
              value={whatIfScore}
              onChange={(event) => setWhatIfScore(Number(event.target.value))}
              className="mt-3 w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
            />
            <p className="mt-4 text-sm text-slate-500 dark:text-sand-200">
              Simulated overall grade: <span className="font-semibold text-slate-900 dark:text-sand-50">{whatIfResult}%</span>
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
            <h4 className="text-lg font-semibold">Grade Scale</h4>
            <select
              value={activeScale?.id}
              onChange={(event) => setActiveGradeScale(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
            >
              {state.gradeScales.map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.name}
                </option>
              ))}
            </select>
            <div className="mt-4 space-y-2 text-sm">
              {activeScale?.ranges.map((range, idx) => (
                <div key={`${range.label}-${idx}`} className="flex items-center justify-between">
                  <span>{range.label}</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={range.min}
                      onChange={(event) => {
                        if (!activeScale) return;
                        const updated = {
                          ...activeScale,
                          ranges: activeScale.ranges.map((item, rIdx) =>
                            rIdx === idx ? { ...item, min: Number(event.target.value) } : item
                          ),
                        };
                        updateGradeScale(updated);
                      }}
                      className="w-16 rounded-xl border border-slate-200/60 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-ink-950"
                    />
                    <input
                      type="number"
                      value={range.max}
                      onChange={(event) => {
                        if (!activeScale) return;
                        const updated = {
                          ...activeScale,
                          ranges: activeScale.ranges.map((item, rIdx) =>
                            rIdx === idx ? { ...item, max: Number(event.target.value) } : item
                          ),
                        };
                        updateGradeScale(updated);
                      }}
                      className="w-16 rounded-xl border border-slate-200/60 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-ink-950"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {presetScales.map((scale) => (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => applyPreset(scale)}
                  className="rounded-full border border-slate-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
                >
                  Import {scale.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
