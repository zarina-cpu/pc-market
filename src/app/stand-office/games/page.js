import { redirect } from "next/navigation";
import { adminPath, readAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import AdminGames from "@/components/admin/AdminGames";

export const dynamic = "force-dynamic";

export default async function OfficeGamesPage() {
  const base = `/${adminPath()}`;
  if (!(await readAdminSession())) {
    redirect(`${base}/login`);
  }
  const games = await prisma.game.findMany({ orderBy: { nameRu: "asc" } });
  return (
    <AdminShell base={base} current="games">
      <AdminGames games={games} />
    </AdminShell>
  );
}
