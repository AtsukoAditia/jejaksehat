import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { BodyMeasurementForm } from "@/src/components/body-measurement-form";
import { getProgressRepository } from "@/src/infrastructure/repositories/progress-repository";

export const metadata: Metadata = { title: "Edit Pengukuran" };

interface PageProps { params: Promise<{ id: string }> }

export default async function EditMeasurementPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  let measurement = null;

  try {
    measurement = await getProgressRepository().findMeasurementById(id, session!.user!.id!);
  } catch {
    notFound();
  }
  if (!measurement) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/dashboard/progress" className="back-link">← Kembali ke progress</Link>
        <p className="eyebrow mt-5">Koreksi data</p>
        <h1 className="page-title">Edit pengukuran</h1>
        <p className="page-subtitle">Perubahan hanya berlaku pada catatan milikmu.</p>
      </header>
      <BodyMeasurementForm measurement={measurement} />
    </div>
  );
}
