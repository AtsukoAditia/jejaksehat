import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid");
const optionalNumber = z.number().finite().optional().nullable();

export const bodyMeasurementPayloadSchema = z.object({
  measuredAt: dateSchema,
  weightKg: z.number().finite().min(25).max(400),
  bodyFatPercent: optionalNumber.refine((value) => value == null || (value >= 1 && value <= 75), "Body fat harus 1–75%"),
  waistCm: optionalNumber.refine((value) => value == null || (value >= 30 && value <= 300), "Lingkar pinggang harus 30–300 cm"),
  notes: z.string().trim().max(300).optional().nullable(),
});

export const goalPayloadSchema = z.discriminatedUnion("goalType", [
  z.object({
    goalType: z.literal("WEEKLY_WORKOUTS"),
    targetValue: z.number().int().min(1).max(21),
    unit: z.literal("sesi").default("sesi"),
    periodType: z.literal("WEEKLY").default("WEEKLY"),
    startDate: dateSchema,
    endDate: dateSchema.optional().nullable(),
    isActive: z.boolean().optional().default(true),
  }),
  z.object({
    goalType: z.literal("WEEKLY_RUNNING_DISTANCE"),
    targetValue: z.number().min(0.5).max(500),
    unit: z.literal("km").default("km"),
    periodType: z.literal("WEEKLY").default("WEEKLY"),
    startDate: dateSchema,
    endDate: dateSchema.optional().nullable(),
    isActive: z.boolean().optional().default(true),
  }),
  z.object({
    goalType: z.literal("TARGET_WEIGHT"),
    targetValue: z.number().min(25).max(400),
    unit: z.literal("kg").default("kg"),
    periodType: z.literal("ONGOING").default("ONGOING"),
    startDate: dateSchema,
    endDate: dateSchema.optional().nullable(),
    isActive: z.boolean().optional().default(true),
  }),
]);

export type BodyMeasurementPayload = z.infer<typeof bodyMeasurementPayloadSchema>;
export type GoalPayload = z.infer<typeof goalPayloadSchema>;
