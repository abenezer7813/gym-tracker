"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computeTotals, getHistory, getProfile, logout } from "@/lib/storage";
import { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ totalVolume: 0, totalSets: 0 });
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    setProfile(getProfile());
    setStats(computeTotals());
    setSessionCount(getHistory().filter((s) => s.completedAt).length);
  }, []);

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 px-5 pt-7">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft font-display text-2xl font-bold text-accent">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-display text-lg font-bold">{profile.name}</div>
          <div className="text-sm text-text-dim">{profile.email}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <div className="font-display text-lg font-bold">{sessionCount}</div>
          <div className="text-[10px] text-text-dim">Workouts</div>
        </div>
        <div className="card p-3 text-center">
          <div className="font-display text-lg font-bold">{stats.totalSets}</div>
          <div className="text-[10px] text-text-dim">Sets</div>
        </div>
        <div className="card p-3 text-center">
          <div className="font-display text-lg font-bold">{(stats.totalVolume / 1000).toFixed(1)}t</div>
          <div className="text-[10px] text-text-dim">Volume</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SettingRow label="Edit Profile" />
        <SettingRow label="Units (kg / lb)" />
        <SettingRow label="Notifications" />
        <SettingRow label="Export Data" />
      </div>

      <button
        onClick={() => {
          logout();
          router.replace("/");
        }}
        className="btn-secondary"
        style={{ color: "var(--danger)", borderColor: "rgba(255,107,107,0.3)" }}
      >
        Log Out
      </button>
    </div>
  );
}

function SettingRow({ label }: { label: string }) {
  return (
    <button className="card flex items-center justify-between p-4 text-left">
      <span className="text-sm font-semibold">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-faint">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
