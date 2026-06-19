import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { ActivityCard } from "@/src/components/activity-card";
import type { ActivityDetail, ActivityType } from "@/src/domain/entities/activity";
import { getActivityRepository } from "@/src/infrastructure/repositories/activity-repository";

export const metadata: Metadata = { title: "Aktivitas" };

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const session = await auth();
  const query = await searchParams;
  const type: ActivityType | undefined = query.type === "GYM" || query.type === "RUN" ? query.type : undefined;
  let activities: ActivityDetail[] = [];
  let unavailable = false;

  try {
    activities = await getActivityRepository().findByUser(session!.user!.id!, { type, limit: 100 });
  } catch {
    unavailable = true;
  }

  const filters = [
    { label: "Semua", href: "/dashboard/activities", active: !type },
    { label: "Gym", href: "/dashboard/activities?type=GYM", active: type === "GYM" },
    { label: "Lari", href: "/dashboard/activities?type=RUN", active: type === "RUN" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Riwayat pribadi</p><h1 className="page-title">Aktivitasmu</h1><p className="page-subtitle">Lihat progres tanpa menghakimi proses.</p></div>
        <Link href="/dashboard/activities/new" className="primary-action">＋ Catat aktivitas</Link>
      </header>
      <div className="filter-pills" aria-label="Filter jenis aktivitas">
        {filters.map((filter) => <Link key={filter.label} href={filter.href} className={filter.active ? "filter-active" : ""}>{filter.label}</Link>)}
      </div>
      {unavailable && <div className="error-banner">Data aktivitas belum dapat dibaca. Konfigurasi Google Sheets akan diuji nanti.</div>}
      {activities.length > 0 ? (
        <div className="grid gap-3">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
      ) : (
        <div className="empty-state"><span>{type === "RUN" ? "🏃" : type === "GYM" ? "🏋️" : "🌿"}</span><h2>Belum ada aktivitas</h2><p>{type ? `Belum ada catatan ${type === "RUN" ? "lari" : "gym"}.` : "Simpan aktivitas pertamamu dan mulai lihat pola sehatmu."}</p><Link href="/dashboard/activities/new" className="primary-action">Buat catatan pertama</Link></div>
      )}
    </div>
  );
}
