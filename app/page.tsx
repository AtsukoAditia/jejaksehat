import Link from "next/link";
import { auth } from "@/auth";

const features = [
  {
    title: "Catatan Gym",
    description: "Rekam sesi, gerakan, set, repetisi, beban, dan RPE secara terstruktur.",
  },
  {
    title: "Aktivitas Lari",
    description: "Simpan jarak dan durasi, lalu biarkan aplikasi menghitung pace secara konsisten.",
  },
  {
    title: "Progress Tubuh",
    description: "Pantau berat badan, body fat, lingkar pinggang, dan target kesehatan.",
  },
];

export default async function HomePage() {
  const session = await auth();
  const authenticated = Boolean(session?.user?.id);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_rgba(20,92,56,0.12)]">
        <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white">
              J
            </span>
            <div>
              <p className="font-bold tracking-tight">JejakSehat</p>
              <p className="text-xs text-[var(--muted)]">Catat. Pantau. Bertumbuh.</p>
            </div>
          </div>
          <span className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">
            Authentication v0.2
          </span>
        </header>

        <section className="grid flex-1 gap-12 px-6 py-14 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-16 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-5 w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-[var(--primary-strong)]">
              PWA untuk gym dan lari
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Setiap progres meninggalkan jejak.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              JejakSehat membantu kamu mencatat latihan gym, aktivitas lari,
              perkembangan tubuh, dan target mingguan dalam satu aplikasi yang
              ringan dan nyaman digunakan dari ponsel.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={authenticated ? "/dashboard" : "/login"}
                className="rounded-2xl bg-[var(--primary)] px-6 py-4 text-center font-bold text-white transition hover:bg-[var(--primary-strong)]"
              >
                {authenticated ? "Buka Dashboard" : "Masuk dengan Google"}
              </Link>
              <a
                href="/api/v1/health"
                className="rounded-2xl border border-[var(--border)] px-6 py-4 text-center font-bold"
              >
                Periksa API
              </a>
            </div>
          </div>

          <div className="grid content-center gap-4">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-[var(--border)] bg-[#fbfdfb] p-6"
              >
                <div className="mb-5 grid size-10 place-items-center rounded-xl bg-emerald-100 font-black text-[var(--primary-strong)]">
                  {index + 1}
                </div>
                <h2 className="text-xl font-bold">{feature.title}</h2>
                <p className="mt-2 leading-7 text-[var(--muted)]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
