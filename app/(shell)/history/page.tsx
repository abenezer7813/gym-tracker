"use client";

import { useEffect, useState } from "react";
import { getHistory } from "@/lib/storage";
import { DAY_LABEL, WorkoutSession } from "@/lib/types";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    setSessions(getHistory().filter((s) => s.completedAt));
  }, []);

  return (
    <div className="flex flex-col gap-5 px-5 pt-7">
      <div className="font-display text-xl font-bold">History</div>

      {sessions.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-text-dim">No workouts logged yet.</p>
          <p className="text-xs text-text-faint">Finish a session and it will show up here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{s.title}</div>
                  <div className="text-xs text-text-dim">
                    {DAY_LABEL[s.day]} &middot;{" "}
                    {new Date(s.completedAt ?? 0).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                {s.feeling !== null && s.feeling !== undefined && (
                  <span className="text-lg">
                    {["\u{1F62B}", "\u{1F615}", "\u{1F642}", "\u{1F60A}", "\u{1F525}"][s.feeling]}
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-4 text-xs text-text-dim">
                <span>{Math.round(s.durationSec / 60)} min</span>
                <span>{s.totalSets} sets</span>
                <span>{s.totalReps} reps</span>
                <span>{s.totalVolume.toLocaleString()} kg</span>
              </div>
              {s.notes && <p className="mt-2 text-xs text-text-faint">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
