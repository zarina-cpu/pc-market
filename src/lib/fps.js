import { parseSpecs } from "./categories.js";

export const PRESETS = ["low", "medium", "high", "ultra"];
export const RESOLUTIONS = ["1080p", "1440p", "4k"];

const PRESET_MULT = {
  low: 1.42,
  medium: 1,
  high: 0.74,
  ultra: 0.52,
};

const RES_MULT = {
  "1080p": 1,
  "1440p": 0.64,
  "4k": 0.34,
};

function vramNeed(game, preset) {
  if (preset === "low") return game.vramLow;
  if (preset === "high") return game.vramHigh;
  if (preset === "ultra") return game.vramUltra;
  return game.vramMed;
}

export function estimateGameFps(cpuProduct, gpuProduct, game, resolution) {
  const cpu = parseSpecs(cpuProduct);
  const gpu = parseSpecs(gpuProduct);
  if (!cpu || !gpu || !game) return null;

  const cpuNorm = (cpu.cpuScore ?? 50) / 100;
  const gpuNorm = (gpu.gpuScore ?? 50) / 100;
  const mix = game.cpuWeight * cpuNorm + game.gpuWeight * gpuNorm;
  const resMul = RES_MULT[resolution] ?? 1;
  const cpuCap = game.baseFps * cpuNorm * 1.35;

  const result = {};
  for (const preset of PRESETS) {
    let fps = game.baseFps * mix * PRESET_MULT[preset] * resMul;
    fps = Math.min(fps, cpuCap * PRESET_MULT[preset] * Math.max(resMul, 0.72));
    const need = vramNeed(game, preset);
    const notes = [];
    if (gpu.vramGb < need) {
      fps *= 0.42;
      notes.push("vram");
    }
    if (gpuNorm > cpuNorm * 1.4 && game.cpuWeight >= 0.28) {
      notes.push("cpu_bound");
    }
    result[preset] = {
      fps: Math.max(8, Math.round(fps)),
      notes,
      vramNeed: need,
    };
  }
  return result;
}

export function estimateAllGames(cpuProduct, gpuProduct, games, resolution) {
  return games.map((game) => ({
    game,
    estimate: estimateGameFps(cpuProduct, gpuProduct, game, resolution),
  }));
}
