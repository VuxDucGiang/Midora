"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Camera, RotateCw, Ruler } from "lucide-react";
import { OrganicMannequinRig } from "@/features/avatar/three/OrganicMannequinBuilder";
import type { ActiveBodyMetric, AvatarDraft } from "@/types/bodyProfile";

type CameraPreset = "full" | "upper" | "angle45" | "back";

interface CameraGoal {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

interface Avatar3DCanvasProps {
  draft: AvatarDraft;
  activeMetric: ActiveBodyMetric;
}

const CAMERA_PRESETS: Array<{ id: CameraPreset; label: string }> = [
  { id: "full", label: "Toàn thân" },
  { id: "upper", label: "Thân trên" },
  { id: "angle45", label: "Nghiêng 45°" },
  { id: "back", label: "Mặt sau" },
];

function computeCameraGoal(preset: CameraPreset, heightCm: number): CameraGoal {
  const H = THREE.MathUtils.clamp(heightCm / 100, 1.2, 2.2);
  const scaleD = H / 1.63;

  switch (preset) {
    case "upper":
      return {
        position: new THREE.Vector3(0.14, H * 0.69, 2.05 * scaleD),
        target: new THREE.Vector3(0, H * 0.61, 0),
      };
    case "angle45":
      return {
        position: new THREE.Vector3(2.45 * scaleD, H * 0.52, 2.45 * scaleD),
        target: new THREE.Vector3(0, H * 0.45, 0),
      };
    case "back":
      return {
        position: new THREE.Vector3(-0.08, H * 0.50, -3.55 * scaleD),
        target: new THREE.Vector3(0, H * 0.45, 0),
      };
    case "full":
    default:
      return {
        position: new THREE.Vector3(0.06, H * 0.50, 3.6 * scaleD),
        target: new THREE.Vector3(0, H * 0.45, 0),
      };
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 122);
    gradient.addColorStop(0, "rgba(25, 24, 23, 0.2)");
    gradient.addColorStop(0.55, "rgba(25, 24, 23, 0.07)");
    gradient.addColorStop(1, "rgba(25, 24, 23, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function Avatar3DCanvas({
  draft,
  activeMetric,
}: Avatar3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<OrganicMannequinRig | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transitionGoalRef = useRef<CameraGoal | null>(null);

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("full");
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAllRings, setShowAllRings] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const activeMetricRef = useRef<ActiveBodyMetric>(activeMetric);
  const showAllRingsRef = useRef<boolean>(showAllRings);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const initialDraftRef = useRef<AvatarDraft>(draft);

  useEffect(() => {
    activeMetricRef.current = activeMetric;
  }, [activeMetric]);

