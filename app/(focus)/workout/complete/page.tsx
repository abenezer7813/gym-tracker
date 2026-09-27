"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistory, getPreviousSessionBeforeCurrent, updateHistoryEntry } from "@/lib/storage";
import { WorkoutSession } from "@/lib/types";

const FEELINGS = ["\u{1F62B}", "\u{1F615}", "\u{1F642}", "\u{1F60A}", "\u{1F525}"];

function formatDuration(sec: number) {
  const m = Math.round(sec / 60);
  return `${m} min`;
}

export default function WorkoutCompletePage() {
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [previous, setPrevious] = useState<WorkoutSession | null>(null);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const history = getHistory();
    const latest = history[0] ?? null;
    if (!latest) {
      router.replace("/home");
      return;
    }
    setSession(latest);
    setPrevious(getPreviousSessionBeforeCurrent(latest.day, latest.id));
  }, [router]);

  if (!session) return null;

  const volumeChange = previous && previous.totalVolume > 0
    ? Math.round(((session.totalVolume - previous.totalVolume) / previous.totalVolume) * 1000) / 10
    : null;
  const setsChange = previous ? session.totalSets - previous.totalSets : null;

  function save() {
    if (!session) return;
    updateHistoryEntry(session.id, { feeling, notes });
    setSaved(true);
    setTimeout(() => router.push("/home"), 400);
  }

  return (
    <div className="min-h-screen bg-bg px-5 pb-8 pt-7 text-text">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-xs font-bold tracking-wide text-accent">WORKOUT COMPLETE</div>
          <div className="font-display text-2xl font-bold">{session.title}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <MiniStat value={formatDuration(session.durationSec)} label="Duration" />
          <MiniStat value={`${session.exercises.length}`} label="Exercises" />
          <MiniStat value={`${session.totalSets}`} label="Sets" />
          <MiniStat value={`${session.totalReps}`} label="Reps" />
        </div>

        {previous && (
          <div className="card p-4">
            <div className="mb-2.5 text-xs font-bold text-text-dim">VS PREVIOUS SESSION</div>
            <div className="mb-2.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-text-dim">Total Volume</div>
                <div className="mt-0.5 text-sm text-[#6b7177]">
                  {previous.totalVolume.toLocaleString()} kg &rarr;{" "}
                  <span className="font-bold text-text">{session.totalVolume.toLocaleString()} kg</span>
                </div>
              </div>
              {volumeChange !== null && (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{
                    background: volumeChange >= 0 ? "var(--accent-soft)" : "rgba(255,107,107,0.14)",
                    color: volumeChange >= 0 ? "var(--accent)" : "var(--danger)",
                  }}
                >
                  {volumeChange >= 0 ? "+" : ""}
                  {volumeChange}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-text-dim">Sets</div>
                <div className="mt-0.5 text-sm text-[#6b7177]">
                  {previous.totalSets} &rarr; <span className="font-bold text-text">{session.totalSets}</span>
                </div>
              </div>
              {setsChange !== null && (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{
                    background: setsChange >= 0 ? "var(--accent-soft)" : "rgba(255,107,107,0.14)",
                    color: setsChange >= 0 ? "var(--accent)" : "var(--danger)",
                  }}
                >
                  {setsChange >= 0 ? "+" : ""}
                  {setsChange}
                </span>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="mb-2.5 text-sm font-bold">How did this workout feel?</div>
          <div className="flex justify-between gap-2">
            {FEELINGS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setFeeling(i)}
                className="flex-1 rounded-xl py-3 text-xl"
                style={{
                  background: feeling === i ? "var(--accent-soft)" : "var(--surface)",
                  border: `1px solid ${feeling === i ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="text-sm font-bold">
            Workout Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about today's session..."
            rows={3}
            className="input resize-none"
          />
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button onClick={save} className="btn-primary">
            {saved ? "Saved" : "Save Workout"}
          </button>
          <button onClick={() => router.push("/progress")} className="btn-secondary">
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-2.5 text-center">
      <div className="font-display text-base font-bold">{value}</div>
      <div className="mt-0.5 text-[10px] text-text-dim">{label}</div>
    </div>
  );
}
