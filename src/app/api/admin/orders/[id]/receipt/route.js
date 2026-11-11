import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readAdminSession } from "@/lib/adminAuth";
import { readReceiptFile } from "@/lib/receipts";

export async function GET(_request, { params }) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order?.receiptFile) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const bytes = await readReceiptFile(order.receiptFile);
  if (!bytes) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const name = order.receiptName || order.receiptFile;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": order.receiptMime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(name)}"`,
    },
  });
}
