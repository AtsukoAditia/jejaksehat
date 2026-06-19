import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid");
const nullableText = z.string().trim().max(300).optional().nullable();

const baseSchema = z.object({
  activityDate: dateSchema,
  durationSeconds: z.number().int().min(60).max(86_400),
  notes: nullableText,
});

const gymSetSchema = z.object({
  reps: z.number().int().min(1).max(200),
  weightKg: z.number().min(0).max(1_000),
  rpe: z.number().min(1).max(10).optional().nullable(),
  completed: z.boolean().optional().default(true),
});

const gymExerciseSchema = z.object({
  exerciseName: z.string().trim().min(2).max(80),
  muscleGroup: z.string().trim().min(2).max(40),
  sets: z.array(gymSetSchema).min(1).max(12),
});

export const createGymActivitySchema = baseSchema.extend({
  activityType: z.literal("GYM"),
  title: z.string().trim().min(2).max(80),
  location: z.string().trim().max(100).optional().nullable(),
  exercises: z.array(gymExerciseSchema).min(1).max(16),
});

export const createRunActivitySchema = baseSchema.extend({
  activityType: z.literal("RUN"),
  distanceMeters: z.number().int().min(100).max(250_000),
  runType: z.string().trim().min(2).max(40),
  location: z.string().trim().max(100).optional().nullable(),
  rpe: z.number().min(1).max(10).optional().nullable(),
  elevationGainMeters: z.number().int().min(0).max(20_000).optional().nullable(),
});

export const activityPayloadSchema = z.discriminatedUnion("activityType", [
  createGymActivitySchema,
  createRunActivitySchema,
]);

export type ActivityPayload = z.infer<typeof activityPayloadSchema>;
