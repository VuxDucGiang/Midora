import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Studio image-based lighting for the avatar viewport.
 *
 * Primary source is a CC0 HDRI (Poly Haven "studio_small_09", 1K) served from
 * /public/env. If the asset is missing (offline build, stripped public folder)
 * we fall back to three's procedural RoomEnvironment so the scene is never
 * unlit.
 */
export interface StudioEnvironment {
  texture: THREE.Texture;
  intensity: number;
  dispose: () => void;
}

const HDRI_URL = "/env/studio_small_09_1k.hdr";

export function createRoomEnvironment(
  renderer: THREE.WebGLRenderer
): StudioEnvironment {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();

  return {
    texture: target.texture,
    intensity: 0.55,
    dispose: () => target.dispose(),
  };
}

export async function loadStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  shouldAbort?: () => boolean
): Promise<StudioEnvironment> {
  const pmrem = new THREE.PMREMGenerator(renderer);
  try {
    const hdr = await new HDRLoader().loadAsync(HDRI_URL);
    if (shouldAbort?.()) {
      hdr.dispose();
      throw new Error("Studio environment load aborted");
    }
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const target = pmrem.fromEquirectangular(hdr);
    hdr.dispose();

    return {
      texture: target.texture,
      intensity: 0.5,
      dispose: () => target.dispose(),
    };
  } finally {
    pmrem.dispose();
  }
}
