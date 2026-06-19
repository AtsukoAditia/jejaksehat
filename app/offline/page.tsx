export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-[var(--border)] bg-white p-8 text-center shadow-xl">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-100 text-2xl font-black text-[var(--primary-strong)]">
          J
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Kamu sedang offline</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          JejakSehat belum dapat mengambil data terbaru. Periksa koneksi internet,
          lalu buka kembali halaman yang dibutuhkan.
        </p>
        <a
          href="/"
          className="mt-7 inline-flex rounded-2xl bg-[var(--primary)] px-6 py-3 font-bold text-white"
        >
          Kembali ke beranda
        </a>
      </section>
    </main>
  );
}
