"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BodyMeasurement } from "@/src/domain/entities/progress";

export function BodyMeasurementForm({ measurement }: { measurement?: BodyMeasurement }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    const bodyFatRaw = String(formData.get("bodyFatPercent") || "").trim();
    const waistRaw = String(formData.get("waistCm") || "").trim();
    const payload = {
      measuredAt: String(formData.get("measuredAt")),
      weightKg: Number(formData.get("weightKg")),
      bodyFatPercent: bodyFatRaw ? Number(bodyFatRaw) : null,
      waistCm: waistRaw ? Number(waistRaw) : null,
      notes: String(formData.get("notes") || "") || null,
    };

    try {
      const response = await fetch(
        measurement ? `/api/v1/body-measurements/${measurement.id}` : "/api/v1/body-measurements",
        {
          method: measurement ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Pengukuran belum berhasil disimpan.");
      router.push("/dashboard/progress");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
      setSubmitting(false);
    }
  }

  return (
    <form action={submit} className="space-y-6">
      <section className="form-card">
        <div className="section-heading"><span>01</span><div><h2>Pengukuran utama</h2><p>Gunakan kondisi dan waktu yang konsisten agar tren lebih akurat.</p></div></div>
        <div className="form-grid">
          <label className="field"><span>Tanggal pengukuran</span><input name="measuredAt" type="date" defaultValue={measurement?.measuredAt ?? today} required /></label>
          <label className="field"><span>Berat badan (kg)</span><input name="weightKg" type="number" min="25" max="400" step="0.01" defaultValue={measurement?.weightKg ?? ""} placeholder="65.50" required inputMode="decimal" /></label>
          <label className="field"><span>Body fat (%) <small>opsional</small></span><input name="bodyFatPercent" type="number" min="1" max="75" step="0.01" defaultValue={measurement?.bodyFatPercent ?? ""} placeholder="18.5" inputMode="decimal" /></label>
          <label className="field"><span>Lingkar pinggang (cm) <small>opsional</small></span><input name="waistCm" type="number" min="30" max="300" step="0.01" defaultValue={measurement?.waistCm ?? ""} placeholder="82" inputMode="decimal" /></label>
        </div>
      </section>

      <section className="form-card">
        <div className="section-heading"><span>02</span><div><h2>Catatan kondisi</h2><p>Contoh: pagi hari, sebelum makan, setelah rest day.</p></div></div>
        <label className="field"><span>Catatan <small>opsional</small></span><textarea name="notes" rows={4} maxLength={300} defaultValue={measurement?.notes ?? ""} placeholder="Tidur cukup, pengukuran pagi hari..." /></label>
      </section>

      <div className="measurement-tip"><span aria-hidden="true">◎</span><p>Angka harian dapat naik turun. Fokus pada kecenderungan beberapa minggu, bukan satu pengukuran.</p></div>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="sticky-submit"><button type="submit" className="primary-action w-full sm:w-auto" disabled={submitting}>{submitting ? "Menyimpan..." : measurement ? "Simpan perubahan" : "Simpan pengukuran"}</button></div>
    </form>
  );
}
