export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_ORDER: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_LABEL: Record<Day, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export interface PlanExercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  targetSets: number;
  targetReps: number;
  imageUrl?: string;
}

export interface DayPlan {
  day: Day;
  title: string; // e.g. "Legs + Biceps" or "Rest"
  isRest: boolean;
  isOptional?: boolean; // e.g. Saturday optional cardio
  exercises: PlanExercise[];
  estMinutes: number;
}

export interface SetEntry {
  n: number;
  weight: number | null;
  reps: number | null;
  done: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  muscle: string;
  targetSets: number;
  targetReps?: number;
  imageUrl?: string;
  sets: SetEntry[];
  previous?: { weight: number; reps: number }[];
}

export interface WorkoutSession {
  id: string;
  day: Day;
  title: string;
  date: string; // ISO date started
  startedAt: number;
  completedAt: number | null;
  exercises: SessionExercise[];
  currentExerciseIndex: number;
  feeling: number | null; // 1-5
  notes: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  durationSec: number;
}

export interface UserProfile {
  name: string;
  email: string;
  loggedInAt: number;
}
