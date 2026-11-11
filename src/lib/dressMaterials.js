import * as THREE from "three";

function includesAny(text, parts) {
  return parts.some((part) => text.includes(part));
}

function cloneMaterial(source) {
  const mat = new THREE.MeshStandardMaterial({
    color: source?.color ? source.color.clone() : new THREE.Color("#ffffff"),
    map: source?.map ?? null,
    metalnessMap: source?.metalnessMap ?? null,
    roughnessMap: source?.roughnessMap ?? null,
    normalMap: source?.normalMap ?? null,
    metalness: source?.metalness ?? 0.2,
    roughness: source?.roughness ?? 0.5,
    transparent: Boolean(source?.transparent),
    opacity: source?.opacity ?? 1,
    side: source?.side ?? THREE.FrontSide,
    name: source?.name || "",
  });
  mat.vertexColors = false;
  if (source?.emissive) {
    mat.emissive.copy(source.emissive);
    mat.emissiveIntensity = source.emissiveIntensity ?? 1;
  }
  return mat;
}

function paintSolid(mat, hex, metalness, roughness) {
  mat.map = null;
  mat.metalnessMap = null;
  mat.roughnessMap = null;
  mat.emissiveMap = null;
  mat.color.set(hex);
  mat.emissive.set("#000000");
  mat.emissiveIntensity = 0;
  mat.metalness = metalness;
  mat.roughness = roughness;
  mat.transparent = false;
  mat.opacity = 1;
}

export function dressScene(scene, look = {}) {
  scene.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = true;
    const mats = (Array.isArray(child.material) ? child.material : [child.material]).filter(
      Boolean,
    );
    if (!mats.length) return;
    const label = `${child.name} ${mats.map((mat) => mat.name || "").join(" ")}`.toLowerCase();
    child.material = mats.map((mat) => finishMaterial(cloneMaterial(mat), label, look));

    if (look.hideGlass && includesAny(label, ["glass"])) {
      child.visible = false;
    }
  });
}

function finishMaterial(mat, label, look) {
  if (includesAny(label, ["rgb", "light_bar", "light_strip"])) {
    const glow = look.rgb === false ? "#8a9098" : look.rgb || "#6a93b8";
    paintSolid(mat, glow, 0.08, 0.35);
    if (look.rgb !== false) {
      mat.emissive.set(glow);
      mat.emissiveIntensity = 0.45;
    }
    return mat;
  }

  if (includesAny(label, ["fan_blade", "fan_blades", "rotor", "fan_hub", "hub"])) {
    paintSolid(mat, look.fan || "#3d444c", 0.08, 0.46);
    return mat;
  }

  if (mat.map) {
    mat.color.set("#ffffff");
    return mat;
  }

  if (look.kind === "cpu") {
    paintSolid(mat, look.ihs || "#c9ccd1", 0.7, 0.24);
    return mat;
  }

  return mat;
}
