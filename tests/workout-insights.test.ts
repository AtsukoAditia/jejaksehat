import assert from "node:assert/strict";
import test from "node:test";
import type { ActivityDetail, GymActivityDetail } from "../src/domain/entities/activity";
import { calculateWorkoutStreak, compareGymWorkouts, findPreviousComparableWorkout } from "../src/lib/workout-insights";

function run(id: string, date: string): ActivityDetail {
  return {
    id,
    userId: "user-1",
    activityType: "RUN",
    activityDate: date,
    durationSeconds: 1800,
    notes: null,
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
    deletedAt: null,
    gym: null,
    run: { activityId: id, distanceMeters: 5000, runType: "Easy Run", location: null, rpe: 6, elevationGainMeters: 0 },
  };
}

function gym(id: string, date: string, title: string, weightKg: number): GymActivityDetail {
  return {
    id,
    userId: "user-1",
    activityType: "GYM",
    activityDate: date,
    durationSeconds: 3600,
    notes: null,
    createdAt: `${date}T09:00:00.000Z`,
    updatedAt: `${date}T09:00:00.000Z`,
    deletedAt: null,
    run: null,
    gym: {
      activityId: id,
      title,
      location: null,
      exercises: [{
        id: `${id}-exercise`,
        activityId: id,
        exerciseName: "Bench Press",
        muscleGroup: "Dada",
        sequenceNumber: 1,
        sets: [1, 2, 3].map((setNumber) => ({
          id: `${id}-set-${setNumber}`,
          exerciseId: `${id}-exercise`,
          setNumber,
          reps: 10,
          weightKg,
          rpe: 8,
          completed: true,
        })),
      }],
    },
  };
}

test("calculates streak from unique dates", () => {
  const activities = [run("a", "2026-06-20"), gym("b", "2026-06-20", "Push Day", 40), run("c", "2026-06-19"), run("d", "2026-06-18")];
  const streak = calculateWorkoutStreak(activities, "2026-06-20");
  assert.equal(streak.current, 3);
  assert.equal(streak.longest, 3);
  assert.equal(streak.totalActiveDays, 3);
});

test("allows yesterday to continue current streak", () => {
  const streak = calculateWorkoutStreak([run("a", "2026-06-19"), run("b", "2026-06-18")], "2026-06-20");
  assert.equal(streak.current, 2);
});

test("returns zero current streak for stale activity", () => {
  const streak = calculateWorkoutStreak([run("a", "2026-06-17"), run("b", "2026-06-16")], "2026-06-20");
  assert.equal(streak.current, 0);
  assert.equal(streak.longest, 2);
});

test("finds nearest workout with normalized title", () => {
  const current = gym("current", "2026-06-20", " Push   Day ", 50);
  const nearest = gym("nearest", "2026-06-13", "push day", 45);
  const older = gym("older", "2026-06-06", "PUSH DAY", 40);
  assert.equal(findPreviousComparableWorkout(current, [older, nearest, current])?.id, "nearest");
});

test("compares gym volume and best weight", () => {
  const previous = gym("previous", "2026-06-13", "Push Day", 40);
  const current = gym("current", "2026-06-20", "Push Day", 50);
  const result = compareGymWorkouts(current, previous);
  assert.equal(result.volume.previous, 1200);
  assert.equal(result.volume.current, 1500);
  assert.equal(result.volume.delta, 300);
  assert.equal(result.exerciseComparisons[0].deltaBestWeightKg, 10);
});
