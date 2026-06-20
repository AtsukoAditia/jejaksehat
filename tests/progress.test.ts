import assert from "node:assert/strict";
import test from "node:test";
import type { ActivityDetail } from "../src/domain/entities/activity";
import type { BodyMeasurement, Goal } from "../src/domain/entities/progress";
import {
  buildSparklinePoints,
  calculateGoalProgress,
  measurementDelta,
} from "../src/lib/progress-metrics";
import {
  bodyMeasurementPayloadSchema,
  goalPayloadSchema,
} from "../src/validation/progress";

const now = new Date();
const monday = new Date(now);
monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
const weekDate = monday.toISOString().slice(0, 10);

const runActivity: ActivityDetail = {
  id: "run-1",
  userId: "user-1",
  activityType: "RUN",
  activityDate: weekDate,
  durationSeconds: 1800,
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  gym: null,
  run: {
    activityId: "run-1",
    distanceMeters: 5000,
    runType: "Easy Run",
    location: null,
    rpe: 6,
    elevationGainMeters: 0,
  },
};

const gymActivity: ActivityDetail = {
  id: "gym-1",
  userId: "user-1",
  activityType: "GYM",
  activityDate: weekDate,
  durationSeconds: 3600,
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  run: null,
  gym: { activityId: "gym-1", title: "Push Day", location: null, exercises: [] },
};

function measurement(id: string, date: string, weight: number): BodyMeasurement {
  return {
    id,
    userId: "user-1",
    measuredAt: date,
    weightKg: weight,
    bodyFatPercent: 20,
    waistCm: 85,
    notes: null,
    createdAt: `${date}T00:00:00.000Z`,
    updatedAt: `${date}T00:00:00.000Z`,
    deletedAt: null,
  };
}

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: "goal-1",
    userId: "user-1",
    goalType: "WEEKLY_WORKOUTS",
    targetValue: 4,
    unit: "sesi",
    periodType: "WEEKLY",
    startDate: weekDate,
    endDate: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

test("calculates body measurement delta", () => {
  const latest = measurement("m2", "2026-06-20", 68.5);
  const previous = measurement("m1", "2026-06-13", 70);
  assert.equal(measurementDelta(latest, previous, "weightKg"), -1.5);
});

test("calculates weekly workout and running goals", () => {
  const workout = calculateGoalProgress(goal({}), [runActivity, gymActivity], []);
  assert.equal(workout.currentValue, 2);
  assert.equal(workout.progressPercent, 50);

  const running = calculateGoalProgress(
    goal({ goalType: "WEEKLY_RUNNING_DISTANCE", targetValue: 10, unit: "km" }),
    [runActivity, gymActivity],
    [],
  );
  assert.equal(running.currentValue, 5);
  assert.equal(running.progressPercent, 50);
});

test("calculates target weight progress in loss direction", () => {
  const measurements = [
    measurement("m1", "2026-06-01", 70),
    measurement("m2", "2026-06-15", 67.5),
  ];
  const result = calculateGoalProgress(
    goal({
      goalType: "TARGET_WEIGHT",
      targetValue: 65,
      unit: "kg",
      periodType: "ONGOING",
      startDate: "2026-06-01",
    }),
    [],
    measurements,
  );
  assert.equal(result.currentValue, 67.5);
  assert.equal(result.progressPercent, 50);
  assert.equal(result.remainingValue, 2.5);
});

test("builds finite sparkline points", () => {
  const points = buildSparklinePoints([70, 70, 70]);
  assert.equal(points.includes("NaN"), false);
  assert.equal(points.split(" ").length, 3);
});

test("validates measurement and goal payloads", () => {
  assert.equal(bodyMeasurementPayloadSchema.safeParse({
    measuredAt: "2026-06-20",
    weightKg: 68,
    bodyFatPercent: 18,
    waistCm: 82,
    notes: null,
  }).success, true);

  assert.equal(bodyMeasurementPayloadSchema.safeParse({
    measuredAt: "2026-06-20",
    weightKg: 5,
  }).success, false);

  assert.equal(goalPayloadSchema.safeParse({
    goalType: "WEEKLY_WORKOUTS",
    targetValue: 4,
    unit: "sesi",
    periodType: "WEEKLY",
    startDate: "2026-06-20",
    endDate: null,
    isActive: true,
  }).success, true);
});
