import { readFileSync } from "fs";
import { join } from "path";

function inspect(path) {
  const buf = readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
  const nodes = json.nodes ?? [];
  console.log("\n==", path.split("\\").pop(), "==");
  console.log("nodes:", nodes.length, "meshes:", (json.meshes ?? []).length);
  nodes.forEach((n, i) => {
    console.log(
      i,
      n.name,
      "t",
      n.translation,
      "r",
      n.rotation,
      "s",
      n.scale,
    );
  });
  const accessors = json.accessors ?? [];
  const pos = accessors.filter((a) => a.min && a.max && a.type === "VEC3");
  pos.slice(0, 4).forEach((a, i) => {
    console.log("pos", i, "min", a.min, "max", a.max);
  });
}

const dir = join("public", "models");
for (const name of [
  "case.glb",
  "motherboard.glb",
  "cpu.glb",
  "ram.glb",
  "gpu.glb",
  "psu.glb",
  "cooler.glb",
  "storage.glb",
]) {
  inspect(join(dir, name));
}
