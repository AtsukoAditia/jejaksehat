import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryActivityRepository,
  InMemoryProgressRepository,
  InMemoryUserRepository,
} from "../src/infrastructure/testing/in-memory-repositories";

test("user repository upserts by google subject", async () => {
  const repo = new InMemoryUserRepository();
  const created = await repo.upsertGoogleUser({
    googleSubject: "google-1",
    email: "first@example.test",
    name: "First User",
  });
  const updated = await repo.upsertGoogleUser({
    googleSubject: "google-1",
    email: "updated@example.test",
    name: "Updated User",
    timezone: "Asia/Jakarta",
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.email, "updated@example.test");
  assert.equal((await repo.findByGoogleSubject("google-1"))?.name, "Updated User");
});

test("activity repository handles ownership, filtering, update, and soft delete", async () => {
  const repo = new InMemoryActivityRepository();
  await repo.create({
    id: "run-1",
    userId: "user-1",
    activityType: "RUN",
    activityDate: "2026-06-20",
    durationSeconds: 1800,
    distanceMeters: 5000,
    runType: "Easy Run",
  });
  await repo.create({
    id: "gym-1",
    userId: "user-1",
    activityType: "GYM",
    activityDate: "2026-06-21",
    durationSeconds: 3600,
    title: "Push Day",
    exercises: [{ exerciseName: "Bench Press", muscleGroup: "Dada", sets: [{ reps: 10, weightKg: 40 }] }],
  });

  assert.equal((await repo.findByUser("user-1")).length, 2);
  assert.equal((await repo.findByUser("user-1", { type: "GYM" })).length, 1);
  assert.equal(await repo.findById("run-1", "other-user"), null);

  const updated = await repo.update("run-1", "user-1", {
    activityType: "RUN",
    activityDate: "2026-06-22",
    durationSeconds: 2100,
    distanceMeters: 5500,
    runType: "Tempo Run",
  });
  assert.equal(updated.activityType, "RUN");
  assert.equal(updated.run.distanceMeters, 5500);

  await repo.remove("run-1", "user-1");
  assert.equal(await repo.findById("run-1", "user-1"), null);
});

test("progress repository deactivates existing goals of the same type", async () => {
  const repo = new InMemoryProgressRepository();
  const measurement = await repo.createMeasurement({
    id: "measurement-1",
    userId: "user-1",
    measuredAt: "2026-06-20",
    weightKg: 70,
    bodyFatPercent: 18,
  });
  assert.equal(measurement.weightKg, 70);

  await repo.createGoal({
    id: "goal-1",
    userId: "user-1",
    goalType: "WEEKLY_WORKOUTS",
    targetValue: 4,
    unit: "sessions",
    periodType: "WEEKLY",
    startDate: "2026-06-17",
  });
  await repo.createGoal({
    id: "goal-2",
    userId: "user-1",
    goalType: "WEEKLY_WORKOUTS",
    targetValue: 5,
    unit: "sessions",
    periodType: "WEEKLY",
    startDate: "2026-06-24",
  });

  const allGoals = await repo.findGoalsByUser("user-1");
  const activeGoals = await repo.findGoalsByUser("user-1", true);
  assert.equal(allGoals.length, 2);
  assert.equal(activeGoals.length, 1);
  assert.equal(activeGoals[0].id, "goal-2");

  await repo.removeMeasurement("measurement-1", "user-1");
  assert.equal(await repo.findMeasurementById("measurement-1", "user-1"), null);
});
