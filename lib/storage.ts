import { Day, DAY_ORDER, DayPlan, UserProfile, WorkoutSession } from "./types";
import { defaultWeeklyPlan, EXERCISE_IMAGES } from "./seed";

const KEYS = {
  plan: "apex:plan",
  history: "apex:history",
  active: "apex:active",
  profile: "apex:profile",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, app still works this session
  }
}

// ---------- Plan ----------
export function getPlan(): Record<Day, DayPlan> {
  return read(KEYS.plan, defaultWeeklyPlan());
}

export function savePlan(plan: Record<Day, DayPlan>) {
  write(KEYS.plan, plan);
}

export function ensurePlanSeeded(): Record<Day, DayPlan> {
  const existing = read<Record<Day, DayPlan> | null>(KEYS.plan, null as unknown as Record<Day, DayPlan>);
  if (existing) {
    let changed = false;
    const migrated = Object.fromEntries(DAY_ORDER.map((day) => {
      const dayPlan = existing[day];
      const exercises = (dayPlan?.exercises ?? []).map((exercise) => {
        if (exercise.imageUrl || !EXERCISE_IMAGES[exercise.name]) return exercise;
        changed = true;
        return { ...exercise, imageUrl: EXERCISE_IMAGES[exercise.name] };
      });
      return [day, { ...dayPlan, exercises }];
    })) as Record<Day, DayPlan>;
    if (changed) write(KEYS.plan, migrated);
    return migrated;
  }
  const seeded = defaultWeeklyPlan();
  write(KEYS.plan, seeded);
  return seeded;
}

// ---------- History ----------
export function getHistory(): WorkoutSession[] {
  return read<WorkoutSession[]>(KEYS.history, []);
}

export function addToHistory(session: WorkoutSession) {
  const history = getHistory();
  write(KEYS.history, [session, ...history]);
}

export function getLastCompletedSessionForDay(day: Day): WorkoutSession | null {
  const history = getHistory();
  return history.find((s) => s.day === day && s.completedAt) ?? null;
}

export function getPreviousSessionBeforeCurrent(day: Day, excludeId?: string): WorkoutSession | null {
  const history = getHistory();
  return history.find((s) => s.day === day && s.completedAt && s.id !== excludeId) ?? null;
}

export function updateHistoryEntry(id: string, patch: Partial<WorkoutSession>) {
  const history = getHistory();
  const next = history.map((s) => (s.id === id ? { ...s, ...patch } : s));
  write(KEYS.history, next);
}

// ---------- Active session ----------
export function getActiveSession(): WorkoutSession | null {
  return read<WorkoutSession | null>(KEYS.active, null);
}

export function saveActiveSession(session: WorkoutSession | null) {
  write(KEYS.active, session);
}

export function clearActiveSession() {
  write(KEYS.active, null);
}

// ---------- Profile / auth (local-only, no real backend) ----------
export function getProfile(): UserProfile | null {
  return read<UserProfile | null>(KEYS.profile, null);
}

export function saveProfile(profile: UserProfile) {
  write(KEYS.profile, profile);
}

export function logout() {
  write(KEYS.profile, null);
}

// ---------- Derived stats ----------
export function todayIndex(): number {
  // JS getDay(): 0=Sun..6=Sat. We want Mon-first index 0..6.
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export function todayDay(): Day {
  return DAY_ORDER[todayIndex()];
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function completedSessionsStartedOn(date: Date): WorkoutSession[] {
  return getHistory().filter((session) => {
    if (!session.completedAt) return false;
    const startedAt = new Date(session.date);
    return !Number.isNaN(startedAt.getTime()) && sameCalendarDay(startedAt, date);
  });
}

export function hasCompletedWorkoutOnDate(date: Date): boolean {
  return completedSessionsStartedOn(date).length > 0;
}

export function getWorkoutDayForDate(
  plan: Record<Day, DayPlan>,
  date: Date = new Date()
): Day | null {
  const weekStart = startOfWeek(date);
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayIndex = (date.getDay() + 6) % 7;
  const workouts = DAY_ORDER.filter((day) => !plan[day].isRest);
  const completedDaysBeforeDate = new Set(getHistory().filter((session) => {
    if (!session.completedAt) return false;
    const startedAt = new Date(session.date);
    return (
      !Number.isNaN(startedAt.getTime()) &&
      startedAt >= weekStart &&
      startedAt < dayStart
    );
  }).map((session) => session.day));

  return workouts
    .filter((day) => DAY_ORDER.indexOf(day) <= dayIndex && !completedDaysBeforeDate.has(day))
    .at(0) ?? null;
}

export function computeStreak(): number {
  const history = getHistory()
    .filter((s) => s.completedAt)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  if (history.length === 0) return 0;

  const dayMs = 86400000;
  const daysWithWorkout = new Set(
    history.map((s) => Math.floor((s.completedAt ?? 0) / dayMs))
  );
  const todayKey = Math.floor(Date.now() / dayMs);

  let streak = 0;
  let cursor = todayKey;
  // allow today to be "not yet trained" without breaking the streak
  if (!daysWithWorkout.has(cursor)) cursor -= 1;
  while (daysWithWorkout.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

export function computeThisWeekStats() {
  const history = getHistory().filter((s) => s.completedAt);
  const now = new Date();
  const startOfWeek = new Date(now);
  const jsDay = now.getDay();
  const diffToMonday = jsDay === 0 ? 6 : jsDay - 1;
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - diffToMonday);

  const thisWeek = history.filter((s) => (s.completedAt ?? 0) >= startOfWeek.getTime());
  return {
    workouts: thisWeek.length,
    volume: thisWeek.reduce((sum, s) => sum + s.totalVolume, 0),
    sets: thisWeek.reduce((sum, s) => sum + s.totalSets, 0),
  };
}

export function computeTotals() {
  const history = getHistory().filter((s) => s.completedAt);
  return {
    totalVolume: history.reduce((sum, s) => sum + s.totalVolume, 0),
    totalSets: history.reduce((sum, s) => sum + s.totalSets, 0),
  };
}

export function recentVolumeSeries(count = 8): number[] {
  const history = getHistory()
    .filter((s) => s.completedAt)
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));
  return history.slice(-count).map((s) => s.totalVolume);
}

export function dayStatus(day: Day, today: Day): "done" | "current" | "upcoming" | "rest" {
  const plan = getPlan();
  const now = new Date();
  const weekStart = startOfWeek(now);
  const dayDate = new Date(weekStart);
  dayDate.setDate(weekStart.getDate() + DAY_ORDER.indexOf(day));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + DAY_ORDER.length);
  const completedForScheduledDay = getHistory().some((session) => {
    if (!session.completedAt || session.day !== day) return false;
    const startedAt = new Date(session.date);
    return (
      !Number.isNaN(startedAt.getTime()) &&
      startedAt >= weekStart &&
      startedAt < weekEnd
    );
  });

  if (hasCompletedWorkoutOnDate(dayDate) || completedForScheduledDay) return "done";
  if (!getWorkoutDayForDate(plan, dayDate)) return "rest";
  return day === today ? "current" : "upcoming";
}
