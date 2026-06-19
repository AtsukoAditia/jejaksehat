import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { EditActivityForm } from "@/src/components/edit-activity-form";
import { getActivityRepository } from "@/src/infrastructure/repositories/activity-repository";

export const metadata: Metadata = { title: "Edit Aktivitas" };

interface PageProps { params: Promise<{ id: string }> }

export default async function EditActivityPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  let activity = null;

  try {
    activity = await getActivityRepository().findById(id, session!.user!.id!);
  } catch {
    notFound();
  }
  if (!activity) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href={`/dashboard/activities/${activity.id}`} className="back-link">← Kembali ke detail</Link>
        <p className="eyebrow mt-5">Perbarui catatan</p>
        <h1 className="page-title">Edit aktivitas</h1>
        <p className="page-subtitle">Perubahan hanya berlaku pada aktivitas milikmu.</p>
      </header>
      <EditActivityForm activity={activity} />
    </div>
  );
}
