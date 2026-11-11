import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCatalog } from "@/lib/catalogData";
import { readAdminSession } from "@/lib/adminAuth";
import { CATEGORIES } from "@/lib/categories";

async function guard() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { nameRu: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  if (!CATEGORIES.includes(body.category)) {
    return NextResponse.json({ ok: false, error: "category" }, { status: 400 });
  }
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  if (!slug || !body.nameRu || !body.nameUz) {
    return NextResponse.json({ ok: false, error: "fields" }, { status: 400 });
  }
  let specs = body.specs;
  if (typeof specs === "object") specs = JSON.stringify(specs);
  try {
    JSON.parse(specs || "{}");
  } catch {
    return NextResponse.json({ ok: false, error: "specs" }, { status: 400 });
  }
  invalidateCatalog();
  const product = await prisma.product.create({
    data: {
      slug,
      category: body.category,
      brand: String(body.brand || "").trim() || "Generic",
      nameRu: String(body.nameRu).trim(),
      nameUz: String(body.nameUz).trim(),
      descriptionRu: String(body.descriptionRu || "").trim(),
      descriptionUz: String(body.descriptionUz || "").trim(),
      priceUzs: Math.max(0, Number(body.priceUzs) || 0),
      stock: Math.max(0, Number(body.stock) || 0),
      specs: specs || "{}",
    },
  });
  return NextResponse.json({ ok: true, product });
}
