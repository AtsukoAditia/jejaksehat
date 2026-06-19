"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormType = "GYM" | "RUN";
interface ExerciseDraft {
  exerciseName: string;
  muscleGroup: string;
  setCount: number;
  reps: number;
  weightKg: number;
  rpe: number;
}

const today = new Date().toISOString().slice(0, 10);
const muscleGroups = ["Dada", "Punggung", "Kaki", "Bahu", "Lengan", "Core", "Full Body"];

export function ActivityForm() {
  const router = useRouter();
  const [type, setType] = useState<FormType>("GYM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseDraft[]>([
    { exerciseName: "", muscleGroup: "Dada", setCount: 3, reps: 10, weightKg: 0, rpe: 7 },
  ]);

  function updateExercise(index: number, field: keyof ExerciseDraft, value: string) {
    setExercises((current) => current.map((item, itemIndex) =>
      itemIndex === index
        ? { ...item, [field]: field === "exerciseName" || field === "muscleGroup" ? value : Number(value) }
        : item,
    ));
  }

  async function submit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    const durationSeconds = Number(formData.get("durationMinutes")) * 60;
    const common = {
      activityType: type,
      activityDate: String(formData.get("activityDate")),
      durationSeconds,
      notes: String(formData.get("notes") || "") || null,
    };

    const payload = type === "GYM"
      ? {
          ...common,
          activityType: "GYM",
          title: String(formData.get("title")),
          location: String(formData.get("location") || "") || null,
          exercises: exercises.map((exercise) => ({
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            sets: Array.from({ length: exercise.setCount }, () => ({
              reps: exercise.reps,
              weightKg: exercise.weightKg,
              rpe: exercise.rpe,
              completed: true,
            })),
          })),
        }
      : {
          ...common,
          activityType: "RUN",
          distanceMeters: Math.round(Number(formData.get("distanceKm")) * 1000),
          runType: String(formData.get("runType")),
          location: String(formData.get("location") || "") || null,
          rpe: Number(formData.get("runRpe")),
          elevationGainMeters: Number(formData.get("elevationGain") || 0),
        };

    try {
      const response = await fetch("/api/v1/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Aktivitas belum berhasil disimpan.");
      router.push(`/dashboard/activities/${result.data.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
      setSubmitting(false);
    }
  }

  return (
    <form action={submit} className="space-y-6">
      <div className="segmented-control" role="tablist" aria-label="Jenis aktivitas">
        <button type="button" onClick={() => setType("GYM")} className={type === "GYM" ? "segmented-active" : ""}>🏋️ Gym</button>
        <button type="button" onClick={() => setType("RUN")} className={type === "RUN" ? "segmented-active" : ""}>🏃 Lari</button>
      </div>

      <section className="form-card">
        <div className="section-heading"><span>01</span><div><h2>Informasi dasar</h2><p>Kapan dan berapa lama kamu bergerak?</p></div></div>
        <div className="form-grid">
          <label className="field"><span>Tanggal</span><input name="activityDate" type="date" defaultValue={today} required /></label>
          <label className="field"><span>Durasi (menit)</span><input name="durationMinutes" type="number" min="1" max="1440" defaultValue="60" required inputMode="numeric" /></label>
          {type === "GYM" ? (
            <label className="field field-wide"><span>Nama sesi</span><input name="title" placeholder="Contoh: Push Day" minLength={2} maxLength={80} required /></label>
          ) : (
            <label className="field field-wide"><span>Jenis lari</span><select name="runType" defaultValue="Easy Run"><option>Easy Run</option><option>Tempo Run</option><option>Interval</option><option>Long Run</option><option>Recovery Run</option><option>Treadmill</option></select></label>
          )}
          <label className="field field-wide"><span>Lokasi <small>opsional</small></span><input name="location" placeholder={type === "GYM" ? "Nama gym" : "Taman, stadion, treadmill"} maxLength={100} /></label>
        </div>
      </section>

      {type === "GYM" ? (
        <section className="form-card">
          <div className="section-heading"><span>02</span><div><h2>Gerakan latihan</h2><p>Mulai sederhana. Detail set bisa diedit lagi nanti.</p></div></div>
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={index} className="exercise-editor">
                <div className="flex items-center justify-between"><strong>Gerakan {index + 1}</strong>{exercises.length > 1 && <button type="button" className="text-sm font-bold text-rose-600" onClick={() => setExercises((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Hapus</button>}</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="field"><span>Nama gerakan</span><input value={exercise.exerciseName} onChange={(event) => updateExercise(index, "exerciseName", event.target.value)} placeholder="Bench Press" required /></label>
                  <label className="field"><span>Kelompok otot</span><select value={exercise.muscleGroup} onChange={(event) => updateExercise(index, "muscleGroup", event.target.value)}>{muscleGroups.map((group) => <option key={group}>{group}</option>)}</select></label>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <label className="field"><span>Set</span><input type="number" min="1" max="12" value={exercise.setCount} onChange={(event) => updateExercise(index, "setCount", event.target.value)} required /></label>
                  <label className="field"><span>Repetisi</span><input type="number" min="1" max="200" value={exercise.reps} onChange={(event) => updateExercise(index, "reps", event.target.value)} required /></label>
                  <label className="field"><span>Beban kg</span><input type="number" min="0" max="1000" step="0.25" value={exercise.weightKg} onChange={(event) => updateExercise(index, "weightKg", event.target.value)} required /></label>
                  <label className="field"><span>RPE</span><input type="number" min="1" max="10" value={exercise.rpe} onChange={(event) => updateExercise(index, "rpe", event.target.value)} required /></label>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="secondary-action mt-4" onClick={() => setExercises((items) => [...items, { exerciseName: "", muscleGroup: "Full Body", setCount: 3, reps: 10, weightKg: 0, rpe: 7 }])}>＋ Tambah gerakan</button>
        </section>
      ) : (
        <section className="form-card">
          <div className="section-heading"><span>02</span><div><h2>Detail lari</h2><p>Jarak dan durasi akan digunakan untuk menghitung pace.</p></div></div>
          <div className="form-grid">
            <label className="field"><span>Jarak (km)</span><input name="distanceKm" type="number" min="0.1" max="250" step="0.01" placeholder="5.00" required inputMode="decimal" /></label>
            <label className="field"><span>RPE (1–10)</span><input name="runRpe" type="number" min="1" max="10" defaultValue="6" required /></label>
            <label className="field field-wide"><span>Elevation gain (meter) <small>opsional</small></span><input name="elevationGain" type="number" min="0" max="20000" defaultValue="0" /></label>
          </div>
        </section>
      )}

      <section className="form-card">
        <div className="section-heading"><span>03</span><div><h2>Catatan</h2><p>Simpan insight kecil untuk sesi berikutnya.</p></div></div>
        <label className="field"><span>Catatan <small>opsional</small></span><textarea name="notes" rows={4} maxLength={300} placeholder="Energi bagus, tambah beban minggu depan..." /></label>
      </section>

      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="sticky-submit"><button type="submit" className="primary-action w-full sm:w-auto" disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan aktivitas"}</button></div>
    </form>
  );
}
