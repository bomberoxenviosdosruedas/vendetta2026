import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-admin";
import { getAdminUsers } from "@/lib/actions/admin-user.actions";
import {
  getRoomConfigurations,
  getTroopConfigurations,
  getTrainingConfigurations,
} from "@/lib/data";
import { UserAdminView } from "@/components/admin/users/user-admin-view";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    redirect("/admin");
  }

  const [lista, habitaciones, tropas, entrenamientos] = await Promise.all([
    getAdminUsers(),
    getRoomConfigurations(),
    getTroopConfigurations(),
    getTrainingConfigurations(),
  ]);

  return (
    <UserAdminView
      users={lista}
      roomOptions={habitaciones.map((r) => ({ id: r.id, nombre: r.nombre }))}
      troopOptions={tropas.map((t) => ({ id: t.id, nombre: t.nombre }))}
      trainingOptions={entrenamientos.map((t) => ({ id: t.id, nombre: t.nombre }))}
    />
  );
}