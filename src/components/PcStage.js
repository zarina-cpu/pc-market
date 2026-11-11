"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { LAYOUT, MODEL_SRC, PRELOAD_LIST } from "@/lib/modelLayout";
import { parseSpecs } from "@/lib/categories.js";

const ORIGIN = [0, 0, 0];

PRELOAD_LIST.forEach((url) => useGLTF.preload(url));

function useClonedScene(url) {
  const { scene } = useGLTF(url);
  return useMemo(() => scene.clone(true), [scene]);
}

function SpinRotors({ object }) {
  useFrame((_, delta) => {
    object.traverse((child) => {
      if (child.name && child.name.includes("rotor")) {
        child.rotation.y += delta * 3.2;
      }
    });
  });
  return null;
}

function GltfPart({
  url,
  position = ORIGIN,
  rotation = ORIGIN,
  scale = 1,
  hideGlass = false,
}) {
  const scene = useClonedScene(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;
      if (hideGlass && child.name && child.name.includes("side_panel")) {
        child.visible = false;
      }
    });
  }, [scene, hideGlass]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
      <SpinRotors object={scene} />
    </group>
  );
}

function MotherboardStack({ build }) {
  const ramSticks = parseSpecs(build.ram)?.sticks ?? 2;
  const sticks = Math.min(ramSticks, 4);
  const gpuLength = parseSpecs(build.gpu)?.lengthMm || 267;
  const gpuScale = LAYOUT.gpu.scale * (gpuLength / 310);

  return (
    <group
      position={LAYOUT.motherboard.position}
      rotation={LAYOUT.motherboard.rotation}
    >
      <GltfPart url={MODEL_SRC.motherboard} />
      {build.cpu ? (
        <GltfPart
          url={MODEL_SRC.cpu}
          position={LAYOUT.cpu.position}
          scale={LAYOUT.cpu.scale}
        />
      ) : null}
      {build.cooler ? (
        <GltfPart
          url={MODEL_SRC.cooler}
          position={LAYOUT.cooler.position}
          scale={LAYOUT.cooler.scale}
        />
      ) : null}
      {build.ram
        ? Array.from({ length: sticks }, (_, index) => (
            <GltfPart
              key={index}
              url={MODEL_SRC.ram}
              position={[
                LAYOUT.ram.position[0],
                LAYOUT.ram.position[1],
                LAYOUT.ram.position[2] - index * LAYOUT.ramGap,
              ]}
              rotation={LAYOUT.ram.rotation}
            />
          ))
        : null}
      {build.gpu ? (
        <GltfPart
          url={MODEL_SRC.gpu}
          position={LAYOUT.gpu.position}
          rotation={LAYOUT.gpu.rotation}
          scale={gpuScale}
        />
      ) : null}
    </group>
  );
}

function StageModels({ build }) {
  return (
    <group rotation={LAYOUT.case.rotation}>
      <GltfPart url={MODEL_SRC.case} hideGlass />
      {build.motherboard ? <MotherboardStack build={build} /> : null}
      {build.psu ? (
        <GltfPart
          url={MODEL_SRC.psu}
          position={LAYOUT.psu.position}
          rotation={LAYOUT.psu.rotation}
        />
      ) : null}
      {build.storage ? (
        <GltfPart
          url={MODEL_SRC.storage}
          position={LAYOUT.storage.position}
          rotation={LAYOUT.storage.rotation}
        />
      ) : null}
      {build.storage2 ? (
        <GltfPart
          url={MODEL_SRC.storage}
          position={LAYOUT.storage2.position}
          rotation={LAYOUT.storage2.rotation}
        />
      ) : null}
    </group>
  );
}

export default function PcStage({ build, mode }) {
  return (
    <div className="viewer-canvas">
      <Canvas
        key={mode}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#3d4450"]} />
        {mode === "2d" ? (
          <OrthographicCamera
            makeDefault
            position={[0.7, 0.28, 0.12]}
            zoom={210}
            near={0.05}
            far={12}
          />
        ) : (
          <PerspectiveCamera
            makeDefault
            position={[0.85, 0.38, 0.7]}
            fov={40}
            near={0.05}
            far={12}
          />
        )}
        <ambientLight intensity={1.15} />
        <hemisphereLight intensity={0.9} color="#ffffff" groundColor="#6a7078" />
        <directionalLight position={[0.8, 1.1, 0.7]} intensity={2.1} />
        <directionalLight position={[-0.6, 0.45, 0.25]} intensity={1.1} />
        <Suspense fallback={null}>
          <StageModels build={build} />
        </Suspense>
        <OrbitControls
          makeDefault
          target={[0, 0.22, 0]}
          enableRotate={mode === "3d"}
          enablePan={false}
          minDistance={0.8}
          maxDistance={2.6}
          maxPolarAngle={Math.PI / 1.65}
        />
      </Canvas>
    </div>
  );
}
