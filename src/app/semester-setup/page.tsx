"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";

const majors = {
  "State University": ["Biology 210", "Chemistry 101", "Psychology 101", "Calculus I"],
  "City College": ["English Composition", "Microeconomics", "Sociology", "Intro to CS"],
  "Tech Institute": ["Data Structures", "Operating Systems", "Linear Algebra", "UX Research"],
  "Private University": ["Art History", "Philosophy", "Statistics", "Molecular Biology"],
};

export default function SemesterSetupPage() {
  const { addTerm, addClass, setWeightCategories, state } = useAppStore();
  const [step, setStep] = useState(1);
  const [school, setSchool] = useState(Object.keys(majors)[0]);
  const [termName, setTermName] = useState("Fall 2026");
  const [startDate, setStartDate] = useState("2026-08-24");
  const [endDate, setEndDate] = useState("2026-12-18");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [weighting, setWeighting] = useState(state.weightCategories);
  const [customClass, setCustomClass] = useState("");
  const [customCatalog, setCustomCatalog] = useState<string[]>([]);

  const availableClasses = [
    ...(majors[school as keyof typeof majors] ?? []),
    ...customCatalog,
  ];

  const handleFinish = () => {
    const termId = uid("term");
    addTerm({ id: termId, name: termName, startDate, endDate, active: true });
    setWeightCategories(weighting);
    selectedClasses.forEach((course, index) => {
      addClass({
        id: uid("class"),
        name: course,
        color: ["#38bdf8", "#f59e0b", "#a78bfa", "#22c55e"][index % 4],
        instructor: "",
        officeHours: "",
        location: "",
        credits: 3,
        termId,
        resources: [],
        syllabusUploads: [],
      });
    });
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-sand-50">Semester Setup Wizard</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">
          Bulk-add classes, define your term length, and lock in grade weighting rules.
        </p>
      </section>

      {step === 1 && (
        <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
          <h3 className="text-lg font-semibold">Step 1: Choose school/major</h3>
          <select
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-950"
          >
            {Object.keys(majors).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
            <h3 className="text-lg font-semibold">Step 2: Term length</h3>
            <div className="mt-4 grid gap-3">
              <input
                value={termName}
                onChange={(event) => setTermName(event.target.value)}
                className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
                />
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-ink-950 dark:text-sand-200">
                Active term will be updated. You&apos;ll be prompted to run this wizard again when the term ends.
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
            <h3 className="text-lg font-semibold">Step 3: Pick classes</h3>
            <div className="mt-4 space-y-2 text-sm">
              {availableClasses.map((course) => (
                <label key={course} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(course)}
                    onChange={() =>
                      setSelectedClasses((prev) =>
                        prev.includes(course)
                          ? prev.filter((c) => c !== course)
                          : [...prev, course]
                      )
                    }
                  />
                  {course}
                </label>
              ))}
              <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-3 text-xs dark:border-white/10 dark:bg-ink-950">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Manual Add</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={customClass}
                    onChange={(event) => setCustomClass(event.target.value)}
                    placeholder="Custom class name"
                    className="flex-1 rounded-2xl border border-slate-200/60 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-ink-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const value = customClass.trim();
                      if (!value) return;
                      setCustomCatalog((prev) => (prev.includes(value) ? prev : [...prev, value]));
                      setSelectedClasses((prev) => (prev.includes(value) ? prev : [...prev, value]));
                      setCustomClass("");
                    }}
                    className="rounded-full border border-slate-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:text-sand-200 dark:hover:bg-white/10"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFinish}
              className="btn mt-4 w-full rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
            >
              Finish Setup
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-3xl border border-slate-200/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
          <h3 className="text-lg font-semibold">Assignment Weighting</h3>
          <p className="mt-2 text-xs text-slate-400">Customize weight categories used when creating assignments.</p>
          <div className="mt-4 space-y-2 text-sm">
            {weighting.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <input
                  value={item.label}
                  onChange={(event) =>
                    setWeighting((prev) =>
                      prev.map((cat, catIdx) => (catIdx === idx ? { ...cat, label: event.target.value } : cat))
                    )
                  }
                  className="flex-1 rounded-2xl border border-slate-200/60 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-ink-950"
                />
                <input
                  type="number"
                  value={item.weight}
                  onChange={(event) =>
                    setWeighting((prev) =>
                      prev.map((cat, catIdx) => (catIdx === idx ? { ...cat, weight: Number(event.target.value) } : cat))
                    )
                  }
                  className="w-20 rounded-2xl border border-slate-200/60 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-ink-950"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setWeighting((prev) => [...prev, { id: uid("cat"), label: "New Category", weight: 5 }])}
              className="rounded-full border border-slate-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:text-sand-200"
            >
              Add Category
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-100">
          Setup complete. Added {selectedClasses.length} classes to {termName}. Active term: {state.terms[0]?.name}.
        </section>
      )}
    </div>
  );
}
