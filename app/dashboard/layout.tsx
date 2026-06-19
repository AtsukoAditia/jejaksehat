import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth, signOut } from "@/auth";
import { DesktopNavigation, MobileNavigation } from "@/src/components/app-navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const displayName = session.user.name ?? "Pengguna JejakSehat";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden min-h-screen border-r border-[var(--border)] bg-white/90 p-6 backdrop-blur-xl lg:sticky lg:top-0 lg:block lg:h-screen">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white shadow-[0_10px_25px_rgba(13,148,104,.25)]">J</span>
          <span><strong className="block text-lg leading-5">JejakSehat</strong><small className="text-[var(--muted)]">Gerak. Catat. Tumbuh.</small></span>
        </Link>
        <div className="mt-10"><DesktopNavigation /></div>
        <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] font-black text-[var(--primary-strong)]">{initial}</span>
            <div className="min-w-0"><p className="truncate text-sm font-extrabold">{displayName}</p><p className="truncate text-xs text-[var(--muted)]">{session.user.email}</p></div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="mt-4 min-h-11 w-full rounded-2xl border border-[var(--border)] text-sm font-bold transition hover:bg-white" type="submit">Keluar</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-7 lg:px-10 lg:pb-10 lg:pt-8"><div className="mx-auto max-w-6xl">{children}</div></main>
      <MobileNavigation />
    </div>
  );
}
