"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  addToHistory,
  clearActiveSession,
  getActiveSession,
  saveActiveSession,
} from "@/lib/storage";
import { SetEntry, WorkoutSession } from "@/lib/types";
import ExerciseImage from "@/components/ExerciseImage";

const REST_PRESETS = [30, 60, 90, 120, 180];

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.max(0, totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const [restOpen, setRestOpen] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [restLeft, setRestLeft] = useState(60);
  const [restPaused, setRestPaused] = useState(false);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const active = getActiveSession();
    if (!active) {
      router.replace("/workout");
      return;
    }
    setSession(active);
    setExerciseIdx(active.currentExerciseIndex ?? 0);
  }, [router]);

  useEffect(() => {
    if (!session) return;
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - session.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [session]);

  useEffect(() => {
    if (!restOpen || restPaused) return;
    restRef.current = setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          if (restRef.current) clearInterval(restRef.current);
          setRestOpen(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, [restOpen, restPaused]);

  const persist = useCallback((next: WorkoutSession) => {
    setSession(next);
    saveActiveSession(next);
  }, []);

  if (!session) return null;

  const exercise = session.exercises[exerciseIdx];
  const exProgress = session.exercises.filter((e) => e.sets.length > 0 && e.sets.every((s) => s.done)).length;

  function updateSet(i: number, patch: Partial<SetEntry>) {
    const next = { ...session! };
    const sets = [...exercise.sets];
    sets[i] = { ...sets[i], ...patch };
    next.exercises = next.exercises.map((e, idx) => (idx === exerciseIdx ? { ...e, sets } : e));
    persist(next);
  }

  function toggleDone(i: number) {
    const set = exercise.sets[i];
    const willBeDone = !set.done;
    updateSet(i, { done: willBeDone });
    if (willBeDone) {
      setRestDuration(60);
      setRestLeft(60);
      setRestPaused(false);
      setRestOpen(true);
    }
  }

  function addSet() {
    const next = { ...session! };
    const sets = [...exercise.sets, { n: exercise.sets.length + 1, weight: null, reps: null, done: false }];
    next.exercises = next.exercises.map((e, idx) => (idx === exerciseIdx ? { ...e, sets } : e));
    persist(next);
  }

  function removeSet() {
    if (exercise.sets.length <= 1) return;
    const next = { ...session! };
    const sets = exercise.sets.slice(0, -1);
    next.exercises = next.exercises.map((e, idx) => (idx === exerciseIdx ? { ...e, sets } : e));
    persist(next);
  }

  function goToExercise(idx: number) {
    const next = { ...session!, currentExerciseIndex: idx };
    setExerciseIdx(idx);
    persist(next);
  }

  function finishWorkout() {
    const s = session!;
    const totalVolume = s.exercises.reduce(
      (sum, e) => sum + e.sets.reduce((s2, set) => s2 + (set.done ? (set.weight ?? 0) * (set.reps ?? 0) : 0), 0),
      0
    );
    const totalSets = s.exercises.reduce((n, e) => n + e.sets.filter((set) => set.done).length, 0);
    const totalReps = s.exercises.reduce(
      (n, e) => n + e.sets.reduce((s2, set) => s2 + (set.done ? set.reps ?? 0 : 0), 0),
      0
    );
    const completed: WorkoutSession = {
      ...s,
      completedAt: Date.now(),
      totalVolume,
      totalSets,
      totalReps,
      durationSec: elapsed,
    };
    addToHistory(completed);
    clearActiveSession();
    router.push("/workout/complete");
  }

  const isLastExercise = exerciseIdx === session.exercises.length - 1;

  return (
    <div className="min-h-screen bg-bg px-5 pb-8 pt-6 text-text">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold tracking-wide text-accent">
                {session.title.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-bold">{formatClock(elapsed)}</div>
              <div className="text-[11px] text-text-dim">workout time</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(exProgress / session.exercises.length) * 100}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-text-dim">
              {exProgress} / {session.exercises.length} exercises
            </span>
          </div>
        </div>

        {/* Exercise switcher */}
        <div className="card flex items-center justify-between p-3.5">
          <button
            aria-label="Previous exercise"
            disabled={exerciseIdx === 0}
            onClick={() => goToExercise(exerciseIdx - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <ExerciseImage url={exercise.imageUrl} name={exercise.name} className="h-12 w-12" sizes="48px" />
            <div className="font-display text-lg font-bold">{exercise.name}</div>
            <div className="text-xs text-text-dim">
              {exercise.muscle} &middot; {exercise.targetSets} x {exercise.targetReps ?? 10} reps
            </div>
          </div>
          <button
            aria-label="Next exercise"
            disabled={exerciseIdx === session.exercises.length - 1}
            onClick={() => goToExercise(exerciseIdx + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>

        {/* Previous workout */}
        {exercise.previous && exercise.previous.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-bold tracking-wide text-text-dim">PREVIOUS WORKOUT</div>
            <div className="rounded-2xl border border-border-soft bg-surface-2 px-4">
              {exercise.previous.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border-soft py-2.5 last:border-0"
                >
                  <span className="text-sm text-text-dim">Set {i + 1}</span>
                  <span className="text-sm text-[#c7ccd1]">
                    {s.weight} kg &times; {s.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today */}
        <div>
          <div className="mb-2 text-[11px] font-bold tracking-wide text-accent">TODAY</div>
          <div className="flex flex-col gap-2">
            {exercise.sets.map((s, i) => (
              <div
                key={i}
                className="card grid grid-cols-[40px_1fr_1fr_44px] items-center gap-2 p-2.5"
              >
                <div className="text-sm text-text-dim">Set {s.n}</div>
                <label className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-text-faint">KG</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.weight ?? ""}
                    onChange={(e) =>
                      updateSet(i, { weight: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    placeholder={String(exercise.targetReps ?? 10)}
                    className="w-full rounded-lg border border-border bg-surface-3 px-2 py-1.5 text-[15px] font-semibold text-text"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-text-faint">REPS</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.reps ?? ""}
                    onChange={(e) =>
                      updateSet(i, { reps: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-surface-3 px-2 py-1.5 text-[15px] font-semibold text-text"
                  />
                </label>
                <button
                  aria-label={`Mark set ${s.n} complete`}
                  onClick={() => toggleDone(i)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    background: s.done ? "var(--accent-soft)" : "var(--surface-3)",
                    border: `1px solid ${s.done ? "var(--accent)" : "var(--border)"}`,
                    color: s.done ? "var(--accent)" : "var(--text-faint)",
                  }}
                >
                  {s.done && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2.5 flex gap-2.5">
            <button onClick={addSet} className="flex-1 rounded-xl border border-border bg-surface py-2.5 text-xs font-bold">
              + Add Set
            </button>
            <button onClick={removeSet} className="flex-1 rounded-xl border border-border bg-surface py-2.5 text-xs font-bold text-text-dim">
              Remove Set
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push(`/exercises/add?session=${session.id}`)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#33383f] py-3.5 text-sm font-bold text-text-dim"
        >
          + Add Exercise
        </button>

        <div className="sticky bottom-4 flex flex-col gap-2.5 pt-2">
          {isLastExercise ? (
            <button onClick={finishWorkout} className="btn-primary">
              Finish Workout
            </button>
          ) : (
            <button onClick={() => goToExercise(exerciseIdx + 1)} className="btn-primary">
              Next Exercise
            </button>
          )}
          <button onClick={() => router.push("/workout")} className="text-center text-xs font-semibold text-text-faint">
            Save &amp; Exit
          </button>
        </div>
      </div>

      {/* Rest timer modal */}
      {restOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-w-md rounded-t-3xl border-t border-border bg-bg px-6 pb-8 pt-5">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#2a2e33]" />
            <div className="mb-4 text-center">
              <div className="text-[11px] font-bold tracking-wide text-text-dim">NEXT UP</div>
              <div className="font-display mt-1 text-sm font-bold">
                {isLastExercise ? exercise.name : session.exercises[exerciseIdx]?.name} &middot; Set{" "}
                {exercise.sets.filter((s) => s.done).length + 1}
              </div>
            </div>

            <div className="relative mx-auto mb-5 h-[220px] w-[220px]">
              <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
                <circle cx="110" cy="110" r="96" fill="none" stroke="var(--surface-3)" strokeWidth="13" />
                <circle
                  cx="110"
                  cy="110"
                  r="96"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 96}
                  strokeDashoffset={2 * Math.PI * 96 * (1 - restLeft / restDuration)}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <div className="font-display text-4xl font-bold">{formatClock(restLeft)}</div>
                <div className="text-xs tracking-wide text-text-dim">REST</div>
              </div>
            </div>

            <div className="mb-5 flex justify-center gap-2">
              {REST_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setRestDuration(p);
                    setRestLeft(p);
                    setRestPaused(false);
                  }}
                  className="rounded-full px-3 py-2 text-xs font-bold"
                  style={{
                    background: restDuration === p ? "var(--accent)" : "transparent",
                    color: restDuration === p ? "#0a0c0e" : "var(--text-dim)",
                    border: `1px solid ${restDuration === p ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {p < 60 ? `${p}s` : `${p / 60}m`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setRestLeft((s) => s + 30)}
                aria-label="Add 30 seconds"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-xs font-bold"
              >
                +30s
              </button>
              <button
                onClick={() => setRestPaused((p) => !p)}
                aria-label={restPaused ? "Resume timer" : "Pause timer"}
                className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-accent text-[#0a0c0e]"
              >
                {restPaused ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setRestOpen(false)}
                aria-label="Skip rest"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 5l10 7-10 7z" />
                  <path d="M18 5v14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
