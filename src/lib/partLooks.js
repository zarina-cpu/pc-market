import { parseSpecs } from "./categories";

const GPU_MODEL_MM = 310;
const COOLER_MODEL_MM = 155;

function productKey(product) {
  return `${product?.slug || ""} ${product?.brand || ""} ${product?.nameRu || ""}`.toLowerCase();
}

export function cpuLook(product) {
  const amd = productKey(product).includes("ryzen") || product?.brand === "AMD";
  return {
    kind: "cpu",
    ihs: amd ? "#c9a227" : "#c5c9d0",
    substrate: "#1a1c1f",
  };
}

export function ramLook(product) {
  const key = productKey(product);
  if (key.includes("g.skill") || key.includes("ripjaws")) {
    return { kind: "ram", heatsink: "#6b1d1d", rgb: "#c45a4a" };
  }
  if (key.includes("corsair")) {
    return { kind: "ram", heatsink: "#1a1c20", rgb: "#6a93b8" };
  }
  if (key.includes("adata")) {
    return { kind: "ram", heatsink: "#b8bec6", rgb: false };
  }
  return { kind: "ram", heatsink: "#2a2d32", rgb: "#6a93b8" };
}

export function gpuLook(product) {
  const lengthMm = parseSpecs(product)?.lengthMm || 267;
  const key = productKey(product);
  let shroud = "#16181c";
  if (key.includes("sapphire") || key.includes("7800")) shroud = "#1a1516";
  if (key.includes("palit") || key.includes("3050")) shroud = "#2a2d32";
  if (key.includes("gigabyte") || key.includes("4060")) shroud = "#1b1f24";
  return {
    kind: "gpu",
    shroud,
    fan: "#1c2024",
    hub: "#121416",
    metal: "#c0c4cc",
    rgb: key.includes("asus") ? "#c45a4a" : "#6a93b8",
    scale: lengthMm / GPU_MODEL_MM,
  };
}

export function motherboardLook(product) {
  const key = productKey(product);
  const form = parseSpecs(product)?.formFactor;
  const compact = form === "mATX" || form === "ITX";
  let pcb = "#152033";
  if (key.includes("aorus") || key.includes("gigabyte")) pcb = "#10284a";
  if (key.includes("tuf") || key.includes("x670")) pcb = "#24261c";
  if (key.includes("steel")) pcb = "#2c3238";
  return { kind: "motherboard", pcb, scale: compact ? 0.86 : 1 };
}

export function caseLook(product) {
  const key = productKey(product);
  const specs = parseSpecs(product) || {};
  const compact = key.includes("compact") || key.includes("node") || (specs.maxGpuLengthMm || 400) <= 270;
  let body = "#c8ccd2";
  if (key.includes("lian")) body = "#d4d7dc";
  if (key.includes("fractal")) body = "#dfe3e8";
  if (key.includes("deepcool") || key.includes("mesh")) body = "#8d949c";
  return {
    kind: "case",
    body,
    metal: "#8b929c",
    scale: compact ? [0.78, 0.62, 0.72] : 1,
  };
}

export function coolerLook(product) {
  const specs = parseSpecs(product) || {};
  const heightMm = specs.heightMm || 155;
  const aio = specs.type === "aio" || productKey(product).includes("aio") || productKey(product).includes("liquid");
  const low = heightMm <= 80;
  return {
    kind: "cooler",
    metal: aio ? "#2a2d32" : "#c5c9d0",
    fan: "#1a1c1f",
    hub: "#121416",
    plastic: "#1c1e22",
    scale: low ? [0.72, 0.42, 0.72] : aio ? [1.05, 0.58, 1.12] : heightMm / COOLER_MODEL_MM,
  };
}

export function psuLook(product) {
  const watts = parseSpecs(product)?.wattage || 650;
  return {
    kind: "psu",
    body: "#16181c",
    fan: "#15181c",
    hub: "#101214",
    metal: "#9aa3ad",
    scale: watts >= 800 ? 1.06 : watts <= 550 ? 0.92 : 1,
  };
}

export function storageLook(product) {
  const iface = parseSpecs(product)?.interface;
  const key = productKey(product);
  if (iface === "m.2" || key.includes("nvme")) {
    return { kind: "storage", body: "#1a1c1f", metal: "#c5c9d0", scale: [0.55, 0.28, 0.7] };
  }
  if (key.includes("hdd") || key.includes("barracuda")) {
    return { kind: "storage", body: "#8b929c", metal: "#c5c9d0", scale: [1.25, 1.15, 1.35] };
  }
  return { kind: "storage", body: "#b8bec6", metal: "#d5d9e0", scale: [0.95, 0.7, 1] };
}

export function lookFor(slot, product) {
  if (!product) return { kind: slot };
  if (slot === "cpu") return cpuLook(product);
  if (slot === "ram") return ramLook(product);
  if (slot === "gpu") return gpuLook(product);
  if (slot === "motherboard") return motherboardLook(product);
  if (slot === "case") return caseLook(product);
  if (slot === "cooler") return coolerLook(product);
  if (slot === "psu") return psuLook(product);
  if (slot === "storage" || slot === "storage2") return storageLook(product);
  return { kind: slot };
}

export function asScale(value) {
  if (Array.isArray(value)) return value;
  const n = Number(value) || 1;
  return [n, n, n];
}