  useEffect(() => {
    showAllRingsRef.current = showAllRings;
  }, [showAllRings]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 480);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setWebglError(true));
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F4EFEA");
    scene.fog = new THREE.Fog("#F4EFEA", 5.5, 11.5);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 25);
    const initialGoal = computeCameraGoal(
      "full",
      initialDraftRef.current.heightCm
    );
    camera.position.copy(initialGoal.position);

    // Studio IBL environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.44;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Warm 3-Point Atelier Lighting with diagonal soft shadow behind mannequin
    const hemiLight = new THREE.HemisphereLight(0xfffaf2, 0xd9cfc2, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.48);
    keyLight.position.set(-1.6, 2.6, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 8.5;
    keyLight.shadow.camera.left = -1.3;
    keyLight.shadow.camera.right = 1.3;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -0.3;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeef3f8, 0.55);
    fillLight.position.set(2.0, 1.5, 1.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff0dd, 0.7);
    rimLight.position.set(0.3, 2.2, -2.3);
    scene.add(rimLight);

    // Full-screen seamless floor & minimalist atelier pedestal
    const stageGroup = new THREE.Group();

    const floorGeo = new THREE.CircleGeometry(5.5, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf4efea,
      roughness: 0.96,
      metalness: 0.0,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.015;
    floorMesh.receiveShadow = true;
    stageGroup.add(floorMesh);

    const pedestalGeo = new THREE.CylinderGeometry(0.46, 0.48, 0.014, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xeee8de,
      roughness: 0.88,
      metalness: 0.02,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.y = -0.007;
    pedestalMesh.receiveShadow = true;
    stageGroup.add(pedestalMesh);

    const pedestalTrimGeo = new THREE.RingGeometry(0.456, 0.462, 64);
    pedestalTrimGeo.rotateX(-Math.PI / 2);
    const pedestalTrimMat = new THREE.MeshBasicMaterial({
      color: 0xd6cec2,
      transparent: true,
      opacity: 0.7,
    });
    const pedestalTrim = new THREE.Mesh(pedestalTrimGeo, pedestalTrimMat);
    pedestalTrim.position.y = 0.0005;
    stageGroup.add(pedestalTrim);

    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(0.84, 0.84);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.y = 0.0012;
    stageGroup.add(shadowPlane);

    scene.add(stageGroup);

    // Organic Mannequin Rig
    const rig = new OrganicMannequinRig();
    rig.update(initialDraftRef.current);
    scene.add(rig.root);
    rigRef.current = rig;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initialGoal.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.15;
    controls.maxDistance = 5.2;
    controls.minPolarAngle = Math.PI * 0.14;
    controls.maxPolarAngle = Math.PI * 0.51;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.0;
    controls.update();

    const stopTransitionOnUserDrag = () => {
      transitionGoalRef.current = null;
    };
    controls.addEventListener("start", stopTransitionOnUserDrag);
    controlsRef.current = controls;

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 300);
        const h = Math.max(entry.contentRect.height, 400);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    const timer = new THREE.Timer();
    timer.connect(document);

    renderer.setAnimationLoop(() => {
      timer.update();
      const elapsed = timer.getElapsed();

      const goal = transitionGoalRef.current;
      if (goal) {
        camera.position.lerp(goal.position, 0.12);
        controls.target.lerp(goal.target, 0.12);
        if (
          camera.position.distanceTo(goal.position) < 0.008 &&
          controls.target.distanceTo(goal.target) < 0.008
        ) {
          camera.position.copy(goal.position);
          controls.target.copy(goal.target);
          transitionGoalRef.current = null;
        }
      }

      rig.animate(elapsed, activeMetricRef.current, showAllRingsRef.current);
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      timer.dispose();
      resizeObserver.disconnect();
      controls.removeEventListener("start", stopTransitionOnUserDrag);
      controls.dispose();
      controlsRef.current = null;

      rig.dispose();
      rigRef.current = null;

      floorGeo.dispose();
      floorMat.dispose();
      pedestalGeo.dispose();
      pedestalMat.dispose();
      pedestalTrimGeo.dispose();
      pedestalTrimMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();

      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (rigRef.current) {
      rigRef.current.update(draft);
    }
  }, [draft]);

  const handleSelectPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    transitionGoalRef.current = computeCameraGoal(preset, draft.heightCm);
    setPresetsOpen(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#F4EFEA]">
      {/* Subtle radial studio spotlight ambient backdrop behind canvas */}
      <div
        ref={mountRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        aria-label="Không gian toàn màn hình xem trước Avatar 3D MIDORA"
      />

      {webglError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F4EFEA] p-6 text-center">
          <p className="font-serif text-xl text-[#191817]">
            Trình duyệt chưa bật WebGL 3D
          </p>
          <p className="mt-2 max-w-sm text-xs text-[#57534E]">
            Số đo của bạn vẫn đang được ghi nhận ({draft.heightCm} cm •{" "}
            {draft.chestCm}/{draft.waistCm}/{draft.hipsCm} cm). Hãy bật tăng tốc phần cứng để xem mô hình 3D.
          </p>
        </div>
      )}

      {/* Top-Right Compact View Tools below Liquid Glass Navbar */}
      <div className="pointer-events-none absolute right-3 top-[78px] sm:right-6 sm:top-[84px] z-20 flex flex-col items-end gap-2">
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAllRings((prev) => !prev)}
            title="Hiện tất cả vòng thước đo 3D"
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 sm:px-3 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              showAllRings
                ? "bg-[#191817] text-[#FAF7F2] shadow-xs"
                : "liquid-glass-subtle text-[#191817] hover:bg-white/80"
            }`}
          >
            <Ruler className="h-3 w-3" />
            <span className="hidden sm:inline">Thước đo</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            title="Bật hoặc tắt tự động xoay 360°"
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 sm:px-3 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              autoRotate
                ? "bg-[#A25B26] text-[#FAF7F2] shadow-xs"
                : "liquid-glass-subtle text-[#191817] hover:bg-white/80"
            }`}
          >
            <RotateCw
              className={`h-3 w-3 ${
                autoRotate ? "animate-[spin_6s_linear_infinite]" : ""
              }`}
            />
            <span className="hidden sm:inline">Xoay 360°</span>
          </button>

          <button
            type="button"
            onClick={() => setPresetsOpen((prev) => !prev)}
            title="Chọn nhanh góc camera"
            className="inline-flex h-8 items-center gap-1.5 rounded-full liquid-glass-subtle px-2.5 sm:px-3 font-mono text-[10px] uppercase tracking-wider text-[#191817] hover:bg-white/80 transition-all cursor-pointer"
          >
            <Camera className="h-3 w-3 text-[#A25B26]" />
            <span className="hidden md:inline">
              {CAMERA_PRESETS.find((p) => p.id === cameraPreset)?.label}
            </span>
          </button>
        </div>

        {/* Compact Expandable Camera Preset Menu */}
        {presetsOpen && (
          <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl liquid-glass p-1.5 w-36">
            {CAMERA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`rounded-xl px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                  cameraPreset === preset.id
                    ? "bg-[#191817] text-[#FAF7F2] font-semibold"
                    : "text-[#57534E] hover:bg-white/60 hover:text-[#191817]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
