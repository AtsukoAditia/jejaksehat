"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteActivityButton({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("Hapus aktivitas ini? Data akan disembunyikan dari riwayat.")) return;
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/activities/${activityId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Aktivitas belum berhasil dihapus.");
      router.push("/dashboard/activities");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <button type="button" className="danger-action" onClick={remove} disabled={deleting}>
        {deleting ? "Menghapus..." : "Hapus aktivitas"}
      </button>
      {error && <p className="mt-2 text-sm font-bold text-rose-600" role="alert">{error}</p>}
    </div>
  );
}
