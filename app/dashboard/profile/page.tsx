import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserRepository } from "@/src/infrastructure/repositories/user-repository";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userRepo = getUserRepository();
  const user = await userRepo.findByGoogleSubject(session.user.id);

  return (
    <>
      <p className="eyebrow">Profil</p>
      <h1 className="page-title">Profil kamu</h1>
      <p className="page-subtitle">
        {user
          ? `Masuk sebagai ${user.name ?? user.email}. Pengaturan profil akan tersedia segera.`
          : "Pengaturan profil akan tersedia segera."}
      </p>
    </>
  );
}