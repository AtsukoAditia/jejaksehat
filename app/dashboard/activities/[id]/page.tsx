import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DeleteActivityButton } from "@/src/components/delete-activity-button";
import type { ActivityDetail } from "@/src/domain/entities/activity";
import { getActivityRepository } from "@/src/infrastructure/repositories/activity-repository";
import { formatDistance, formatDuration, formatPace, gymVolume } from "@/src/lib/activity-metrics";

export const metadata: Metadata = { title: "Detail Aktivitas" };

interface PageProps { params: Promise<{ id: string }> }

export default async function ActivityDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  let activity: ActivityDetail | null = null;

  try {
    activity = await getActivityRepository().findById(id, session!.user!.id!);
  } catch {
    notFound();
  }
  if (!activity) notFound();

  const title = activity.activityType === "RUN" ? activity.run.runType : activity.gym.title;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/dashboard/activities" className="back-link">← Kembali ke aktivitas</Link>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">{activity.activityType === "RUN" ? "Catatan lari" : "Catatan gym"}</p><h1 className="page-title">{title}</h1><p className="page-subtitle">{new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(`${activity.activityDate}T00:00:00`))}</p></div>
          <DeleteActivityButton activityId={activity.id} />
        </div>
      </header>

      <section className={`detail-hero ${activity.activityType === "RUN" ? "detail-hero-run" : "detail-hero-gym"}`}>
        <span className="hero-kicker">RINGKASAN SESI</span>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><small>Durasi</small><strong>{formatDuration(activity.durationSeconds)}</strong></div>
          {activity.activityType === "RUN" ? (
            <>
              <div><small>Jarak</small><strong>{formatDistance(activity.run.distanceMeters)}</strong></div>
              <div><small>Pace</small><strong>{formatPace(activity.durationSeconds, activity.run.distanceMeters)}</strong></div>
              <div><small>RPE</small><strong>{activity.run.rpe ?? "—"}</strong></div>
            </>
          ) : (
            <>
              <div><small>Gerakan</small><strong>{activity.gym.exercises.length}</strong></div>
              <div><small>Total set</small><strong>{activity.gym.exercises.reduce((total, item) => total + item.sets.length, 0)}</strong></div>
              <div><small>Volume</small><strong>{Math.round(gymVolume(activity)).toLocaleString("id-ID")} kg</strong></div>
            </>
          )}
        </div>
      </section>

      {activity.activityType === "RUN" ? (
        <section className="form-card">
          <div className="section-title-row"><div><p className="eyebrow">Detail rute</p><h2>Data lari</h2></div></div>
          <dl className="detail-list"><div><dt>Jenis</dt><dd>{activity.run.runType}</dd></div><div><dt>Lokasi</dt><dd>{activity.run.location || "—"}</dd></div><div><dt>Elevation gain</dt><dd>{activity.run.elevationGainMeters ?? 0} m</dd></div><div><dt>Intensitas</dt><dd>RPE {activity.run.rpe ?? "—"}</dd></div></dl>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="section-title-row"><div><p className="eyebrow">Rangkaian latihan</p><h2>Gerakan dan set</h2></div></div>
          {activity.gym.exercises.map((exercise) => (
            <article className="exercise-detail" key={exercise.id}>
              <div><h3>{exercise.exerciseName}</h3><p>{exercise.muscleGroup}</p></div>
              <div className="overflow-x-auto"><table><thead><tr><th>Set</th><th>Reps</th><th>Beban</th><th>RPE</th></tr></thead><tbody>{exercise.sets.map((set) => <tr key={set.id}><td>{set.setNumber}</td><td>{set.reps}</td><td>{set.weightKg} kg</td><td>{set.rpe ?? "—"}</td></tr>)}</tbody></table></div>
            </article>
          ))}
        </section>
      )}

      {activity.notes && <section className="note-card"><span aria-hidden="true">✦</span><div><p className="eyebrow">Catatan sesi</p><p>{activity.notes}</p></div></section>}
    </div>
  );
}
