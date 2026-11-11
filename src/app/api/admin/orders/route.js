import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readAdminSession } from "@/lib/adminAuth";

export async function GET() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ orders });
}
