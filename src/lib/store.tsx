"use client";

import {
  AppState,
  Assignment,
  ChangelogItem,
  ClassItem,
  GradeScale,
  NoteItem,
  Term,
  UserProfile,
} from "./types";
import { uid } from "./utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AppStore = {
  state: AppState;
  setUser: (user: UserProfile) => void;
  addClass: (item: ClassItem) => void;
  updateClass: (item: ClassItem) => void;
  addAssignment: (item: Assignment) => void;
  updateAssignment: (item: Assignment) => void;
  addNote: (item: NoteItem) => void;
  updateNote: (item: NoteItem) => void;
  addChangelog: (item: ChangelogItem) => void;
  addGradeScale: (scale: GradeScale) => void;
  updateGradeScale: (scale: GradeScale) => void;
  setActiveGradeScale: (id: string) => void;
  setWeightCategories: (categories: AppState["weightCategories"]) => void;
  addTerm: (term: Term) => void;
  updateTerm: (term: Term) => void;
  addBadge: (label: string) => void;
};

const AppStoreContext = createContext<AppStore | null>(null);

const loadInitialState = (): AppState => ({
  user: { id: "", name: "", email: "" },
  classes: [],
  assignments: [],
  notes: [],
  gradeScales: [],
  activeGradeScaleId: "",
  weightCategories: [],
  terms: [],
  changelog: [],
  ui: { completionStreak: 0, badges: [] },
});

