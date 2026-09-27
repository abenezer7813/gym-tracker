"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ensurePlanSeeded,
  getActiveSession,
  getLastCompletedSessionForDay,
  getWorkoutDayForDate,
  hasCompletedWorkoutOnDate,
  saveActiveSession,
  todayDay,
} from "@/lib/storage";
import { DAY_LABEL, DAY_ORDER, Day, DayPlan, SessionExercise, WorkoutSession } from "@/lib/types";

export default function TodayWorkoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Record<Day, DayPlan> | null>(null);
  const [today, setToday] = useState<Day>("mon");
  const [workoutDay, setWorkoutDay] = useState<Day | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day>("mon");
  const [hasActive, setHasActive] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    const p = ensurePlanSeeded();
    const t = todayDay();
    const now = new Date();
    setPlan(p);
    setToday(t);
    const active = getActiveSession();
    setHasActive(!!active);
    const completed = hasCompletedWorkoutOnDate(now);
    const nextWorkoutDay = active?.day ?? (completed ? null : getWorkoutDayForDate(p, now));
    setWorkoutDay(nextWorkoutDay);
    setSelectedDay(nextWorkoutDay ?? t);
    setCompletedToday(completed);
  }, []);

  if (!plan) return null;

  const day = plan[selectedDay];

  function startWorkout() {
    if (hasActive) {
      router.push("/workout/active");
      return;
    }
    if (!plan || !workoutDay || selectedDay !== workoutDay) return;
    const previousSession = getLastCompletedSessionForDay(workoutDay);
    const exercises: SessionExercise[] = day.exercises.map((pe) => {
      const prevExercise = previousSession?.exercises.find((e) => e.name === pe.name);
      return {
        exerciseId: pe.id,
        name: pe.name,
        muscle: pe.muscle,
        targetSets: pe.targetSets,
        sets: Array.from({ length: pe.targetSets }, (_, i) => ({
          n: i + 1,
          weight: null,
          reps: null,
          done: false,
        })),
        previous: prevExercise?.sets.map((s) => ({ weight: s.weight ?? 0, reps: s.reps ?? 0 })),
      };
    });

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      day: workoutDay,
      title: day.title,
      date: new Date().toISOString(),
      startedAt: Date.now(),
      completedAt: null,
      exercises,
      currentExerciseIndex: 0,
      feeling: null,
      notes: "",
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      durationSec: 0,
    };
    saveActiveSession(session);
    router.push("/workout/active");
  }

  const dayPicker = (
    <div className="flex gap-1.5">
      {DAY_ORDER.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => setSelectedDay(d)}
          aria-pressed={selectedDay === d}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 text-[10px] font-bold"
          style={{
            borderColor: selectedDay === d ? "var(--accent)" : "var(--border)",
            background: selectedDay === d ? "var(--accent-soft)" : "var(--surface)",
            color: selectedDay === d ? "var(--accent)" : "var(--text-dim)",
          }}
        >
          <span>{DAY_LABEL[d].slice(0, 3).toUpperCase()}</span>
          {d === today && <span className="text-[8px]">TODAY</span>}
        </button>
      ))}
    </div>
  );

  if (day.isRest) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-7">
        <div className="font-display text-xl font-bold">Workout Schedule</div>
        <p className="-mt-3 text-xs text-text-dim">
          Select any day to preview its workout.
        </p>
        {dayPicker}
        <div className="flex flex-col items-center gap-4 pt-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-3 text-text-dim">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
          </div>
          <div className="font-display text-xl font-bold">
            {day.isOptional ? "Optional Cardio Day" : "Rest Day"}
          </div>
          <p className="max-w-[26ch] text-sm text-text-dim">
            {selectedDay === today && completedToday
              ? "You have completed today's workout. Select another day above to preview its workout."
              : "Nothing scheduled today. Select another day above to preview its workout."}
          </p>
          {hasActive && (
            <button onClick={startWorkout} className="btn-primary w-full">
              Continue Workout
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-7">
      <div className="font-display text-xl font-bold">Workout Schedule</div>
      <p className="-mt-3 text-xs text-text-dim">
        Select any day to preview its workout.
      </p>
      {dayPicker}
      <div className="text-xs font-bold tracking-wide text-accent">
        {DAY_LABEL[selectedDay].toUpperCase()}
      </div>
      <div className="font-display text-2xl font-bold -mt-3">{day.title}</div>
      {selectedDay === workoutDay && workoutDay !== today && (
        <p className="-mt-4 text-xs text-text-dim">
          Moved from {workoutDay ? DAY_LABEL[workoutDay] : ""}
        </p>
      )}
      {selectedDay !== workoutDay && (
        <p className="-mt-4 text-xs text-text-dim">
          Preview only — selecting a day here won&apos;t change your schedule.
        </p>
      )}

      <div className="flex gap-3">
        <div className="card flex-1 p-3.5 text-center">
          <div className="font-display text-lg font-bold">{day.estMinutes} min</div>
          <div className="text-[11px] text-text-dim">Est. duration</div>
        </div>
        <div className="card flex-1 p-3.5 text-center">
          <div className="font-display text-lg font-bold">{day.exercises.length}</div>
          <div className="text-[11px] text-text-dim">Exercises</div>
        </div>
        <div className="card flex-1 p-3.5 text-center">
          <div className="font-display text-lg font-bold">
            {day.exercises.reduce((n, e) => n + e.targetSets, 0)}
          </div>
          <div className="text-[11px] text-text-dim">Sets</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {day.exercises.map((e, i) => (
          <div key={e.id} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-3 text-xs font-bold text-text-dim">
                {i + 1}
              </div>
              <div>
                <div className="text-sm font-bold">{e.name}</div>
                <div className="text-xs text-text-dim">{e.muscle}</div>
              </div>
            </div>
            <div className="text-xs font-semibold text-text-dim">{e.targetSets} sets</div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-24 flex flex-col gap-2.5 pt-2">
        {hasActive ? (
          <button onClick={startWorkout} className="btn-primary">
            Continue Workout
          </button>
        ) : selectedDay === workoutDay ? (
          <button onClick={startWorkout} className="btn-primary">
            Start Workout
          </button>
        ) : (
          <div className="rounded-xl bg-surface-2 p-3 text-center text-xs text-text-dim">
            This is a preview. Your scheduled workout stays unchanged.
          </div>
        )}
      </div>
    </div>
  );
}
