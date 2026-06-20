"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteMeasurementButton({ measurementId }: { measurementId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("Hapus pengukuran ini dari riwayat?")) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/body-measurements/${measurementId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Pengukuran belum berhasil dihapus.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <button type="button" className="measurement-delete" onClick={remove} disabled={deleting}>{deleting ? "Menghapus..." : "Hapus"}</button>
      {error && <p className="mt-1 text-xs font-bold text-rose-600" role="alert">{error}</p>}
    </div>
  );
}
