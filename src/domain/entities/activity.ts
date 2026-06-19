export type ActivityType = "GYM" | "RUN";

export interface Activity {
  id: string;
  userId: string;
  activityType: ActivityType;
  activityDate: string;
  durationSeconds: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GymSession {
  activityId: string;
  title: string;
  location: string | null;
  exercises: GymExercise[];
}

export interface GymExercise {
  id: string;
  activityId: string;
  exerciseName: string;
  muscleGroup: string;
  sequenceNumber: number;
  sets: GymSet[];
}

export interface GymSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  completed: boolean;
}

export interface RunActivity {
  activityId: string;
  distanceMeters: number;
  runType: string;
  location: string | null;
  rpe: number | null;
  elevationGainMeters: number | null;
}

export interface GymActivityDetail extends Activity {
  activityType: "GYM";
  gym: GymSession;
  run: null;
}

export interface RunActivityDetail extends Activity {
  activityType: "RUN";
  gym: null;
  run: RunActivity;
}

export type ActivityDetail = GymActivityDetail | RunActivityDetail;

export interface ActivityDashboardSummary {
  sessionCount: number;
  totalDurationSeconds: number;
  runningDistanceMeters: number;
  gymVolumeKg: number;
  activeDays: number;
}