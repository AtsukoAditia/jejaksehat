import type { Metadata } from "next";
import Link from "next/link";
import { BodyMeasurementForm } from "@/src/components/body-measurement-form";

export const metadata: Metadata = { title: "Catat Pengukuran" };

export default function NewMeasurementPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/dashboard/progress" className="back-link">← Kembali ke progress</Link>
        <p className="eyebrow mt-5">Baseline dan tren</p>
        <h1 className="page-title">Catat kondisi tubuh.</h1>
        <p className="page-subtitle max-w-2xl">Gunakan waktu pengukuran yang konsisten. Berat badan wajib, data lain opsional.</p>
      </header>
      <BodyMeasurementForm />
    </div>
  );
}
