import type * as THREE from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { GlbMorphAvatarRig } from "@/features/avatar/three/GlbMorphAvatarRig";
import type { AvatarManifest } from "@/features/avatar/three/avatarRigTypes";
import type { GenderStyle } from "@/types/bodyProfile";

const MANIFEST_URL = "/models/avatar-manifest.json";

export async function fetchAvatarManifest(
  signal?: AbortSignal
): Promise<AvatarManifest | null> {
  try {
    const res = await fetch(MANIFEST_URL, { cache: "no-store", signal });
    if (!res.ok) return null;
    const data = (await res.json()) as AvatarManifest;
    if (!data || typeof data.enabled !== "boolean") return null;
    return data;
  } catch {
    return null;
  }
}

export async function tryLoadGlbAvatarRig(params: {
  renderer: THREE.WebGLRenderer;
  manifest: AvatarManifest;
  genderStyle: GenderStyle;
  signal?: AbortSignal;
}): Promise<GlbMorphAvatarRig | null> {
  const { renderer, manifest, genderStyle, signal } = params;
  if (!manifest.enabled) return null;

  const spec = manifest.models[genderStyle] ?? manifest.models.female;
  if (!spec?.url) return null;

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/libs/draco/");

  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath("/libs/basis/");
  ktx2Loader.detectSupport(renderer);

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  gltfLoader.setKTX2Loader(ktx2Loader);

  try {
    const gltf = await gltfLoader.loadAsync(spec.url);
    if (signal?.aborted) {
      return null;
    }
    return new GlbMorphAvatarRig(gltf.scene, spec);
  } catch (err) {
    console.warn("[MIDORA Avatar] Could not load GLB model, falling back:", err);
    return null;
  } finally {
    dracoLoader.dispose();
    ktx2Loader.dispose();
  }
}

