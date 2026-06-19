import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Masuk",
};

const errorMessages: Record<string, string> = {
  AccessDenied: "Akun Google tidak dapat digunakan untuk masuk.",
  Configuration: "Konfigurasi login belum lengkap. Hubungi pengelola aplikasi.",
  OAuthCallbackError: "Google tidak dapat menyelesaikan proses login.",
  OAuthSignin: "Permintaan login ke Google gagal dibuat.",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? "Login gagal. Silakan coba kembali.")
    : null;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_24px_80px_rgba(20,92,56,0.14)] sm:p-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white">
            J
          </span>
          <span>
            <strong className="block tracking-tight">JejakSehat</strong>
            <span className="text-xs text-[var(--muted)]">
              Catat. Pantau. Bertumbuh.
            </span>
          </span>
        </Link>

        <div className="mt-10">
          <p className="text-sm font-bold text-[var(--primary-strong)]">
            Selamat datang
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">
            Masuk dan lanjutkan progresmu.
          </h1>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            Gunakan akun Google untuk mengakses catatan gym, lari, dan perkembangan tubuhmu.
          </p>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        ) : null}

        <form
          className="mt-7"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--primary)] px-5 py-4 font-bold text-white transition hover:bg-[var(--primary-strong)] focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
              <path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.37Z" />
              <path d="M12 22c2.7 0 4.97-.9 6.63-2.4l-3.24-2.52c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z" />
              <path d="M6.39 13.91A6 6 0 0 1 6.07 12c0-.66.11-1.3.32-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.13 1.04 4.51l3.35-2.6Z" />
              <path d="M12 5.96c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6C7.18 7.72 9.39 5.96 12 5.96Z" />
            </svg>
            Lanjutkan dengan Google
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">
          JejakSehat hanya menggunakan identitas dasar akun untuk login. Password Google tidak pernah diterima atau disimpan aplikasi.
        </p>
      </section>
    </main>
  );
}
