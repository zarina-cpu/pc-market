export const MODEL_SRC = {
  case: "/models/case.glb",
  cpu: "/models/cpu.glb",
  motherboard: "/models/motherboard.glb",
  ram: "/models/ram.glb",
  gpu: "/models/gpu.glb",
  psu: "/models/psu.glb",
  cooler: "/models/cooler.glb",
  storage: "/models/storage.glb",
};

export const PRELOAD_LIST = Object.values(MODEL_SRC);

const halfPi = Math.PI / 2;

export const LAYOUT = {
  case: { position: [0, 0, 0], rotation: [0, 0.85, 0], scale: 1 },
  motherboard: {
    position: [-0.094, 0.248, 0.02],
    rotation: [halfPi, 0, -halfPi],
    scale: 1,
  },
  cpu: {
    position: [-0.01, 0.043, 0.01],
    rotation: [0, 0, 0],
    scale: 0.55,
  },
  cooler: {
    position: [0, 0.045, 0.01],
    rotation: [0, 0, 0],
    scale: 0.88,
  },
  ram: {
    position: [0.04, 0.042, -0.055],
    rotation: [halfPi, 0, 0],
    scale: 1,
  },
  ramGap: 0.011,
  gpu: {
    position: [0.02, 0.05, -0.085],
    rotation: [0, 0, 0],
    scale: 0.92,
  },
  psu: {
    position: [0.0, 0.006, -0.145],
    rotation: [0, Math.PI, 0],
    scale: 1,
  },
  storage: {
    position: [0.02, 0.092, 0.16],
    rotation: [0, halfPi, 0],
    scale: 1,
  },
  storage2: {
    position: [0.02, 0.104, 0.16],
    rotation: [0, halfPi, 0],
    scale: 1,
  },
};
