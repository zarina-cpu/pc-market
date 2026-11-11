import { PrismaClient } from "@prisma/client";
import { checkCompatibility } from "../src/lib/compatibility.js";
import { estimateGameFps } from "../src/lib/fps.js";

const prisma = new PrismaClient();

function bySlug(products) {
  return Object.fromEntries(products.map((p) => [p.slug, p]));
}

const products = await prisma.product.findMany();
const games = await prisma.game.findMany();
const p = bySlug(products);

const conflict = checkCompatibility({
  cpu: p["ryzen-7-7800x3d"],
  motherboard: p["b550-steel"],
});
if (!conflict.errors.some((e) => e.code === "socket_cpu_mb")) {
  throw new Error("Expected AM5 vs AM4 socket error");
}

const shortCase = checkCompatibility({
  gpu: p["rtx-4080-super"],
  case: p["case-compact"],
});
if (!shortCase.errors.some((e) => e.code === "gpu_length")) {
  throw new Error("Expected GPU length error");
}

const weakPsu = checkCompatibility({
  cpu: p["ryzen-7-7800x3d"],
  gpu: p["rtx-4080-super"],
  ram: p["ddr5-32-6000"],
  storage: p["ssd-1tb-nvme"],
  cooler: p["cooler-aio"],
  psu: p["psu-550"],
});
if (!weakPsu.warnings.some((e) => e.code === "psu_headroom")) {
  throw new Error(`Expected PSU headroom warning, got ${JSON.stringify(weakPsu)}`);
}

const ddrMismatch = checkCompatibility({
  cpu: p["ryzen-7-7800x3d"],
  ram: p["ddr4-32-3600"],
});
if (!ddrMismatch.errors.some((e) => e.code === "memory_cpu")) {
  throw new Error("Expected DDR4 vs AM5 memory error");
}

const ready = checkCompatibility({
  cpu: p["ryzen-7-7800x3d"],
  motherboard: p["b650-tomahawk"],
  ram: p["ddr5-32-6000"],
  gpu: p["rtx-4070-super"],
  storage: p["ssd-1tb-nvme"],
  psu: p["psu-750"],
  case: p["case-mid"],
  cooler: p["cooler-tower"],
});
if (!ready.ready) {
  throw new Error(`Expected ready build, got ${JSON.stringify(ready)}`);
}

const game = games.find((g) => g.slug === "cyberpunk-2077");
const fps = estimateGameFps(p["ryzen-7-7800x3d"], p["rtx-4070-super"], game, "1080p");
if (!fps || fps.ultra.fps >= fps.low.fps) {
  throw new Error("Ultra FPS should be lower than low");
}
if (games.length !== 20) {
  throw new Error(`Expected 20 games, got ${games.length}`);
}

console.log("compat+fps ok", {
  socketError: conflict.errors[0].code,
  gpuError: shortCase.errors[0].code,
  psuWarn: weakPsu.warnings.map((w) => w.code),
  ddrError: ddrMismatch.errors[0].code,
  ready: ready.ready,
  cyberpunk1080: fps,
  games: games.length,
  products: products.length,
});

await prisma.$disconnect();
