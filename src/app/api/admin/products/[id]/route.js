import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCatalog } from "@/lib/catalogData";
import { readAdminSession } from "@/lib/adminAuth";

export async function PATCH(request, { params }) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const data = {};
  if (body.priceUzs !== undefined) data.priceUzs = Math.max(0, Number(body.priceUzs) || 0);
  if (body.stock !== undefined) data.stock = Math.max(0, Number(body.stock) || 0);
  if (body.nameRu !== undefined) data.nameRu = String(body.nameRu);
  if (body.nameUz !== undefined) data.nameUz = String(body.nameUz);
  if (body.specs !== undefined) {
    const specs = typeof body.specs === "string" ? body.specs : JSON.stringify(body.specs);
    try {
      JSON.parse(specs);
    } catch {
      return NextResponse.json({ ok: false, error: "specs" }, { status: 400 });
    }
    data.specs = specs;
  }
  invalidateCatalog();
  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ ok: true, product });
}
