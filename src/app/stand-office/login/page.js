import { redirect } from "next/navigation";
import { adminPath, readAdminSession } from "@/lib/adminAuth";
import AdminLogin from "@/components/admin/AdminLogin";

export const dynamic = "force-dynamic";

export default async function OfficeLoginPage() {
  const base = `/${adminPath()}`;
  if (await readAdminSession()) {
    redirect(base);
  }
  return <AdminLogin nextPath={base} />;
}
