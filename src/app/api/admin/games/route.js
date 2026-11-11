import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCatalog } from "@/lib/catalogData";
import { readAdminSession } from "@/lib/adminAuth";

async function guard() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const games = await prisma.game.findMany({ orderBy: { nameRu: "asc" } });
  return NextResponse.json({ games });
}

export async function POST(request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  if (!slug || !body.nameRu || !body.nameUz) {
    return NextResponse.json({ ok: false, error: "fields" }, { status: 400 });
  }
  const cpuWeight = Number(body.cpuWeight);
  const gpuWeight = Number(body.gpuWeight);
  if (!(cpuWeight >= 0) || !(gpuWeight >= 0) || cpuWeight + gpuWeight <= 0) {
    return NextResponse.json({ ok: false, error: "weights" }, { status: 400 });
  }
  invalidateCatalog();
  const game = await prisma.game.create({
    data: {
      slug,
      nameRu: String(body.nameRu).trim(),
      nameUz: String(body.nameUz).trim(),
      cpuWeight,
      gpuWeight,
      baseFps: Math.max(10, Number(body.baseFps) || 70),
      vramLow: Math.max(2, Number(body.vramLow) || 6),
      vramMed: Math.max(2, Number(body.vramMed) || 8),
      vramHigh: Math.max(2, Number(body.vramHigh) || 10),
      vramUltra: Math.max(2, Number(body.vramUltra) || 12),
    },
  });
  return NextResponse.json({ ok: true, game });
}
