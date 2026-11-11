import { parseSpecs } from "./categories.js";

function powerDraw(build) {
  const cpu = parseSpecs(build.cpu);
  const gpu = parseSpecs(build.gpu);
  const ram = parseSpecs(build.ram);
  const cooler = parseSpecs(build.cooler);
  const storageList = [build.storage, build.storage2].filter(Boolean);
  let watts = 40;
  if (cpu) watts += cpu.tdp ?? 0;
  if (gpu) watts += gpu.tdp ?? 0;
  if (ram) watts += 12;
  watts += storageList.length * 8;
  if (cooler?.type === "aio") watts += 18;
  else if (cooler) watts += 6;
  return watts;
}

export function checkCompatibility(build) {
  const errors = [];
  const warnings = [];
  const cpu = parseSpecs(build.cpu);
  const mb = parseSpecs(build.motherboard);
  const ram = parseSpecs(build.ram);
  const gpu = parseSpecs(build.gpu);
  const psu = parseSpecs(build.psu);
  const pcCase = parseSpecs(build.case);
  const cooler = parseSpecs(build.cooler);
  const storageList = [build.storage, build.storage2].filter(Boolean);
  const storageSpecs = storageList.map(parseSpecs);

  if (cpu && mb && cpu.socket !== mb.socket) {
    errors.push({
      code: "socket_cpu_mb",
      slots: ["cpu", "motherboard"],
    });
  }

  if (cooler && mb && Array.isArray(cooler.sockets) && !cooler.sockets.includes(mb.socket)) {
    errors.push({
      code: "socket_cooler_mb",
      slots: ["cooler", "motherboard"],
    });
  }

  if (cooler && cpu && Array.isArray(cooler.sockets) && !cooler.sockets.includes(cpu.socket)) {
    errors.push({
      code: "socket_cooler_cpu",
      slots: ["cooler", "cpu"],
    });
  }

  if (cpu && ram && Array.isArray(cpu.memoryTypes) && !cpu.memoryTypes.includes(ram.memoryType)) {
    errors.push({
      code: "memory_cpu",
      slots: ["cpu", "ram"],
    });
  }

  if (mb && ram && mb.memoryType !== ram.memoryType) {
    errors.push({
      code: "memory_mb",
      slots: ["motherboard", "ram"],
    });
  }

  if (mb && ram && ram.sticks > mb.ramSlots) {
    errors.push({
      code: "ram_slots",
      slots: ["motherboard", "ram"],
    });
  }

  if (mb && ram && ram.sizeGb > mb.maxRamGb) {
    errors.push({
      code: "ram_capacity",
      slots: ["motherboard", "ram"],
    });
  }

  if (mb && pcCase && Array.isArray(pcCase.formFactors) && !pcCase.formFactors.includes(mb.formFactor)) {
    errors.push({
      code: "form_factor",
      slots: ["motherboard", "case"],
    });
  }

  if (gpu && pcCase && gpu.lengthMm > pcCase.maxGpuLengthMm) {
    errors.push({
      code: "gpu_length",
      slots: ["gpu", "case"],
    });
  }

  if (cooler && pcCase && cooler.type === "air" && cooler.heightMm > pcCase.maxCoolerHeightMm) {
    errors.push({
      code: "cooler_height",
      slots: ["cooler", "case"],
    });
  }

  if (cooler && pcCase && cooler.type === "aio" && cooler.radiatorMm > pcCase.maxAioMm) {
    errors.push({
      code: "aio_size",
      slots: ["cooler", "case"],
    });
  }

  if (mb) {
    const m2Count = storageSpecs.filter((s) => s.interface === "m.2").length;
    const sataCount = storageSpecs.filter((s) => s.interface === "sata").length;
    if (m2Count > mb.m2Slots) {
      errors.push({ code: "m2_slots", slots: ["storage", "motherboard"] });
    }
    if (sataCount > mb.sataPorts) {
      errors.push({ code: "sata_ports", slots: ["storage", "motherboard"] });
    }
  }

  if (build.storage && build.storage2 && build.storage.id === build.storage2.id) {
    warnings.push({ code: "same_drive", slots: ["storage", "storage2"] });
  }

  if (cpu && cooler && cooler.tdpRating && cooler.tdpRating < cpu.tdp) {
    warnings.push({ code: "cooler_tdp", slots: ["cooler", "cpu"] });
  }

  const draw = powerDraw(build);
  if (psu) {
    const headroom = psu.wattage - draw;
    if (headroom < 0) {
      errors.push({ code: "psu_underpowered", slots: ["psu"] });
    } else if (headroom / psu.wattage < 0.15) {
      warnings.push({ code: "psu_headroom", slots: ["psu"] });
    }
  }

  const recommendedPsu = Math.ceil(draw * 1.3);
  const requiredSlots = [
    "cpu",
    "motherboard",
    "ram",
    "gpu",
    "storage",
    "psu",
    "case",
    "cooler",
  ];
  const complete = requiredSlots.every((key) => Boolean(build[key]));
  const ready = complete && errors.length === 0;

  return {
    errors,
    warnings,
    draw,
    recommendedPsu,
    complete,
    ready,
  };
}
