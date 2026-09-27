"use client";

import { useEffect, useState } from "react";
import { computeStreak, computeThisWeekStats, computeTotals, getHistory, recentVolumeSeries } from "@/lib/storage";

export default function ProgressPage() {
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState({ workouts: 0, volume: 0, sets: 0 });
  const [totals, setTotals] = useState({ totalVolume: 0, totalSets: 0 });
  const [series, setSeries] = useState<number[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    setStreak(computeStreak());
    setWeek(computeThisWeekStats());
    setTotals(computeTotals());
    setSeries(recentVolumeSeries(10));
    setSessionCount(getHistory().filter((s) => s.completedAt).length);
  }, []);

  const max = Math.max(1, ...series);

  return (
    <div className="flex flex-col gap-5 px-5 pt-7">
      <div className="font-display text-xl font-bold">Progress</div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Current streak" value={`${streak}`} unit="days" />
        <StatCard label="Workouts logged" value={`${sessionCount}`} unit="" />
        <StatCard label="Total volume" value={totals.totalVolume.toLocaleString()} unit="kg" />
        <StatCard label="Total sets" value={`${totals.totalSets}`} unit="" />
      </div>

      <div className="card p-4">
        <div className="mb-1 text-sm font-bold">This Week</div>
        <div className="text-xs text-text-dim">
          {week.workouts} workouts &middot; {week.sets} sets &middot; {week.volume.toLocaleString()} kg
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 text-sm font-bold">Volume Trend</div>
        {series.length > 1 ? (
          <svg width="100%" height="120" viewBox="0 0 320 120" preserveAspectRatio="none">
            {series.map((v, i) => {
              const barWidth = 320 / series.length - 6;
              const x = i * (320 / series.length);
              const h = (v / max) * 100;
              return (
                <rect
                  key={i}
                  x={x}
                  y={120 - h}
                  width={barWidth}
                  height={h}
                  rx="4"
                  fill="var(--accent)"
                  opacity={0.4 + 0.6 * (i / series.length)}
                />
              );
            })}
          </svg>
        ) : (
          <p className="py-6 text-center text-xs text-text-dim">
            Log a few more workouts to see your trend.
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
