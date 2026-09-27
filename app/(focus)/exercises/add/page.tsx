"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveSession, saveActiveSession } from "@/lib/storage";
import { EXERCISE_LIBRARY, EQUIPMENT_FILTERS, MUSCLE_FILTERS } from "@/lib/seed";

function AddExerciseInner() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [equipment, setEquipment] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState("");

  const results = useMemo(() => {
    return EXERCISE_LIBRARY.filter((e) => {
      const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase());
      const matchesMuscle = muscle === "All" || e.muscle === muscle;
      const matchesEquip = !equipment || e.equipment === equipment;
      return matchesQuery && matchesMuscle && matchesEquip;
    });
  }, [query, muscle, equipment]);

  function addExercise(name: string, muscleGroup: string, targetSets = 3) {
    const session = getActiveSession();
    if (!session) {
      router.push("/workout");
      return;
    }
    session.exercises.push({
      // eslint-disable-next-line react-hooks/purity -- runs only inside a click handler, never during render
      exerciseId: `custom-${Date.now()}`,
      name,
      muscle: muscleGroup,
      targetSets,
      sets: Array.from({ length: targetSets }, (_, i) => ({
        n: i + 1,
        weight: null,
        reps: null,
        done: false,
      })),
    });
    saveActiveSession(session);
    router.push("/workout/active");
  }

  return (
    <div className="min-h-screen bg-bg px-5 pb-8 pt-6 text-text">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="font-display text-xl font-bold">Add Exercise</div>
        </div>

        <label className="relative block">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6067" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="input pl-10"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MUSCLE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setMuscle(f)}
              className="whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold"
              style={{
                background: muscle === f ? "var(--accent)" : "transparent",
                color: muscle === f ? "#0a0c0e" : "var(--text-dim)",
                border: `1px solid ${muscle === f ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {EQUIPMENT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setEquipment(equipment === f ? null : f)}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: equipment === f ? "var(--surface-3)" : "transparent",
                color: equipment === f ? "var(--text)" : "var(--text-dim)",
                border: "1px solid var(--border)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => addExercise(ex.name, ex.muscle, ex.targetSets)}
              className="card flex items-center justify-between p-4 text-left"
            >
              <div>
                <div className="text-sm font-bold">{ex.name}</div>
                <div className="text-xs text-text-dim">
                  {ex.muscle} &middot; {ex.equipment}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <p className="py-4 text-center text-sm text-text-dim">No exercises match your filters.</p>
          )}

          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#33383f] py-3.5 text-sm font-bold text-text-dim"
            >
              + Create Custom Exercise
            </button>
          ) : (
            <div className="card flex flex-col gap-3 p-4">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Exercise name"
                className="input"
              />
              <input
                value={customMuscle}
                onChange={(e) => setCustomMuscle(e.target.value)}
                placeholder="Target muscle"
                className="input"
              />
              <button
                onClick={() => customName.trim() && addExercise(customName.trim(), customMuscle.trim() || "General")}
                className="btn-primary"
              >
                Add to Workout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AddExercisePage() {
  return (
    <Suspense fallback={null}>
      <AddExerciseInner />
    </Suspense>
  );
}
