"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivityDetail } from "@/src/domain/entities/activity";

export function EditActivityForm({ activity }: { activity: ActivityDetail }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    const common = {
      activityDate: String(formData.get("activityDate")),
      durationSeconds: Number(formData.get("durationMinutes")) * 60,
      notes: String(formData.get("notes") || "") || null,
    };

    const payload = activity.activityType === "RUN"
      ? {
          ...common,
          activityType: "RUN",
          distanceMeters: Math.round(Number(formData.get("distanceKm")) * 1000),
          runType: String(formData.get("runType")),
          location: String(formData.get("location") || "") || null,
          rpe: Number(formData.get("rpe")),
          elevationGainMeters: Number(formData.get("elevationGain") || 0),
        }
      : {
          ...common,
          activityType: "GYM",
          title: String(formData.get("title")),
          location: String(formData.get("location") || "") || null,
          exercises: activity.gym.exercises.map((exercise) => ({
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            sets: exercise.sets.map((set) => ({
              reps: set.reps,
              weightKg: set.weightKg,
              rpe: set.rpe,
              completed: set.completed,
            })),
          })),
        };

    try {
      const response = await fetch(`/api/v1/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Perubahan belum berhasil disimpan.");
      router.push(`/dashboard/activities/${activity.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
      setSubmitting(false);
    }
  }

  return (
    <form action={submit} className="space-y-6">
      <section className="form-card">
        <div className="section-heading"><span>01</span><div><h2>Informasi sesi</h2><p>Perbaiki tanggal, durasi, nama, atau lokasi.</p></div></div>
        <div className="form-grid">
          <label className="field"><span>Tanggal</span><input name="activityDate" type="date" defaultValue={activity.activityDate} required /></label>
          <label className="field"><span>Durasi (menit)</span><input name="durationMinutes" type="number" min="1" max="1440" defaultValue={Math.round(activity.durationSeconds / 60)} required /></label>
          {activity.activityType === "RUN" ? (
            <>
              <label className="field field-wide"><span>Jenis lari</span><select name="runType" defaultValue={activity.run.runType}><option>Easy Run</option><option>Tempo Run</option><option>Interval</option><option>Long Run</option><option>Recovery Run</option><option>Treadmill</option></select></label>
              <label className="field"><span>Jarak (km)</span><input name="distanceKm" type="number" min="0.1" max="250" step="0.01" defaultValue={activity.run.distanceMeters / 1000} required /></label>
              <label className="field"><span>RPE</span><input name="rpe" type="number" min="1" max="10" defaultValue={activity.run.rpe ?? 6} required /></label>
              <label className="field field-wide"><span>Elevation gain</span><input name="elevationGain" type="number" min="0" max="20000" defaultValue={activity.run.elevationGainMeters ?? 0} /></label>
            </>
          ) : (
            <label className="field field-wide"><span>Nama sesi</span><input name="title" defaultValue={activity.gym.title} minLength={2} maxLength={80} required /></label>
          )}
          <label className="field field-wide"><span>Lokasi</span><input name="location" defaultValue={(activity.activityType === "RUN" ? activity.run.location : activity.gym.location) ?? ""} maxLength={100} /></label>
        </div>
      </section>

      {activity.activityType === "GYM" && (
        <div className="rounded-2xl border border-[#dcebb2] bg-[#f7fbe8] p-4 text-sm leading-6 text-[#526900]">
          Gerakan dan set dipertahankan persis seperti catatan awal. Editor detail set akan dibuat pada iterasi berikutnya agar perubahan tidak merusak histori latihan.
        </div>
      )}

      <section className="form-card">
        <div className="section-heading"><span>02</span><div><h2>Catatan</h2><p>Perbarui insight dari sesi ini.</p></div></div>
        <label className="field"><span>Catatan</span><textarea name="notes" rows={4} maxLength={300} defaultValue={activity.notes ?? ""} /></label>
      </section>

      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="sticky-submit"><button type="submit" className="primary-action w-full sm:w-auto" disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan perubahan"}</button></div>
    </form>
  );
}
