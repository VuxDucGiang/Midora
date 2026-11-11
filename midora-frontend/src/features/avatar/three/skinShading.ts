import * as THREE from "three";

/**
 * Procedural skin micro-detail (pores + fine wrinkles) used as a fallback until
 * the project ships scanned/KTX2 skin textures from the Blender bake pipeline.
 *
 * All generators are tileable so a single texture can be repeated across the
 * torso/limbs without visible seams. Values are intentionally subtle: the goal
 * is to break the "smooth plastic" terminator, not to look like orange peel.
 */

function hash2(x: number, y: number, period: number): number {
  const xi = ((x % period) + period) % period;
  const yi = ((y % period) + period) % period;
  const n = Math.sin(xi * 127.1 + yi * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number, period: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, period);
  const b = hash2(xi + 1, yi, period);
  const c = hash2(xi, yi + 1, period);
  const d = hash2(xi + 1, yi + 1, period);
  const top = a + (b - a) * u;
  const bottom = c + (d - c) * u;
  return top + (bottom - top) * v;
}

function fbm(
  u: number,
  v: number,
  basePeriod: number,
  octaves: number
): number {
  let amplitude = 0.5;
  let frequency = basePeriod;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(u * frequency, v * frequency, frequency) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / Math.max(norm, 1e-6);
}

/**
 * Tangent-space normal map: broad folds (low frequency) + pore dimples
 * (high frequency). Encoded as RGBA8 so it stays cheap on mobile GPUs.
 */
export function createSkinDetailNormalTexture(size = 512): THREE.DataTexture {
  const heights = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const folds = fbm(u, v, 4, 4);
      const pores = fbm(u, v, 48, 2);
      const hollow = Math.pow(
        THREE.MathUtils.clamp((pores - 0.5) / 0.5, 0, 1),
        1.7
      );
      heights[y * size + x] = folds * 0.55 - hollow * 0.45;
    }
  }

  const data = new Uint8Array(size * size * 4);
  const at = (x: number, y: number) =>
    heights[((y % size) + size) % size * size + (((x % size) + size) % size)];
  const strength = 5.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * size + x) * 4;
      data[i] = Math.round((nx / len) * 127 + 128);
      data[i + 1] = Math.round((ny / len) * 127 + 128);
      data[i + 2] = Math.round((nz / len) * 127 + 128);
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Roughness variation (0.82 → 1.0 multiplier). Sebum on the T-zone, drier
 * forearms, etc. Multiplied by MeshPhysicalMaterial.roughness.
 */
export function createSkinRoughnessTexture(size = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u, v, 6, 3);
      const value = THREE.MathUtils.clamp(0.82 + n * 0.18, 0, 1) * 255;
      const i = (y * size + x) * 4;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

interface SkinRimOptions {
  strength?: number;
  /** Linear-ish warm red used for the grazing-angle bleed. */
  tint?: THREE.ColorRepresentation;
}

/**
 * Cheap stand-in for subsurface scattering: at grazing angles the path length
 * through skin grows, so thin areas (ears, nose, fingers, lips) glow warm.
 *
 * This is NOT physically based — the proper fix is pre-integrated skin shading
 * (Penner & Borshukov) driven by baked curvature/thickness maps. But it is a
 * one-line shader patch, works on every device and removes the "wax" look.
 */
export function applySkinSubsurfaceRim(
  material: THREE.MeshPhysicalMaterial,
  options: SkinRimOptions = {}
): void {
  if (material.userData.midoraSkinRim === true) return;
  const strength = options.strength ?? 1;
  const tint = new THREE.Color(options.tint ?? 0xff6a3c);
  const r = (tint.r * 0.16 * strength).toFixed(4);
  const g = (tint.g * 0.16 * strength).toFixed(4);
  const b = (tint.b * 0.16 * strength).toFixed(4);

  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      /* glsl */ `
        float midoraSssRim = pow(
          1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))),
          2.2
        );
        outgoingLight += diffuseColor.rgb * vec3(${r}, ${g}, ${b}) * midoraSssRim;
        #include <opaque_fragment>
      `
    );
  };
  material.customProgramCacheKey = () => `midora-skin-rim-${strength}`;
  material.userData.midoraSkinRim = true;
}