const getSupabaseUser = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return { supabase, user: data.session?.user ?? null };
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(loadInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hasEnv =
      typeof window !== "undefined" &&
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasEnv) return;

    const supabase = createSupabaseBrowserClient();

    const syncFromSupabase = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        setHydrated(true);
        return;
      }

      const [
        profileRes,
        termsRes,
        classesRes,
        assignmentsRes,
        logsRes,
        notesRes,
        gradeScalesRes,
        gradeRangesRes,
        weightCategoriesRes,
        changelogRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("terms").select("*").order("start_date", { ascending: false }),
        supabase
          .from("classes")
          .select("*, class_resources(*), syllabus_uploads(*, syllabus_items(*))")
          .order("created_at", { ascending: false }),
        supabase.from("assignments").select("*").order("due_date", { ascending: true }),
        supabase.from("study_logs").select("*"),
        supabase.from("notes").select("*").order("updated_at", { ascending: false }),
        supabase.from("grade_scales").select("*"),
        supabase.from("grade_ranges").select("*"),
        supabase.from("weight_categories").select("*"),
        supabase.from("changelog").select("*").order("at", { ascending: false }),
      ]);

      const studyLogs = logsRes.data ?? [];
      const logsByAssignment = new Map<string, typeof studyLogs>();
      studyLogs.forEach((log) => {
        const existing = logsByAssignment.get(log.assignment_id) ?? [];
        logsByAssignment.set(log.assignment_id, [...existing, log]);
      });

      const classes = (classesRes.data ?? []).map((cls) => ({
        id: cls.id,
        name: cls.name,
        color: cls.color ?? "#38bdf8",
        instructor: cls.instructor ?? "",
        officeHours: cls.office_hours ?? "",
        location: cls.location ?? "",
        credits: Number(cls.credits ?? 3),
        termId: cls.term_id ?? "",
        resources: (cls.class_resources ?? []).map((res: any) => ({
          id: res.id,
          label: res.label ?? "",
          url: res.url ?? "",
        })),
        syllabusUploads: (cls.syllabus_uploads ?? []).map((upload: any) => ({
          id: upload.id,
          fileName: upload.file_name ?? "",
          extractedItems: (upload.syllabus_items ?? []).map((item: any) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            date: item.date,
            time: item.time ?? undefined,
            ambiguous: item.ambiguous ?? false,
            notes: item.notes ?? undefined,
          })),
        })),
      }));

      const assignments = (assignmentsRes.data ?? []).map((assignment) => ({
        id: assignment.id,
        classId: assignment.class_id,
        title: assignment.title,
        description: assignment.description ?? "",
        dueDate: assignment.due_date ?? "",
        dueTime: assignment.due_time ?? "",
        category: assignment.category ?? "General",
        status: assignment.status ?? "On Track",
        priority: assignment.priority ?? "Medium",
        tags: assignment.tags ?? [],
        reminderOffsets: assignment.reminder_offsets ?? [],
        weight: Number(assignment.weight ?? 0),
        grade: assignment.grade ?? undefined,
        completed: assignment.completed ?? false,
        studyLogs: (logsByAssignment.get(assignment.id) ?? []).map((log) => ({
          id: log.id,
          minutes: log.minutes ?? 0,
          date: log.date ?? "",
        })),
        createdAt: assignment.created_at ?? "",
        updatedAt: assignment.updated_at ?? "",
      }));

      const rangesByScale = new Map<string, typeof gradeRangesRes.data>();
      (gradeRangesRes.data ?? []).forEach((range) => {
        const existing = rangesByScale.get(range.scale_id) ?? [];
        rangesByScale.set(range.scale_id, [...existing, range]);
      });

      const gradeScales = (gradeScalesRes.data ?? []).map((scale) => ({
        id: scale.id,
        name: scale.name ?? "Scale",
        ranges: (rangesByScale.get(scale.id) ?? []).map((range: any) => ({
          label: range.label,
          min: Number(range.min),
          max: Number(range.max),
        })),
      }));

      const activeScale = gradeScalesRes.data?.find((s) => s.active);

      setState((prev) => ({
        ...prev,
        user: {
          id: user.id,
          name: (profileRes.data?.name as string) ?? (user.user_metadata?.name as string) ?? "Student",
          email: user.email ?? prev.user.email,
        },
        terms:
          termsRes.data?.map((term) => ({
            id: term.id,
            name: term.name,
            startDate: term.start_date,
            endDate: term.end_date,
            active: term.active,
          })) ?? prev.terms,
        classes,
        assignments,
        notes:
          notesRes.data?.map((note) => ({
            id: note.id,
            title: note.title ?? "",
            content: note.content ?? "",
            tags: note.tags ?? [],
            createdAt: note.created_at ?? "",
            updatedAt: note.updated_at ?? "",
          })) ?? prev.notes,
        gradeScales,
        activeGradeScaleId: activeScale?.id ?? prev.activeGradeScaleId,
        weightCategories:
          weightCategoriesRes.data?.map((cat) => ({
            id: cat.id,
            label: cat.label,
            weight: Number(cat.weight ?? 0),
          })) ?? prev.weightCategories,
        changelog:
          changelogRes.data?.map((item) => ({
            id: item.id,
            type: item.type,
            message: item.message,
            at: item.at,
          })) ?? prev.changelog,
      }));
      setHydrated(true);
    };

    syncFromSupabase();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      syncFromSupabase();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const hasEnv =
      typeof window !== "undefined" &&
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!hasEnv) setHydrated(true);
  }, []);

  const withUser = async <T,>(fn: (supabase: ReturnType<typeof createSupabaseBrowserClient>, userId: string) => Promise<T>) => {
    const { supabase, user } = await getSupabaseUser();
    if (!user) return null;
    return fn(supabase, user.id);
  };

  const persistProfile = async (userId: string) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("profiles").upsert({
      id: userId,
      name: state.user.name,
      email: state.user.email,
    });
  };

  const persistClass = async (userId: string, cls: ClassItem) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("classes").upsert({
      id: cls.id,
      user_id: userId,
      term_id: cls.termId || null,
      name: cls.name,
      color: cls.color,
      instructor: cls.instructor,
      office_hours: cls.officeHours,
      location: cls.location,
      credits: cls.credits,
    });

    await supabase.from("class_resources").delete().eq("class_id", cls.id);
    if (cls.resources.length) {
      await supabase.from("class_resources").insert(
        cls.resources.map((res) => ({
          id: res.id,
          class_id: cls.id,
          label: res.label,
          url: res.url,
        }))
      );
    }

    await supabase.from("syllabus_uploads").delete().eq("class_id", cls.id);
    if (cls.syllabusUploads.length) {
      await supabase.from("syllabus_uploads").insert(
        cls.syllabusUploads.map((upload) => ({
          id: upload.id,
          class_id: cls.id,
          file_name: upload.fileName,
        }))
      );
      const items = cls.syllabusUploads.flatMap((upload) =>
        upload.extractedItems.map((item) => ({
          id: item.id,
          upload_id: upload.id,
          type: item.type,
          title: item.title,
          date: item.date,
          time: item.time ?? null,
          ambiguous: item.ambiguous ?? false,
          notes: item.notes ?? null,
        }))
      );
      if (items.length) {
        await supabase.from("syllabus_items").insert(items);
      }
    }
  };

  const persistAssignment = async (userId: string, assignment: Assignment) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("assignments").upsert({
      id: assignment.id,
      user_id: userId,
      class_id: assignment.classId,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.dueDate || null,
      due_time: assignment.dueTime || null,
      category: assignment.category,
      status: assignment.status,
      priority: assignment.priority,
      tags: assignment.tags,
      reminder_offsets: assignment.reminderOffsets,
      weight: assignment.weight,
      grade: assignment.grade ?? null,
      completed: assignment.completed,
      created_at: assignment.createdAt ? new Date(assignment.createdAt) : undefined,
      updated_at: assignment.updatedAt ? new Date(assignment.updatedAt) : undefined,
    });

    await supabase.from("study_logs").delete().eq("assignment_id", assignment.id);
    if (assignment.studyLogs.length) {
      await supabase.from("study_logs").insert(
        assignment.studyLogs.map((log) => ({
          id: log.id,
          assignment_id: assignment.id,
          minutes: log.minutes,
          date: log.date || null,
        }))
      );
    }
  };

  const persistNote = async (userId: string, note: NoteItem) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("notes").upsert({
      id: note.id,
      user_id: userId,
      title: note.title,
      content: note.content,
      tags: note.tags,
      created_at: note.createdAt ? new Date(note.createdAt) : undefined,
      updated_at: note.updatedAt ? new Date(note.updatedAt) : undefined,
    });
  };

  const persistTerm = async (userId: string, term: Term) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("terms").upsert({
      id: term.id,
      user_id: userId,
      name: term.name,
      start_date: term.startDate,
      end_date: term.endDate,
      active: term.active,
    });
  };

  const persistGradeScale = async (userId: string, scale: GradeScale, activeId: string) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("grade_scales").upsert({
      id: scale.id,
      user_id: userId,
      name: scale.name,
      active: scale.id === activeId,
    });
    await supabase.from("grade_ranges").delete().eq("scale_id", scale.id);
    if (scale.ranges.length) {
      await supabase.from("grade_ranges").insert(
        scale.ranges.map((range) => ({
          id: uid("range"),
          scale_id: scale.id,
          label: range.label,
          min: range.min,
          max: range.max,
        }))
      );
    }
  };

  const persistWeightCategories = async (userId: string, categories: AppState["weightCategories"]) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("weight_categories").delete().eq("user_id", userId);
    if (categories.length) {
      await supabase.from("weight_categories").insert(
        categories.map((cat) => ({
          id: cat.id,
          user_id: userId,
          label: cat.label,
          weight: cat.weight,
        }))
      );
    }
  };

  const setActiveGradeScaleDb = async (userId: string, activeId: string) => {
    const { supabase } = await getSupabaseUser();
    await supabase.from("grade_scales").update({ active: false }).eq("user_id", userId);
    await supabase.from("grade_scales").update({ active: true }).eq("id", activeId);
  };

  const addChangelog = (item: ChangelogItem) => {
    setState((prev) => ({ ...prev, changelog: [item, ...prev.changelog] }));
    void withUser(async (supabase, userId) => {
      await supabase.from("changelog").insert({
        id: item.id,
        user_id: userId,
        type: item.type,
        message: item.message,
        at: item.at,
      });
    });
  };

  const store = useMemo<AppStore>(
    () => ({
      state,
      setUser: (user) => {
        setState((prev) => ({ ...prev, user }));
        void withUser(async (_supabase, userId) => {
          await persistProfile(userId);
        });
      },
      addClass: (item) => {
        setState((prev) => ({ ...prev, classes: [item, ...prev.classes] }));
        addChangelog({
          id: uid("changelog"),
          type: "class",
          message: `Created ${item.name}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistClass(userId, item);
        });
      },
      updateClass: (item) => {
        setState((prev) => ({
          ...prev,
          classes: prev.classes.map((cls) => (cls.id === item.id ? item : cls)),
        }));
        addChangelog({
          id: uid("changelog"),
          type: "class",
          message: `Updated ${item.name}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistClass(userId, item);
        });
      },
      addAssignment: (item) => {
        setState((prev) => ({ ...prev, assignments: [item, ...prev.assignments] }));
        addChangelog({
          id: uid("changelog"),
          type: "assignment",
          message: `Created ${item.title}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistAssignment(userId, item);
        });
      },
      updateAssignment: (item) => {
        setState((prev) => ({
          ...prev,
          assignments: prev.assignments.map((a) => (a.id === item.id ? item : a)),
        }));
        addChangelog({
          id: uid("changelog"),
          type: "assignment",
          message: `Updated ${item.title}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistAssignment(userId, item);
        });
      },
      addNote: (item) => {
        setState((prev) => ({ ...prev, notes: [item, ...prev.notes] }));
        addChangelog({
          id: uid("changelog"),
          type: "note",
          message: `Added note: ${item.title}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistNote(userId, item);
        });
      },
      updateNote: (item) => {
        setState((prev) => ({
          ...prev,
          notes: prev.notes.map((note) => (note.id === item.id ? item : note)),
        }));
        addChangelog({
          id: uid("changelog"),
          type: "note",
          message: `Updated note: ${item.title}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistNote(userId, item);
        });
      },
      addChangelog,
      addGradeScale: (scale) => {
        setState((prev) => ({
          ...prev,
          gradeScales: [scale, ...prev.gradeScales],
        }));
        addChangelog({
          id: uid("changelog"),
          type: "grade",
          message: `Added grade scale ${scale.name}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistGradeScale(userId, scale, state.activeGradeScaleId);
        });
      },
      updateGradeScale: (scale) => {
        setState((prev) => ({
          ...prev,
          gradeScales: prev.gradeScales.map((g) => (g.id === scale.id ? scale : g)),
        }));
        addChangelog({
          id: uid("changelog"),
          type: "grade",
          message: `Updated grade scale ${scale.name}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistGradeScale(userId, scale, state.activeGradeScaleId);
        });
      },
      setActiveGradeScale: (id) => {
        setState((prev) => ({ ...prev, activeGradeScaleId: id }));
        void withUser(async (_supabase, userId) => {
          await setActiveGradeScaleDb(userId, id);
        });
      },
      setWeightCategories: (categories) => {
        setState((prev) => ({
          ...prev,
          weightCategories: categories,
        }));
        void withUser(async (_supabase, userId) => {
          await persistWeightCategories(userId, categories);
        });
      },
      addTerm: (term) => {
        setState((prev) => ({ ...prev, terms: [term, ...prev.terms] }));
        addChangelog({
          id: uid("changelog"),
          type: "term",
          message: `Added term ${term.name}`,
          at: new Date().toISOString(),
        });
        void withUser(async (_supabase, userId) => {
          await persistTerm(userId, term);
        });
      },
      updateTerm: (term) => {
        setState((prev) => ({
          ...prev,
          terms: prev.terms.map((t) => (t.id === term.id ? term : t)),
        }));
        void withUser(async (_supabase, userId) => {
          await persistTerm(userId, term);
        });
      },
      addBadge: (label) =>
        setState((prev) => ({
          ...prev,
          ui: {
            ...prev.ui,
            badges: [
              { id: uid("badge"), label, earnedAt: new Date().toISOString() },
              ...prev.ui.badges,
            ],
          },
        })),
    }),
    [state]
  );

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
};

export const useAppStore = () => {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
};
