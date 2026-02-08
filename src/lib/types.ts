export type StatusTag = "Urgent" | "In Progress" | "Blocked" | "On Track" | "Completed";
export type Priority = "Low" | "Medium" | "High";
export type WorkloadLevel = "Light" | "Manageable" | "Overloaded";

export type GradeRange = {
  label: string;
  min: number;
  max: number;
};

export type GradeScale = {
  id: string;
  name: string;
  ranges: GradeRange[];
};

export type StudyLog = {
  id: string;
  minutes: number;
  date: string;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Assignment = {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  category: string;
  status: StatusTag;
  priority: Priority;
  tags: string[];
  reminderOffsets: number[];
  weight: number;
  grade?: number;
  completed: boolean;
  subtasks: Subtask[];
  studyLogs: StudyLog[];
  createdAt: string;
  updatedAt: string;
};

export type ResourceLink = {
  id: string;
  label: string;
  url: string;
};

export type ExtractedItem = {
  id: string;
  type: "assignment" | "reading" | "exam" | "office-hours";
  title: string;
  date: string;
  time?: string;
  ambiguous?: boolean;
  notes?: string;
};

export type SyllabusUpload = {
  id: string;
  fileName: string;
  extractedItems: ExtractedItem[];
};

export type ClassItem = {
  id: string;
  name: string;
  color: string;
  instructor: string;
  officeHours: string;
  location: string;
  credits: number;
  termId: string;
  resources: ResourceLink[];
  syllabusUploads: SyllabusUpload[];
};

export type NoteItem = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Term = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

export type ChangelogItem = {
  id: string;
  type: "class" | "assignment" | "note" | "grade" | "term" | "system";
  message: string;
  at: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export type Badge = {
  id: string;
  label: string;
  earnedAt: string;
};

export type WeightCategory = {
  id: string;
  label: string;
  weight: number;
};

export type WorkloadPulse = {
  id: string;
  level: WorkloadLevel;
  date: string;
  createdAt: string;
};

export type AppState = {
  user: UserProfile;
  classes: ClassItem[];
  assignments: Assignment[];
  notes: NoteItem[];
  gradeScales: GradeScale[];
  activeGradeScaleId: string;
  weightCategories: WeightCategory[];
  terms: Term[];
  changelog: ChangelogItem[];
  workloadPulses: WorkloadPulse[];
  ui: {
    completionStreak: number;
    badges: Badge[];
  };
};
