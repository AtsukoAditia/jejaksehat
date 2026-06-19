import type { Metadata } from "next";
import Link from "next/link";
import { ActivityForm } from "@/src/components/activity-form";

export const metadata: Metadata = { title: "Catat Aktivitas" };

export default function NewActivityPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/dashboard/activities" className="back-link">← Kembali ke aktivitas</Link>
        <p className="eyebrow mt-5">Catatan baru</p>
        <h1 className="page-title">Tinggalkan jejak hari ini.</h1>
        <p className="page-subtitle max-w-2xl">Pilih gym atau lari. Form dibuat singkat agar pencatatan tidak mengganggu momentum latihan.</p>
      </header>
      <ActivityForm />
    </div>
  );
}
