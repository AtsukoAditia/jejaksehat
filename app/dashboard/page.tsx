import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

const quickActions = [
  {
    title: "Catat Gym",
    description: "Simpan sesi, gerakan, set, repetisi, dan beban latihan.",
  },
  {
    title: "Catat Lari",
    description: "Rekam jarak, durasi, pace, lokasi, dan intensitas lari.",
  },
  {
    title: "Update Progress",
    description: "Pantau berat badan, body fat, dan lingkar pinggang.",
  },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const displayName = session.user.name ?? "Pengguna JejakSehat";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(20,92,56,0.1)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-2xl font-black text-white">
              {initial}
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--primary-strong)]">
                Dashboard JejakSehat
              </p>
              <h1 className="text-2xl font-black tracking-tight">
                Halo, {displayName}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {session.user.email}
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-2xl border border-[var(--border)] px-5 py-3 font-bold transition hover:bg-emerald-50 sm:w-auto"
            >
              Keluar
            </button>
          </form>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] bg-[var(--primary)] p-7 text-white sm:p-9">
            <p className="text-sm font-bold text-emerald-100">Minggu ini</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">
              Mulai tinggalkan jejak pertamamu.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-emerald-50">
              Authentication sudah aktif. Pencatatan gym, lari, dan progress tubuh akan dibangun pada fase berikutnya.
            </p>
          </article>

          <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-9">
            <p className="text-sm font-bold text-[var(--primary-strong)]">
              Identitas internal
            </p>
            <p className="mt-4 break-all rounded-2xl bg-emerald-50 p-4 font-mono text-sm text-[var(--primary-strong)]">
              {session.user.id}
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              UUID ini berasal dari penyimpanan aplikasi, bukan email atau ID yang dikirim browser.
            </p>
          </article>
        </section>

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-sm font-bold text-[var(--primary-strong)]">
              Aksi cepat
            </p>
            <h2 className="mt-1 text-2xl font-black">Segera tersedia</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <article
                key={action.title}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 font-black text-[var(--primary-strong)]">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-xl font-bold">{action.title}</h3>
                <p className="mt-2 leading-7 text-[var(--muted)]">
                  {action.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
