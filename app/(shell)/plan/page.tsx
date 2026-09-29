"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensurePlanSeeded, savePlan, todayDay } from "@/lib/storage";
import { DAY_LABEL, DAY_ORDER, Day, DayPlan, PlanExercise } from "@/lib/types";
import ExerciseImage from "@/components/ExerciseImage";

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Record<Day, DayPlan> | null>(null);
  const [today, setToday] = useState<Day>("mon");
  const [selected, setSelected] = useState<Day | null>(null);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const p = ensurePlanSeeded();
    const t = todayDay();
    setPlan(p);
    setToday(t);
    setSelected(t);
  }, []);

  function updateDay(dayKey: Day, update: (day: DayPlan) => DayPlan) {
    setPlan((current) => current ? { ...current, [dayKey]: update(current[dayKey]) } : current);
    setSaveError("");
  }

  function updateExercise(dayKey: Day, exerciseId: string, patch: Partial<PlanExercise>) {
    updateDay(dayKey, (day) => ({
      ...day,
      exercises: day.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...patch } : exercise
      ),
    }));
  }

  function addExercise(dayKey: Day) {
    const exercise: PlanExercise = {
      id: `plan-exercise-${Date.now()}`,
      name: "",
      muscle: "General",
      equipment: "Bodyweight",
      targetSets: 3,
      targetReps: 10,
      imageUrl: "",
    };
    updateDay(dayKey, (day) => ({
      ...day,
      title: day.isRest ? "Workout" : day.title,
      isRest: false,
      isOptional: false,
      estMinutes: day.isRest ? 45 : day.estMinutes,
      exercises: [...day.exercises, exercise],
    }));
  }

  function makeRestDay(dayKey: Day) {
    if (!window.confirm(`Remove the ${DAY_LABEL[dayKey]} workout and all its exercises?`)) return;
    updateDay(dayKey, (day) => ({
      ...day,
      title: "Rest",
      isRest: true,
      isOptional: false,
      estMinutes: 0,
      exercises: [],
    }));
  }

  function saveChanges() {
    if (!plan) return;
    const hasIncompleteDay = DAY_ORDER.some((dayKey) =>
      !plan[dayKey].isRest && (
        plan[dayKey].exercises.length === 0 ||
        plan[dayKey].exercises.some((exercise) => !exercise.name.trim())
      )
    );
    if (hasIncompleteDay) {
      setSaveError("Add an exercise name to every training day, or mark the day as rest.");
      return;
    }
    savePlan(plan);
    setEditing(false);
    setSaveError("");
  }

  if (!plan) return null;

  const totalSets = DAY_ORDER.reduce((n, d) => n + plan[d].exercises.reduce((m, e) => m + e.targetSets, 0), 0);
  const trainingDays = DAY_ORDER.filter((d) => !plan[d].isRest).length;

  return (
    <div className="flex flex-col gap-5 px-5 pt-7">
      <div className="flex items-center justify-between">
        <div className="font-display text-xl font-bold">Workout Plan</div>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPlan(ensurePlanSeeded());
                setEditing(false);
                setSaveError("");
              }}
              className="rounded-full border border-border bg-surface px-3 py-2 text-xs font-bold text-text-dim"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="rounded-full bg-accent px-3.5 py-2 text-xs font-bold text-bg"
            >
              Save Plan
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setSelected(today);
              setEditing(true);
            }}
            className="rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text-dim"
          >
            Edit Plan
          </button>
        )}
      </div>

      <div className="card flex items-center justify-between p-4">
        <div>
          <div className="text-xs text-text-dim">Training Days</div>
          <div className="font-display text-lg font-bold">{trainingDays} / 7</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-xs text-text-dim">Weekly Sets</div>
          <div className="font-display text-lg font-bold">{totalSets}</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-xs text-text-dim">Split</div>
          <div className="font-display text-lg font-bold">Upper/Lower</div>
        </div>
      </div>

      <p className="px-1 text-xs leading-relaxed text-text-dim">
        {editing
          ? "Choose a day to edit its workout. Changes take effect after you save the plan."
          : "Choose any day to review its workout, or edit your weekly plan."}
      </p>

      <div className="flex flex-col gap-3">
        {DAY_ORDER.map((d) => {
          const day = plan[d];
          const isToday = d === today;
          const isOpen = selected === d;
          return (
            <div
              key={d}
              className="card overflow-hidden"
              style={isToday ? { borderColor: "var(--accent)" } : undefined}
            >
              <button
                onClick={() => setSelected(isOpen ? null : d)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-surface-3 text-[10px] font-bold text-text-dim">
                    {DAY_LABEL[d].slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-display text-base font-bold">{day.title}</div>
                    {!day.isRest && (
                      <div className="text-xs text-text-dim">
                        {day.exercises.length} exercises &middot;{" "}
                        {day.exercises.reduce((n, e) => n + e.targetSets, 0)} sets &middot; ~
                        {day.estMinutes} min
                      </div>
                    )}
                  </div>
                </div>
                {isToday && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold text-accent">
                    TODAY
                  </span>
                )}
              </button>

              {isOpen && editing && (
                <div className="flex flex-col gap-3 border-t border-border-soft p-4 pt-3.5">
                  {day.isRest ? (
                    <button
                      onClick={() => updateDay(d, (current) => ({
                        ...current,
                        title: "Workout",
                        isRest: false,
                        isOptional: false,
                        estMinutes: 45,
                      }))}
                      className="btn-primary"
                    >
                      Add Workout to {DAY_LABEL[d]}
                    </button>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <label className="col-span-2 flex flex-col gap-1 text-xs text-text-dim">
                          Workout name
                          <input
                            value={day.title}
                            onChange={(event) => updateDay(d, (current) => ({ ...current, title: event.target.value }))}
                            className="input"
                            aria-label={`${DAY_LABEL[d]} workout name`}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-text-dim">
                          Estimated minutes
                          <input
                            type="number"
                            min="1"
                            value={day.estMinutes}
                            onChange={(event) => updateDay(d, (current) => ({
                              ...current,
                              estMinutes: Math.max(1, Number(event.target.value) || 1),
                            }))}
                            className="input"
                            aria-label={`${DAY_LABEL[d]} estimated minutes`}
                          />
                        </label>
                        <div className="flex items-end">
                          <button
                            onClick={() => makeRestDay(d)}
                            className="w-full rounded-xl border border-danger/40 px-3 py-3 text-xs font-bold text-danger"
                          >
                            Delete Day&apos;s Workout
                          </button>
                        </div>
                      </div>

                      {day.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex flex-col gap-2.5 rounded-xl border border-border p-3">
                          <div className="flex items-end gap-2">
                            <ExerciseImage url={exercise.imageUrl} name={exercise.name} className="h-12 w-12" />
                            <label className="flex-1 text-xs text-text-dim">
                              Exercise
                              <input
                                value={exercise.name}
                                onChange={(event) => updateExercise(d, exercise.id, { name: event.target.value })}
                                placeholder="Exercise name"
                                className="input mt-1"
                                aria-label={`${DAY_LABEL[d]} exercise name`}
                              />
                            </label>
                            <button
                              type="button"
                              aria-label={`Delete ${exercise.name || "exercise"}`}
                              onClick={() => updateDay(d, (current) => ({
                                ...current,
                                exercises: current.exercises.filter((item) => item.id !== exercise.id),
                              }))}
                              className="mt-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-danger/40 text-danger"
                            >
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                              </svg>
                            </button>
                          </div>
                          <label className="flex flex-col gap-1 text-xs text-text-dim">
                            Image URL
                            <input
                              type="url"
                              value={exercise.imageUrl ?? ""}
                              onChange={(event) => updateExercise(d, exercise.id, { imageUrl: event.target.value })}
                              placeholder="https://example.com/exercise.jpg"
                              className="input"
                              aria-label={`${exercise.name || "Exercise"} image URL`}
                            />
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            <label className="flex flex-col gap-1 text-xs text-text-dim">
                              Muscle
                              <input
                                value={exercise.muscle}
                                onChange={(event) => updateExercise(d, exercise.id, { muscle: event.target.value })}
                                className="input"
                                aria-label={`${exercise.name || "Exercise"} muscle`}
                              />
                            </label>
                            <label className="flex flex-col gap-1 text-xs text-text-dim">
                              Equipment
                              <input
                                value={exercise.equipment}
                                onChange={(event) => updateExercise(d, exercise.id, { equipment: event.target.value })}
                                className="input"
                                aria-label={`${exercise.name || "Exercise"} equipment`}
                              />
                            </label>
                            <label className="flex flex-col gap-1 text-xs text-text-dim">
                              Sets
                              <input
                                type="number"
                                min="1"
                                value={exercise.targetSets}
                                onChange={(event) => updateExercise(d, exercise.id, {
                                  targetSets: Math.max(1, Number(event.target.value) || 1),
                                })}
                                className="input"
                                aria-label={`${exercise.name || "Exercise"} target sets`}
                              />
                            </label>
                            <label className="flex flex-col gap-1 text-xs text-text-dim">
                              Reps per set
                              <input
                                type="number"
                                min="1"
                                value={exercise.targetReps ?? 10}
                                onChange={(event) => updateExercise(d, exercise.id, {
                                  targetReps: Math.max(1, Number(event.target.value) || 1),
                                })}
                                className="input"
                                aria-label={`${exercise.name || "Exercise"} target reps`}
                              />
                            </label>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addExercise(d)}
                        className="rounded-xl border border-dashed border-border py-3 text-sm font-bold text-text-dim"
                      >
                        + Add Exercise
                      </button>
                    </>
                  )}
                </div>
              )}

              {isOpen && !editing && !day.isRest && (
                <div className="flex flex-col gap-3 border-t border-border-soft p-4 pt-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set(day.exercises.map((e) => e.muscle))).map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-semibold text-text-dim"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {day.exercises.map((e) => (
                      <div key={e.id} className="flex items-center justify-between text-sm">
                        <div className="flex min-w-0 items-center gap-3">
                          <ExerciseImage url={e.imageUrl} name={e.name} className="h-10 w-10 rounded-lg" sizes="40px" />
                          <span className="truncate">{e.name}</span>
                        </div>
                        <span className="shrink-0 pl-2 text-text-dim">{e.targetSets} x {e.targetReps ?? 10} reps</span>
                      </div>
                    ))}
                  </div>
                  {isToday && (
                    <button
                      onClick={() => router.push("/workout")}
                      className="btn-primary mt-1"
                    >
                      Go to Today&apos;s Workout
                    </button>
                  )}
                </div>
              )}

              {isOpen && !editing && day.isRest && (
                <div className="border-t border-border-soft p-4 pt-3.5 text-sm text-text-dim">
                  {day.isOptional
                    ? "Optional light cardio — keep it easy."
                    : "Recovery day. No training scheduled."}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {editing && saveError && (
        <p role="alert" className="text-sm text-danger">{saveError}</p>
      )}
    </div>
  );
}
