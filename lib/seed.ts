import { Day, DayPlan, PlanExercise } from "./types";

export const EXERCISE_IMAGES: Record<string, string> = {
  "Bench Press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "Incline Dumbbell Press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg",
  "Cable Fly": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
  "Push-Up": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
  "Lat Pulldown": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
  "Seated Cable Row": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
  "Barbell Row": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
  "Pull-Up": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
  "Overhead Shoulder Press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg",
  "Lateral Raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
  "Dumbbell Lateral Raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
  "Rear Delt Fly": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/0.jpg",
  "Barbell Curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
  "Hammer Curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
  "Triceps Pushdown": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
  "Close-Grip Bench Press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg",
  "Barbell Back Squat": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg",
  "Romanian Deadlift": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
  "Leg Press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
  "Walking Lunge": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/0.jpg",
  "Plank": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
  "Cable Crunch": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg",
  "Hanging Leg Raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
};

let uid = 0;
function ex(name: string, muscle: string, equipment: string, targetSets = 3, targetReps = 10): PlanExercise {
  uid += 1;
  return {
    id: `ex-${uid}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    muscle,
    equipment,
    targetSets,
    targetReps,
    imageUrl: EXERCISE_IMAGES[name],
  };
}

export function defaultWeeklyPlan(): Record<Day, DayPlan> {
  return {
    mon: {
      day: "mon",
      title: "Legs + Biceps",
      isRest: false,
      estMinutes: 65,
      exercises: [
        ex("Barbell Back Squat", "Quads", "Barbell", 4),
        ex("Romanian Deadlift", "Hamstrings", "Barbell", 4),
        ex("Leg Press", "Quads", "Machine", 3),
        ex("Walking Lunge", "Quads", "Dumbbell", 3),
        ex("Seated Calf Raise", "Calves", "Machine", 3),
        ex("Standing Calf Raise", "Calves", "Machine", 3),
        ex("Barbell Curl", "Biceps", "Barbell", 3),
        ex("Incline Dumbbell Curl", "Biceps", "Dumbbell", 3),
      ],
    },
    tue: {
      day: "tue",
      title: "Chest + Triceps",
      isRest: false,
      estMinutes: 55,
      exercises: [
        ex("Bench Press", "Chest", "Barbell", 4),
        ex("Incline Dumbbell Press", "Chest", "Dumbbell", 3),
        ex("Cable Fly", "Chest", "Cable", 3),
        ex("Chest Dip", "Lower Chest", "Bodyweight", 3),
        ex("Triceps Pushdown", "Triceps", "Cable", 3),
        ex("Overhead Triceps Extension", "Triceps", "Dumbbell", 3),
        ex("Close-Grip Bench Press", "Triceps", "Barbell", 3),
      ],
    },
    wed: {
      day: "wed",
      title: "Rest",
      isRest: true,
      estMinutes: 0,
      exercises: [],
    },
    thu: {
      day: "thu",
      title: "Shoulders + Back",
      isRest: false,
      estMinutes: 55,
      exercises: [
        ex("Overhead Shoulder Press", "Anterior & Lateral Delts", "Barbell", 4),
        ex("Dumbbell Lateral Raise", "Lateral Deltoid", "Dumbbell", 4),
        ex("Rear Delt Fly", "Rear Delts", "Dumbbell", 3),
        ex("Lat Pulldown", "Lats", "Cable", 4),
        ex("Seated Cable Row", "Mid Back", "Cable", 3),
        ex("Barbell Row", "Upper Back", "Barbell", 3),
        ex("Face Pull", "Rear Delts", "Cable", 3),
        ex("Shrugs", "Traps", "Dumbbell", 3),
      ],
    },
    fri: {
      day: "fri",
      title: "Upper Body",
      isRest: false,
      estMinutes: 50,
      exercises: [
        ex("Pull-Up", "Back", "Bodyweight", 4),
        ex("Push Press", "Shoulders", "Barbell", 3),
        ex("Incline Bench Press", "Chest", "Barbell", 3),
        ex("Cable Row", "Back", "Cable", 3),
        ex("Hammer Curl", "Biceps", "Dumbbell", 3),
        ex("Triceps Rope Pushdown", "Triceps", "Cable", 3),
      ],
    },
    sat: {
      day: "sat",
      title: "Optional Cardio",
      isRest: true,
      isOptional: true,
      estMinutes: 30,
      exercises: [],
    },
    sun: {
      day: "sun",
      title: "Rest",
      isRest: true,
      estMinutes: 0,
      exercises: [],
    },
  };
}

export const EXERCISE_LIBRARY: PlanExercise[] = [
  ex("Bench Press", "Chest", "Barbell", 4),
  ex("Incline Dumbbell Press", "Chest", "Dumbbell", 3),
  ex("Cable Fly", "Chest", "Cable", 3),
  ex("Push-Up", "Chest", "Bodyweight", 3),
  ex("Lat Pulldown", "Back", "Cable", 4),
  ex("Seated Cable Row", "Back", "Cable", 3),
  ex("Barbell Row", "Back", "Barbell", 3),
  ex("Pull-Up", "Back", "Bodyweight", 4),
  ex("Overhead Shoulder Press", "Shoulders", "Barbell", 4),
  ex("Lateral Raise", "Shoulders", "Dumbbell", 3),
  ex("Rear Delt Fly", "Shoulders", "Dumbbell", 3),
  ex("Barbell Curl", "Biceps", "Barbell", 3),
  ex("Hammer Curl", "Biceps", "Dumbbell", 3),
  ex("Triceps Pushdown", "Triceps", "Cable", 3),
  ex("Close-Grip Bench Press", "Triceps", "Barbell", 3),
  ex("Barbell Back Squat", "Legs", "Barbell", 4),
  ex("Romanian Deadlift", "Legs", "Barbell", 4),
  ex("Leg Press", "Legs", "Machine", 3),
  ex("Walking Lunge", "Legs", "Dumbbell", 3),
  ex("Plank", "Core", "Bodyweight", 3),
  ex("Cable Crunch", "Core", "Cable", 3),
  ex("Hanging Leg Raise", "Core", "Bodyweight", 3),
];

export const MUSCLE_FILTERS = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core"];
export const EQUIPMENT_FILTERS = ["Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight"];
