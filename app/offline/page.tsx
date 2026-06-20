import type { Metadata } from "next";
import { OfflineActions } from "@/src/components/offline-actions";

export const metadata: Metadata = { title: "Kamu Offline" };

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-[var(--border)] bg-white p-7 text-center shadow-xl sm:p-9">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl font-black text-[var(--primary-strong)]">
          J+
        </div>
        <p className="eyebrow mt-6">Mode offline</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Koneksi sedang terputus.
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Halaman publik tetap tersedia, tetapi data latihan dan progress pribadi tidak disimpan ke cache perangkat. Sambungkan internet untuk membaca atau mencatat data terbaru.
        </p>
        <OfflineActions />
      </section>
    </main>
  );
}
