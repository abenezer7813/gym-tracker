"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ensurePlanSeeded,
  getActiveSession,
  getProfile,
  computeStreak,
  computeThisWeekStats,
  computeTotals,
  recentVolumeSeries,
  getWorkoutDayForDate,
  hasCompletedWorkoutOnDate,
  todayDay,
  dayStatus,
} from "@/lib/storage";
import { DAY_LABEL, DAY_ORDER, Day, DayPlan } from "@/lib/types";

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("there");
  const [plan, setPlan] = useState<Record<Day, DayPlan> | null>(null);
  const [today, setToday] = useState<Day>("mon");
  const [workoutDay, setWorkoutDay] = useState<Day | null>(null);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState({ workouts: 0, volume: 0, sets: 0 });
  const [totals, setTotals] = useState({ totalVolume: 0, totalSets: 0 });
  const [series, setSeries] = useState<number[]>([]);
  const [inProgress, setInProgress] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [setsLabel, setSetsLabel] = useState("");
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    const p = ensurePlanSeeded();
    const t = todayDay();
    const now = new Date();
    const profile = getProfile();
    const active = getActiveSession();

    setPlan(p);
    setToday(t);
    const completed = hasCompletedWorkoutOnDate(now);
    setWorkoutDay(active?.day ?? (completed ? null : getWorkoutDayForDate(p, now)));
    setCompletedToday(completed);
    setName(profile?.name?.split(" ")[0] ?? "there");
    setStreak(computeStreak());
    setWeek(computeThisWeekStats());
    setTotals(computeTotals());
    setSeries(recentVolumeSeries());

    if (active) {
      const doneSets = active.exercises.reduce(
        (n, e) => n + e.sets.filter((s) => s.done).length,
        0
      );
      const totalSets = active.exercises.reduce((n, e) => n + e.sets.length, 0);
      setInProgress(true);
      setProgressPct(totalSets ? Math.round((doneSets / totalSets) * 100) : 0);
      setSetsLabel(`${doneSets} / ${totalSets} sets completed`);
    }
    setReady(true);
  }, []);

  if (!ready || !plan) return null;

  const todayPlan = plan[workoutDay ?? today];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const max = Math.max(1, ...series);

  return (
    <div className="flex flex-col gap-6 px-5 pt-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-xl font-bold">{greeting}</div>
          <div className="text-sm text-text-dim">{name}</div>
        </div>
        <Link
          href="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface font-display font-semibold text-accent"
        >
          {name.charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* Today's workout card */}
      <div className="card flex flex-col gap-3.5 p-5">
        {!workoutDay && !inProgress ? (
          <>
            <div className="text-xs font-bold tracking-wide text-accent">
              TODAY &middot; {DAY_LABEL[today].toUpperCase()}
            </div>
            <div className="font-display text-2xl font-bold">
              {completedToday
                ? "Workout complete"
                : todayPlan.isRest
                  ? todayPlan.isOptional ? "Optional Cardio" : "Rest Day"
                  : "Weekly plan complete"}
            </div>
            <p className="text-sm text-text-dim">
              {completedToday
                ? "Your next session will be ready tomorrow."
                : todayPlan.isRest
                  ? "Recovery day. Light stretching or a walk keeps things moving."
                  : "A fresh plan starts Monday, whether or not every session was completed."}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold tracking-wide text-accent">
                TODAY &middot; {DAY_LABEL[today].toUpperCase()}
              </div>
              {inProgress && (
                <div className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
                  {progressPct}%
                </div>
              )}
            </div>
            <div>
              <div className="font-display text-2xl font-bold">{todayPlan.title}</div>
              {workoutDay && workoutDay !== today && !inProgress && (
                <div className="mt-1 text-xs text-text-dim">
                  Moved from {DAY_LABEL[workoutDay]}
                </div>
              )}
              <div className="mt-1 text-sm text-text-dim">
                {todayPlan.exercises.length} exercises &middot;{" "}
                {todayPlan.exercises.reduce((n, e) => n + e.targetSets, 0)} sets &middot; Est.{" "}
                {todayPlan.estMinutes} min
              </div>
            </div>

            {inProgress && (
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="text-xs text-text-dim">{setsLabel}</div>
              </div>
            )}

            <Link href="/workout" className="btn-primary mt-1 text-center">
              {inProgress ? "Continue Workout" : "Start Workout"}
            </Link>
          </>
        )}
      </div>

      {/* Weekly overview */}
      <div className="flex flex-col gap-2.5">
        <div className="font-display text-base font-bold">This Week</div>
        <div className="flex justify-between gap-1.5">
          {DAY_ORDER.map((d) => {
            const status = dayStatus(d, today);
            const styles =
              status === "done"
                ? { bg: "rgba(51,209,126,0.10)", border: "#1e4a33", label: "var(--accent)", dot: "var(--accent)" }
                : status === "current"
                ? { bg: "rgba(51,209,126,0.18)", border: "var(--accent)", label: "var(--text)", dot: "var(--accent)" }
                : status === "rest"
                ? { bg: "transparent", border: "transparent", label: "var(--text-faint)", dot: "#2a2e33" }
                : { bg: "var(--surface)", border: "var(--border)", label: "var(--text-dim)", dot: "#3a4046" };
            return (
              <div
                key={d}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-xl py-2"
                style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
              >
                <span className="text-[11px] font-bold" style={{ color: styles.label }}>
                  {DAY_LABEL[d].slice(0, 3).toUpperCase()}
                </span>
                <span className="h-2 w-2 rounded-full" style={{ background: styles.dot }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Current streak" value={`${streak}`} unit="days" />
        <StatCard label="This week" value={`${week.workouts}`} unit="workouts" />
        <StatCard label="Total volume" value={totals.totalVolume.toLocaleString()} unit="kg" />
        <StatCard label="Total sets" value={`${totals.totalSets}`} unit="" />
      </div>

      {/* Recent progress chart */}
      <div className="card p-4">
        <div className="mb-2.5 text-sm font-bold">Recent Progress</div>
        {series.length > 1 ? (
          <svg width="100%" height="70" viewBox="0 0 320 70" preserveAspectRatio="none">
            <polyline
              points={series
                .map((v, i) => `${(i / (series.length - 1)) * 320},${70 - (v / max) * 60 - 5}`)
                .join(" ")}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <p className="py-4 text-xs text-text-dim">
            Complete a few workouts to see your volume trend here.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="card p-3.5">
      <div className="text-xs text-text-dim">{label}</div>
      <div className="font-display mt-1 text-xl font-bold">
        {value} {unit && <span className="text-sm font-medium text-text-dim">{unit}</span>}
      </div>
    </div>
  );
}
