"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensurePlanSeeded, todayDay } from "@/lib/storage";
import { DAY_LABEL, DAY_ORDER, Day, DayPlan } from "@/lib/types";

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Record<Day, DayPlan> | null>(null);
  const [today, setToday] = useState<Day>("mon");
  const [selected, setSelected] = useState<Day | null>(null);

  useEffect(() => {
    const p = ensurePlanSeeded();
    const t = todayDay();
    setPlan(p);
    setToday(t);
    setSelected(t);
  }, []);

  if (!plan) return null;

  const totalSets = DAY_ORDER.reduce((n, d) => n + plan[d].exercises.reduce((m, e) => m + e.targetSets, 0), 0);
  const trainingDays = DAY_ORDER.filter((d) => !plan[d].isRest).length;

  return (
    <div className="flex flex-col gap-5 px-5 pt-7">
      <div className="flex items-center justify-between">
        <div className="font-display text-xl font-bold">Workout Plan</div>
        <button className="rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text-dim">
          Edit Plan
        </button>
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
        Missed sessions move forward one day at a time, including onto rest days if needed. The
        schedule starts fresh each Monday; unfinished sessions do not carry into the next week.
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

              {isOpen && !day.isRest && (
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
                        <span>{e.name}</span>
                        <span className="text-text-dim">{e.targetSets} sets</span>
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

              {isOpen && day.isRest && (
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
    </div>
  );
}
