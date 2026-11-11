import { redirect } from "next/navigation";
import { adminPath, readAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import AdminProducts from "@/components/admin/AdminProducts";

export const dynamic = "force-dynamic";

export default async function OfficeHomePage() {
  const base = `/${adminPath()}`;
  if (!(await readAdminSession())) {
    redirect(`${base}/login`);
  }
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { nameRu: "asc" }],
  });
  return (
    <AdminShell base={base} current="products">
      <AdminProducts products={products} />
    </AdminShell>
  );
}
