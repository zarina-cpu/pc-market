import { redirect } from "next/navigation";
import { adminPath, readAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import AdminOrders from "@/components/admin/AdminOrders";

export const dynamic = "force-dynamic";

export default async function OfficeOrdersPage() {
  const base = `/${adminPath()}`;
  if (!(await readAdminSession())) {
    redirect(`${base}/login`);
  }
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <AdminShell base={base} current="orders">
      <AdminOrders orders={orders} />
    </AdminShell>
  );
}
