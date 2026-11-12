"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import {
  fetchAvatarManifest,
  tryLoadGlbAvatarRig,
} from "@/features/avatar/three/avatarLoader";
import type {
  AvatarManifest,
  AvatarRigInstance,
} from "@/features/avatar/three/avatarRigTypes";
import { OrganicMannequinRig } from "@/features/avatar/three/OrganicMannequinBuilder";
import {
  createRoomEnvironment,
  loadStudioEnvironment,
} from "@/features/avatar/three/studioEnvironment";
import type { ActiveBodyMetric, AvatarDraft } from "@/types/bodyProfile";

interface Avatar3DCanvasProps {
  draft: AvatarDraft;
  activeMetric: ActiveBodyMetric;
}

const AUTO_ROTATE_RESUME_DELAY_MS = 5000;

function computeDefaultCameraGoal(heightCm: number): {
  position: THREE.Vector3;
  target: THREE.Vector3;
} {
  const H = THREE.MathUtils.clamp(heightCm / 100, 1.2, 2.2);
  const scaleD = H / 1.63;

  return {
    position: new THREE.Vector3(0.06, H * 0.5, 3.55 * scaleD),
    target: new THREE.Vector3(0, H * 0.46, 0),
  };
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
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rigRef = useRef<AvatarRigInstance | null>(null);
  const manifestRef = useRef<AvatarManifest | null>(null);
  const loadedModelUrlRef = useRef<string | null>(null);
  const loadSeqRef = useRef(0);
  const [webglError, setWebglError] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const activeMetricRef = useRef<ActiveBodyMetric>(activeMetric);
  const latestDraftRef = useRef<AvatarDraft>(draft);

  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    activeMetricRef.current = activeMetric;
  }, [activeMetric]);

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
    // AgX keeps skin highlights soft and hue-stable; ACES desaturated them.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.shadowMap.enabled = true;
    // three r187 removed PCFSoftShadowMap; PCF + shadow.radius gives the
    // soft studio falloff we want on the floor.
    renderer.shadowMap.type = THREE.PCFShadowMap;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F4EFEA");
    scene.fog = new THREE.Fog("#F4EFEA", 5.5, 11.5);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 25);
    const initialGoal = computeDefaultCameraGoal(
      latestDraftRef.current.heightCm
    );
    camera.position.copy(initialGoal.position);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Studio IBL: a procedural room lights the first frames, then the CC0
    // Poly Haven HDRI (public/env/studio_small_09_1k.hdr) replaces it.
    let envDispose: () => void = () => {};
    let envLoadCancelled = false;

    const fallbackEnv = createRoomEnvironment(renderer);
    scene.environment = fallbackEnv.texture;
    scene.environmentIntensity = fallbackEnv.intensity;
    envDispose = fallbackEnv.dispose;

    void (async () => {
      try {
        const studio = await loadStudioEnvironment(
          renderer,
          () => envLoadCancelled
        );
        if (envLoadCancelled) {
          studio.dispose();
          return;
        }
        scene.environment = studio.texture;
        scene.environmentIntensity = studio.intensity;
        fallbackEnv.dispose();
        envDispose = studio.dispose;
      } catch {
        // Keep the procedural room environment when the HDRI is unavailable.
      }
    })();

    // Warm 3-Point Atelier Lighting with diagonal soft shadow behind mannequin
    const hemiLight = new THREE.HemisphereLight(0xfffaf2, 0xd9cfc2, 0.21);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 0.9);
    keyLight.position.set(-1.6, 2.6, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 8.5;
    keyLight.shadow.camera.left = -1.3;
    keyLight.shadow.camera.right = 1.3;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -0.3;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.015;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdfe9f5, 0.27);
    fillLight.position.set(2.0, 1.5, 1.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd9b8, 0.5);
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

    // Default Immediate Parametric Rig (upgrades seamlessly if MPFB2 GLB manifest is enabled)
    const fallbackRig = new OrganicMannequinRig();
    fallbackRig.update(latestDraftRef.current);
    scene.add(fallbackRig.root);
    rigRef.current = fallbackRig;

    const loadAbort = new AbortController();
    void (async () => {
      const seq = ++loadSeqRef.current;
      const manifest = await fetchAvatarManifest(loadAbort.signal);
      if (loadAbort.signal.aborted || !manifest || seq !== loadSeqRef.current) return;
      manifestRef.current = manifest;
      if (!manifest.enabled) return;

      const gender = latestDraftRef.current.avatarCustomizationParams.genderStyle;
      const targetSpec = manifest.models[gender] ?? manifest.models.female;
      if (!targetSpec?.url) return;

      setIsModelLoading(true);
      const glbRig = await tryLoadGlbAvatarRig({
        renderer,
        manifest,
        genderStyle: gender,
        signal: loadAbort.signal,
      });
      if (loadAbort.signal.aborted || seq !== loadSeqRef.current) {
        glbRig?.dispose();
        return;
      }
      setIsModelLoading(false);
      if (!glbRig) return;

      const previousRig = rigRef.current;
      glbRig.update(latestDraftRef.current);
      scene.add(glbRig.root);
      rigRef.current = glbRig;
      loadedModelUrlRef.current = targetSpec.url;
      if (previousRig) {
        scene.remove(previousRig.root);
        previousRig.dispose();
      }
    })();

    // Post-processing: SOFT AO for creases + SMAA for clean shell edges.
    // GTAO runs a depth/normal prepass, so it is desktop-only for now.
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));

    const enableGtao = window.innerWidth >= 1024;
    let gtaoPass: GTAOPass | null = null;
    if (enableGtao) {
      gtaoPass = new GTAOPass(scene, camera, width, height);
      gtaoPass.blendIntensity = 0.7;
      gtaoPass.updateGtaoMaterial({
        radius: 0.24,
        distanceExponent: 1.15,
        thickness: 0.9,
        scale: 1.0,
        samples: 16,
      });
      gtaoPass.updatePdMaterial({
        lumaPhi: 10,
        depthPhi: 2,
        normalPhi: 3,
        radius: 4,
        radiusExponent: 1,
        samples: 16,
      });
      composer.addPass(gtaoPass);
    }
    const smaaPass = new SMAAPass();
    const outputPass = new OutputPass();
    composer.addPass(smaaPass);
    composer.addPass(outputPass);

    // Orbit Controls with automatic 360° rotation and 5s pause after mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initialGoal.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.15;
    controls.maxDistance = 5.2;
    controls.minPolarAngle = Math.PI * 0.14;
    controls.maxPolarAngle = Math.PI * 0.51;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.update();

    let resumeRotateTimer: ReturnType<typeof setTimeout> | null = null;
    let isUserInteracting = false;

    const clearResumeTimer = () => {
      if (resumeRotateTimer !== null) {
        clearTimeout(resumeRotateTimer);
        resumeRotateTimer = null;
      }
    };

    const scheduleAutoRotateResume = () => {
      clearResumeTimer();
      resumeRotateTimer = setTimeout(() => {
        resumeRotateTimer = null;
        if (!isUserInteracting) {
          controls.autoRotate = true;
        }
      }, AUTO_ROTATE_RESUME_DELAY_MS);
    };

    const handleControlsStart = () => {
      isUserInteracting = true;
      controls.autoRotate = false;
      clearResumeTimer();
    };

    const handleControlsEnd = () => {
      isUserInteracting = false;
      scheduleAutoRotateResume();
    };

    const handleWheelInteraction = () => {
      controls.autoRotate = false;
      if (!isUserInteracting) {
        scheduleAutoRotateResume();
      }
    };

    controls.addEventListener("start", handleControlsStart);
    controls.addEventListener("end", handleControlsEnd);
    renderer.domElement.addEventListener("wheel", handleWheelInteraction, {
      passive: true,
    });

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 300);
        const h = Math.max(entry.contentRect.height, 400);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    const timer = new THREE.Timer();
    timer.connect(document);

    renderer.setAnimationLoop(() => {
      timer.update();
      const elapsed = timer.getElapsed();

      rigRef.current?.animate(elapsed, activeMetricRef.current, false);
      controls.update();
      composer.render();
    });

    return () => {
      loadAbort.abort();
      envLoadCancelled = true;
      clearResumeTimer();
      renderer.setAnimationLoop(null);
      timer.dispose();
      resizeObserver.disconnect();
      controls.removeEventListener("start", handleControlsStart);
      controls.removeEventListener("end", handleControlsEnd);
      renderer.domElement.removeEventListener("wheel", handleWheelInteraction);
      controls.dispose();

      rigRef.current?.dispose();
      rigRef.current = null;
      loadedModelUrlRef.current = null;
      sceneRef.current = null;
      rendererRef.current = null;

      floorGeo.dispose();
      floorMat.dispose();
      pedestalGeo.dispose();
      pedestalMat.dispose();
      pedestalTrimGeo.dispose();
      pedestalTrimMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();

      gtaoPass?.dispose();
      smaaPass.dispose();
      outputPass.dispose();
      composer.dispose();
      envDispose();
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

  const genderStyle = draft.avatarCustomizationParams.genderStyle;
  useEffect(() => {
    const manifest = manifestRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!manifest?.enabled || !scene || !renderer) return;

    const targetSpec = manifest.models[genderStyle] ?? manifest.models.female;
    if (!targetSpec?.url || targetSpec.url === loadedModelUrlRef.current) {
      return;
    }

    const abortController = new AbortController();
    const seq = ++loadSeqRef.current;
    void (async () => {
      await Promise.resolve();
      if (abortController.signal.aborted || seq !== loadSeqRef.current) return;
      setIsModelLoading(true);
      const glbRig = await tryLoadGlbAvatarRig({
        renderer,
        manifest,
        genderStyle,
        signal: abortController.signal,
      });
      if (abortController.signal.aborted || seq !== loadSeqRef.current) {
        glbRig?.dispose();
        return;
      }
      setIsModelLoading(false);
      if (!glbRig) return;

      const previousRig = rigRef.current;
      glbRig.update(latestDraftRef.current);
      scene.add(glbRig.root);
      rigRef.current = glbRig;
      loadedModelUrlRef.current = targetSpec.url;
      if (previousRig) {
        scene.remove(previousRig.root);
        previousRig.dispose();
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [genderStyle]);

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

      {isModelLoading && (
        <div className="pointer-events-none absolute right-3 top-[78px] sm:right-6 sm:top-[84px] z-20 inline-flex h-7 items-center gap-1.5 rounded-full liquid-glass-subtle px-3 font-mono text-[10px] uppercase tracking-wider text-[#57534E]">
          Đang nạp Avatar 3D...
        </div>
      )}
    </div>
  );
}
