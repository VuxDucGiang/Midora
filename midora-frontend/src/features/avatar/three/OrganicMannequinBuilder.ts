import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { MeasurementOverlayRig } from "@/features/avatar/three/MeasurementOverlayRig";
import type {
  AvatarRigInstance,
  MetricAnchorInfo,
} from "@/features/avatar/three/avatarRigTypes";
import {
  computeAnthropometricFrame,
  type AnthropometricFrame,
} from "@/features/avatar/three/bodyCalibration";
import {
  applySkinSubsurfaceRim,
  createSkinDetailNormalTexture,
  createSkinRoughnessTexture,
} from "@/features/avatar/three/skinShading";
import type {
  ActiveBodyMetric,
  AvatarDraft,
  GenderStyle,
  HairStyle,
} from "@/types/bodyProfile";

const TORSO_RINGS = 56;
const TORSO_SEGS = 56;
const LIMB_RINGS = 26;
const LIMB_SEGS = 24;
const STUDIO_APPAREL_COLOR = new THREE.Color("#262D38");

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / Math.max(edge1 - edge0, 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

function catmullRomValue(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function interpolateKeyframes(
  keyframes: ReadonlyArray<{ t: number; v: number }>,
  t: number
): number {
  if (t <= keyframes[0].t) return keyframes[0].v;
  const last = keyframes[keyframes.length - 1];
  if (t >= last.t) return last.v;

  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].t < t) {
    i++;
  }
  const k1 = keyframes[i];
  const k2 = keyframes[i + 1];
  const k0 = keyframes[Math.max(0, i - 1)];
  const k3 = keyframes[Math.min(keyframes.length - 1, i + 2)];
  const localT = (t - k1.t) / Math.max(k2.t - k1.t, 1e-5);
  return catmullRomValue(k0.v, k1.v, k2.v, k3.v, localT);
}

function createLoftedBufferGeometry(
  rings: number,
  segs: number,
  withVertexColors = false
): THREE.BufferGeometry {
  const vertCount = (rings + 1) * (segs + 1);
  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const indices: number[] = [];

  for (let r = 0; r <= rings; r++) {
    const v = r / rings;
    for (let s = 0; s <= segs; s++) {
      const u = s / segs;
      const idx = r * (segs + 1) + s;
      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = v;
    }
  }

  const stride = segs + 1;
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segs; s++) {
      const a = r * stride + s;
      const b = r * stride + (s + 1);
      const c = (r + 1) * stride + (s + 1);
      const d = (r + 1) * stride + s;
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  if (withVertexColors) {
    const colors = new Float32Array(vertCount * 3);
    colors.fill(1);
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }
  geometry.setIndex(indices);
  return geometry;
}

function weldSeamNormals(
  geometry: THREE.BufferGeometry,
  rings: number,
  segs: number
): void {
  geometry.computeVertexNormals();
  const normalAttr = geometry.attributes.normal as THREE.BufferAttribute;
  const stride = segs + 1;
  for (let r = 0; r <= rings; r++) {
    const first = r * stride;
    const last = r * stride + segs;
    const nx = (normalAttr.getX(first) + normalAttr.getX(last)) * 0.5;
    const ny = (normalAttr.getY(first) + normalAttr.getY(last)) * 0.5;
    const nz = (normalAttr.getZ(first) + normalAttr.getZ(last)) * 0.5;
    const len = Math.hypot(nx, ny, nz) || 1;
    normalAttr.setXYZ(first, nx / len, ny / len, nz / len);
    normalAttr.setXYZ(last, nx / len, ny / len, nz / len);
  }
  normalAttr.needsUpdate = true;
}

function createMicroSkinTexture(): THREE.DataTexture {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  let seed = 1337;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < size * size; i++) {
    const grain = Math.floor(118 + nextRand() * 20);
    data[i * 4] = grain;
    data[i * 4 + 1] = grain;
    data[i * 4 + 2] = grain;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.needsUpdate = true;
  return tex;
}

function createSculptedHeadGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.1, 48, 36);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x0 = pos.getX(i);
    const y0 = pos.getY(i);
    const z0 = pos.getZ(i);

    const nx = x0 / 0.1; // [-1, 1]
    const ny = y0 / 0.1; // [-1, 1]
    const nz = z0 / 0.1; // [-1, 1]

    // Cranial vs jawline envelope
    const jawTaper =
      ny < 0.05 ? 1 - 0.36 * Math.pow(smoothstep(0.05, -1.0, ny), 1.35) : 1;
    const templePinch =
      nz > 0.25 && ny > 0.1 ? 1 - 0.05 * smoothstep(0.25, 0.9, nz) : 1;
    const cheekbone =
      nz > 0.25 && Math.abs(nx) > 0.35
        ? 0.0055 *
          Math.exp(-Math.pow((ny + 0.05) / 0.22, 2)) *
          Math.exp(-Math.pow((Math.abs(nx) - 0.56) / 0.26, 2))
        : 0;

    let x = x0 * 0.78 * jawTaper * templePinch + Math.sign(x0) * cheekbone;
    const y = y0 * 1.12;

    // Back cranium fullness + chin projection
    const occiput = nz < -0.2 && ny > -0.25 ? -0.008 * smoothstep(-0.2, -0.9, nz) * (1 - Math.abs(ny) * 0.4) : 0;
    const jawZ = ny < 0 ? 1 - 0.22 * smoothstep(0, -1, ny) : 1;
    let z = z0 * 0.95 * jawZ + occiput;

    if (nz > 0.3) {
      const faceMask = smoothstep(0.3, 0.7, nz);
      // Subtle brow arch
      const brow =
        0.0052 *
        Math.exp(-Math.pow((ny - 0.19) / 0.11, 2)) *
        Math.exp(-Math.pow(nx / 0.56, 2));
      // Soft bilateral orbital hollows (eye sockets)
      const eyeHollow =
        -0.0068 *
        Math.exp(-Math.pow((ny - 0.065) / 0.12, 2)) *
        Math.exp(-Math.pow((Math.abs(nx) - 0.3) / 0.17, 2));
      // Defined nasal bridge & tip
      const noseBridge =
        0.0155 *
        Math.exp(-Math.pow(nx / 0.145, 2)) *
        Math.exp(-Math.pow((ny + 0.055) / 0.22, 2));
      const noseTip =
        0.0075 *
        Math.exp(-Math.pow(nx / 0.125, 2)) *
        Math.exp(-Math.pow((ny + 0.185) / 0.085, 2));
      // Gentle upper & lower lip contour
      const upperLip =
        0.0046 *
        Math.exp(-Math.pow(nx / 0.22, 2)) *
        Math.exp(-Math.pow((ny + 0.37) / 0.055, 2));
      const lowerLip =
        0.0042 *
        Math.exp(-Math.pow(nx / 0.2, 2)) *
        Math.exp(-Math.pow((ny + 0.48) / 0.055, 2));
      // Forward chin contour
      const chin =
        0.0095 *
        Math.exp(-Math.pow(nx / 0.28, 2)) *
        Math.exp(-Math.pow((ny + 0.74) / 0.18, 2));

      z +=
        faceMask *
        (brow + eyeHollow + noseBridge + noseTip + upperLip + lowerLip + chin);
    }

    // Subtle ear ridge contours along sides slightly behind centerline
    if (Math.abs(nx) > 0.72 && Math.abs(ny) < 0.24 && nz < 0.12 && nz > -0.35) {
      x +=
        Math.sign(nx) *
        0.0065 *
        Math.exp(-Math.pow(ny / 0.16, 2)) *
        Math.exp(-Math.pow((nz + 0.1) / 0.14, 2));
    }

    // Vertex-level skin tint: blush, lips, eye sockets, brow, ear warmth.
    // This costs one extra color attribute and removes the "white egg" look
    // without needing a face texture.
    const faceMask = smoothstep(0.3, 0.7, nz);
    const cheek =
      Math.exp(-Math.pow((ny + 0.02) / 0.18, 2)) *
      Math.exp(-Math.pow((Math.abs(nx) - 0.46) / 0.22, 2)) *
      faceMask;
    const lipBand =
      Math.exp(-Math.pow(nx / 0.24, 2)) *
      (Math.exp(-Math.pow((ny + 0.37) / 0.055, 2)) +
        Math.exp(-Math.pow((ny + 0.48) / 0.055, 2)));
    const socket =
      Math.exp(-Math.pow((ny - 0.065) / 0.11, 2)) *
      Math.exp(-Math.pow((Math.abs(nx) - 0.3) / 0.16, 2)) *
      faceMask;
    const browShade =
      Math.exp(-Math.pow((ny - 0.2) / 0.09, 2)) *
      Math.exp(-Math.pow(nx / 0.55, 2)) *
      faceMask;
    const earWarmth =
      Math.abs(nx) > 0.72 && Math.abs(ny) < 0.24 && nz < 0.12 && nz > -0.35
        ? 1
        : 0;
    const noseWarmth =
      Math.exp(-Math.pow(nx / 0.16, 2)) *
      Math.exp(-Math.pow((ny + 0.2) / 0.1, 2)) *
      faceMask;

    const cr =
      1 + cheek * 0.05 + lipBand * 0.07 + earWarmth * 0.06 + noseWarmth * 0.03
        - socket * 0.04 - browShade * 0.03;
    const cg =
      1 + cheek * 0.01 - lipBand * 0.02 + earWarmth * 0.01
        - socket * 0.05 - browShade * 0.03;
    const cb =
      1 - cheek * 0.01 - lipBand * 0.01 - socket * 0.05 - browShade * 0.03;

    colors[i * 3] = THREE.MathUtils.clamp(cr, 0.75, 1.15);
    colors[i * 3 + 1] = THREE.MathUtils.clamp(cg, 0.75, 1.15);
    colors[i * 3 + 2] = THREE.MathUtils.clamp(cb, 0.75, 1.15);

    pos.setXYZ(i, x, y, z);
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function createSculptedFootGeometry(sideSign: 1 | -1): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.05, 24, 18);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x0 = pos.getX(i);
    const y0 = pos.getY(i);
    const z0 = pos.getZ(i);

    const nx = x0 / 0.05;
    const ny = y0 / 0.05;
    const nz = z0 / 0.05;

    // Extend along Z (heel at -0.05m, toes at +0.16m), keep sole near y = 0
    const z = nz >= 0 ? nz * 0.148 : nz * 0.056;
    const widthProfile = 0.66 + 0.28 * smoothstep(-0.3, 0.45, nz) - 0.18 * smoothstep(0.6, 1.0, nz);
    const asymmetry = nz > 0.45 ? sideSign * -0.004 * smoothstep(0.45, 1.0, nz) : 0;
    const x = x0 * 0.86 * widthProfile + asymmetry;

    // Flatten sole & sculpt dorsal instep arch tapering toward toes
    const dorsalHeight = 0.056 * (1 - 0.56 * smoothstep(-0.1, 0.95, nz));
    let y = ny >= 0 ? ny * dorsalHeight : ny * 0.008;
    // Slight plantar arch lift in midfoot
    if (ny < 0 && nz > -0.25 && nz < 0.45) {
      y += 0.004 * Math.exp(-Math.pow((nz - 0.1) / 0.25, 2));
    }
    if (Math.abs(nx) > 0.3 && nz > 0.5) {
      y *= 0.88;
    }

    pos.setXYZ(i, x, y + 0.008, z + 0.014);
  }

  geo.computeVertexNormals();
  return geo;
}

function createFingerSegment(
  length: number,
  radius: number,
  start: THREE.Vector3,
  rotX: number,
  rotZ: number
): THREE.BufferGeometry {
  const geo = new THREE.CapsuleGeometry(
    radius,
    Math.max(length - radius * 2, 0.004),
    4,
    10
  );
  geo.translate(0, -length * 0.5, 0);
  const matrix = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(rotX, 0, rotZ, "XYZ")
  );
  matrix.setPosition(start);
  geo.applyMatrix4(matrix);
  return geo;
}

function createFingerTip(
  radius: number,
  at: THREE.Vector3
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(radius, 10, 8);
  geo.translate(at.x, at.y, at.z);
  return geo;
}

/**
 * One merged hand mesh: palm slab + 4 articulated fingers + thumb.
 * The whole hand is a single BufferGeometry (one draw call) so adding
 * anatomical detail does not cost extra GPU state changes.
 *
 * Local frame: palm plane in YZ (thickness along X), fingers hang along -Y,
 * thumb on the anterior (+Z) side — i.e. arms relaxed at the sides with
 * palms facing the thighs.
 */
function createSculptedHandGroup(
  sideSign: 1 | -1,
  mat: THREE.Material
): THREE.Group {
  const parts: THREE.BufferGeometry[] = [];

  // Palm: ~8cm wide, ~10cm long, ~3cm thick, tapering into the wrist.
  const palmGeo = new THREE.SphereGeometry(0.05, 24, 18);
  const pPos = palmGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pPos.count; i++) {
    const nx = pPos.getX(i) / 0.05;
    const ny = pPos.getY(i) / 0.05;
    const nz = pPos.getZ(i) / 0.05;
    const wristTaper = ny < 0 ? 1 - 0.16 * smoothstep(0, -1, ny) : 1;
    const knuckleFullness = 1 + 0.05 * smoothstep(0.15, 0.85, ny);
    pPos.setXYZ(
      i,
      nx * 0.0145,
      ny * 0.05,
      nz * 0.039 * wristTaper * knuckleFullness
    );
  }
  palmGeo.computeVertexNormals();
  parts.push(palmGeo);

  const baseY = -0.043;
  const fingers = [
    { z: 0.026, len: 0.062, radius: 0.0086, curl: 0.1 },
    { z: 0.009, len: 0.07, radius: 0.009, curl: 0.11 },
    { z: -0.009, len: 0.065, radius: 0.0084, curl: 0.12 },
    { z: -0.026, len: 0.052, radius: 0.0074, curl: 0.14 },
  ];

  for (const finger of fingers) {
    const proximal = finger.len * 0.55;
    const distal = finger.len * 0.45;
    const a1 = -sideSign * finger.curl;
    const a2 = a1 - sideSign * finger.curl * 1.6;

    const p1 = new THREE.Vector3(0, baseY, finger.z);
    const p2 = new THREE.Vector3(
      p1.x + Math.sin(a1) * proximal,
      p1.y - Math.cos(a1) * proximal,
      p1.z
    );
    const p3 = new THREE.Vector3(
      p2.x + Math.sin(a2) * distal,
      p2.y - Math.cos(a2) * distal,
      p2.z
    );

    parts.push(createFingerSegment(proximal, finger.radius, p1, 0, a1));
    parts.push(
      createFingerSegment(distal, finger.radius * 0.9, p2, 0, a2)
    );
    parts.push(createFingerTip(finger.radius * 0.88, p3));
  }

  // Thumb: anterior side, angled forward and slightly inward.
  const thumbLen = 0.048;
  const thumbRotX = -0.6;
  const thumbRotZ = -sideSign * 0.15;
  const thumbBase = new THREE.Vector3(0, 0.004, 0.03);
  const thumbDir = new THREE.Vector3(0, -thumbLen, 0)
    .applyEuler(new THREE.Euler(thumbRotX, 0, thumbRotZ, "XYZ"));
  parts.push(
    createFingerSegment(thumbLen, 0.0095, thumbBase, thumbRotX, thumbRotZ)
  );
  parts.push(
    createFingerTip(0.0088, thumbBase.clone().add(thumbDir))
  );

  const merged = mergeGeometries(parts, false);
  for (const part of parts) part.dispose();

  const group = new THREE.Group();
  const handMesh = new THREE.Mesh(merged, mat);
  handMesh.castShadow = true;
  handMesh.receiveShadow = true;
  group.add(handMesh);
  return group;
}

export class OrganicMannequinRig implements AvatarRigInstance {
  readonly root: THREE.Group;
  readonly mode = "parametric" as const;
  readonly breathPivot: THREE.Group;

  private readonly skinBumpTexture: THREE.DataTexture;
  private readonly skinDetailNormal: THREE.DataTexture;
  private readonly skinRoughnessTexture: THREE.DataTexture;
  private readonly skinMaterial: THREE.MeshPhysicalMaterial;
  private readonly torsoMaterial: THREE.MeshPhysicalMaterial;
  private readonly legMaterial: THREE.MeshPhysicalMaterial;
  private readonly jointMaterial: THREE.MeshPhysicalMaterial;
  private readonly faceMaterial: THREE.MeshPhysicalMaterial;
  private readonly hairMaterial: THREE.MeshPhysicalMaterial;
  private readonly hairCurtainMaterial: THREE.MeshPhysicalMaterial;

  private readonly torsoGeometry: THREE.BufferGeometry;
  private readonly torsoColorAttr: THREE.BufferAttribute;
  private readonly leftLegGeometry: THREE.BufferGeometry;
  private readonly leftLegColorAttr: THREE.BufferAttribute;
  private readonly rightLegGeometry: THREE.BufferGeometry;
  private readonly rightLegColorAttr: THREE.BufferAttribute;
  private readonly leftArmGeometry: THREE.BufferGeometry;
  private readonly rightArmGeometry: THREE.BufferGeometry;

  private readonly torsoMesh: THREE.Mesh;
  private readonly headGroup: THREE.Group;
  private readonly neckMesh: THREE.Mesh;
  private readonly headMesh: THREE.Mesh;
  private readonly leftFootMesh: THREE.Mesh;
  private readonly rightFootMesh: THREE.Mesh;
  private readonly leftHandGroup: THREE.Group;
  private readonly rightHandGroup: THREE.Group;

  private readonly hairGroups: Record<HairStyle, THREE.Group>;
  private readonly overlay: MeasurementOverlayRig;

  private lastFrame: AnthropometricFrame | null = null;
  private lastGender: GenderStyle = "female";
  private lastIsLinen = false;
  private prevHighlightIntensity = 0;

  private anchors: MetricAnchorInfo = {
    chestY: 1.18,
    waistY: 1.02,
    hipsY: 0.84,
    shoulderY: 1.33,
    heightM: 1.63,
    shoulderHalfW: 0.19,
    zones: {
      chest: { y: 1.18, z: 0.008, rx: 0.14, rz: 0.1 },
      waist: { y: 1.02, z: 0.012, rx: 0.11, rz: 0.08 },
      hips: { y: 0.84, z: -0.006, rx: 0.15, rz: 0.11 },
      shoulder: { y: 1.33, z: -0.006, rx: 0.19, rz: 0.09 },
    },
  };

  constructor() {
    this.root = new THREE.Group();
    this.root.name = "MidoraOrganicMannequin";
    this.breathPivot = new THREE.Group();
    this.root.add(this.breathPivot);

    this.skinBumpTexture = createMicroSkinTexture();
    this.skinDetailNormal = createSkinDetailNormalTexture();
    this.skinDetailNormal.repeat.set(14, 14);
    this.skinRoughnessTexture = createSkinRoughnessTexture();
    this.skinRoughnessTexture.repeat.set(9, 9);

    const makeSkinMat = (vertexColors = false) => {
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#D9AE8C"),
        roughness: 0.5,
        metalness: 0.0,
        sheen: 0.32,
        sheenRoughness: 0.68,
        sheenColor: new THREE.Color("#FFDCCB"),
        clearcoat: 0.07,
        clearcoatRoughness: 0.42,
        specularIntensity: 0.5,
        ior: 1.4,
        normalMap: this.skinDetailNormal,
        normalScale: new THREE.Vector2(0.25, 0.25),
        roughnessMap: this.skinRoughnessTexture,
        bumpMap: this.skinBumpTexture,
        bumpScale: 0.00025,
        envMapIntensity: 0.9,
        vertexColors,
      });
      // Warm grazing-angle bleed: the cheap stand-in for subsurface scattering.
      applySkinSubsurfaceRim(material, { strength: 1 });
      return material;
    };

    this.skinMaterial = makeSkinMat(false);
    this.torsoMaterial = makeSkinMat(true);
    this.legMaterial = makeSkinMat(true);
    this.jointMaterial = makeSkinMat(false);
    this.faceMaterial = makeSkinMat(true);

    this.hairMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#291F1A"),
      roughness: 0.52,
      metalness: 0.0,
      sheen: 0.55,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#6B4A33"),
      specularIntensity: 0.7,
      clearcoat: 0.12,
      clearcoatRoughness: 0.35,
      ior: 1.55,
    });
    this.hairCurtainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#291F1A"),
      roughness: 0.54,
      metalness: 0.0,
      sheen: 0.55,
      sheenRoughness: 0.52,
      sheenColor: new THREE.Color("#6B4A33"),
      specularIntensity: 0.65,
      clearcoat: 0.1,
      clearcoatRoughness: 0.4,
      ior: 1.55,
      side: THREE.DoubleSide,
    });

    // 1. Torso & Limbs
    this.torsoGeometry = createLoftedBufferGeometry(TORSO_RINGS, TORSO_SEGS, true);
    this.torsoColorAttr = this.torsoGeometry.attributes.color as THREE.BufferAttribute;
    this.torsoMesh = new THREE.Mesh(this.torsoGeometry, this.torsoMaterial);
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.breathPivot.add(this.torsoMesh);

    this.leftLegGeometry = createLoftedBufferGeometry(LIMB_RINGS, LIMB_SEGS, true);
    this.leftLegColorAttr = this.leftLegGeometry.attributes.color as THREE.BufferAttribute;
    const leftLegMesh = new THREE.Mesh(this.leftLegGeometry, this.legMaterial);
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    this.root.add(leftLegMesh);

    this.rightLegGeometry = createLoftedBufferGeometry(LIMB_RINGS, LIMB_SEGS, true);
    this.rightLegColorAttr = this.rightLegGeometry.attributes.color as THREE.BufferAttribute;
    const rightLegMesh = new THREE.Mesh(this.rightLegGeometry, this.legMaterial);
    rightLegMesh.castShadow = true;
    rightLegMesh.receiveShadow = true;
    this.root.add(rightLegMesh);

    this.leftArmGeometry = createLoftedBufferGeometry(LIMB_RINGS, LIMB_SEGS);
    const leftArmMesh = new THREE.Mesh(this.leftArmGeometry, this.skinMaterial);
    leftArmMesh.castShadow = true;
    leftArmMesh.receiveShadow = true;
    this.breathPivot.add(leftArmMesh);

    this.rightArmGeometry = createLoftedBufferGeometry(LIMB_RINGS, LIMB_SEGS);
    const rightArmMesh = new THREE.Mesh(this.rightArmGeometry, this.skinMaterial);
    rightArmMesh.castShadow = true;
    rightArmMesh.receiveShadow = true;
    this.breathPivot.add(rightArmMesh);

    // 2. Sculpted anatomical feet & articulated thumb+palm hands
    this.leftFootMesh = new THREE.Mesh(
      createSculptedFootGeometry(-1),
      this.jointMaterial
    );
    this.leftFootMesh.castShadow = true;
    this.leftFootMesh.receiveShadow = true;

    this.rightFootMesh = new THREE.Mesh(
      createSculptedFootGeometry(1),
      this.jointMaterial
    );
    this.rightFootMesh.castShadow = true;
    this.rightFootMesh.receiveShadow = true;
    this.root.add(this.leftFootMesh, this.rightFootMesh);

    this.leftHandGroup = createSculptedHandGroup(-1, this.jointMaterial);
    this.rightHandGroup = createSculptedHandGroup(1, this.jointMaterial);
    this.breathPivot.add(this.leftHandGroup, this.rightHandGroup);

    // 3. Neck & Sculpted Head
    const neckGeo = new THREE.CylinderGeometry(0.044, 0.056, 0.11, 28);
    this.neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    this.neckMesh.castShadow = true;
    this.neckMesh.receiveShadow = true;
    this.breathPivot.add(this.neckMesh);

    this.headGroup = new THREE.Group();
    this.headMesh = new THREE.Mesh(createSculptedHeadGeometry(), this.faceMaterial);
    this.headMesh.castShadow = true;
    this.headMesh.receiveShadow = true;
    this.headGroup.add(this.headMesh);

    this.hairGroups = this.buildHairStyles();
    for (const group of Object.values(this.hairGroups)) {
      this.headGroup.add(group);
    }
    this.breathPivot.add(this.headGroup);

    // 4. Shared Measurement Overlay
    this.overlay = new MeasurementOverlayRig();
    this.root.add(this.overlay.group);
  }

  private buildHairStyles(): Record<HairStyle, THREE.Group> {
    const none = new THREE.Group();

    const shortClean = new THREE.Group();
    const shortCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.088, 30, 22, 0, Math.PI * 2, 0, Math.PI * 0.56),
      this.hairMaterial
    );
    shortCap.scale.set(0.95, 1.15, 1.07);
    shortCap.position.set(0, 0.015, -0.014);
    shortCap.rotation.x = -0.32;
    const crownVolume = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 22, 16),
      this.hairMaterial
    );
    crownVolume.scale.set(1.06, 0.92, 0.92);
    crownVolume.position.set(0, 0.022, -0.044);
    shortClean.add(shortCap, crownVolume);

    const mediumBob = new THREE.Group();
    const bobCap = shortCap.clone();
    const bobCurtain = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.086,
        0.104,
        0.185,
        32,
        1,
        true,
        Math.PI * 0.34,
        Math.PI * 1.32
      ),
      this.hairCurtainMaterial
    );
    bobCurtain.position.set(0, -0.052, -0.016);
    bobCurtain.rotation.x = 0.08;
    mediumBob.add(bobCap, bobCurtain);

    const longStraight = new THREE.Group();
    const longCap = shortCap.clone();
    const longCurtain = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.088,
        0.118,
        0.33,
        32,
        1,
        true,
        Math.PI * 0.36,
        Math.PI * 1.28
      ),
      this.hairCurtainMaterial
    );
    longCurtain.position.set(0, -0.125, -0.022);
    longCurtain.rotation.x = 0.1;
    longStraight.add(longCap, longCurtain);

    return {
      none,
      short_clean: shortClean,
      medium_bob: mediumBob,
      long_straight: longStraight,
    };
  }

  getAnchors(): MetricAnchorInfo {
    return this.anchors;
  }

  update(draft: AvatarDraft): void {
    const frame = computeAnthropometricFrame(draft);
    this.lastFrame = frame;

    const { genderStyle, skinTone, hairStyle } =
      draft.avatarCustomizationParams;
    this.lastGender = genderStyle;
    const isLinen = skinTone.toLowerCase() === "#e5ddd0";
    this.lastIsLinen = isLinen;

    this.skinMaterial.color.set(skinTone);
    this.torsoMaterial.color.set(skinTone);
    this.legMaterial.color.set(skinTone);
    this.jointMaterial.color.set(skinTone).multiplyScalar(0.97);

    const matRoughness = isLinen ? 0.9 : 0.55;
    const matSheen = isLinen ? 0.12 : 0.32;
    const bump = isLinen ? 0.0022 : 0.00025;
    const detailScale = isLinen ? 0.12 : 0.25;
    for (const m of [
      this.skinMaterial,
      this.torsoMaterial,
      this.legMaterial,
      this.jointMaterial,
      this.faceMaterial,
    ]) {
      m.roughness = matRoughness;
      m.sheen = matSheen;
      m.bumpScale = bump;
      m.normalScale.set(detailScale, detailScale);
      m.clearcoat = isLinen ? 0.02 : 0.07;
      m.specularIntensity = isLinen ? 0.35 : 0.5;
      m.envMapIntensity = isLinen ? 0.65 : 0.9;
    }

    (Object.keys(this.hairGroups) as HairStyle[]).forEach((style) => {
      this.hairGroups[style].visible = style === hairStyle;
    });

    const {
      H,
      fullness,
      hipsRadii,
      waistRadii,
      chestRadii,
      shoulderHalfW,
      shoulderRz,
      crotchY,
      neckBaseY,
      tHips,
      tWaist,
      tChest,
      tShoulder,
      bustProjectionM,
      gluteProjectionM,
      headHeightM,
      neckHeightM,
      chinY,
    } = frame;

    const torsoBottomY = crotchY - 0.022;
    const effectiveTorsoH = neckBaseY - torsoBottomY;

    const rxKeys = [
      { t: 0.0, v: hipsRadii.rx * 0.44 },
      { t: 0.04, v: hipsRadii.rx * 0.86 },
      { t: tHips, v: hipsRadii.rx },
      { t: tWaist, v: waistRadii.rx },
      { t: tChest, v: chestRadii.rx },
      { t: tShoulder, v: shoulderHalfW * 0.94 },
      { t: 0.97, v: 0.072 },
      { t: 1.0, v: 0.05 },
    ];

    const rzKeys = [
      { t: 0.0, v: hipsRadii.rz * 0.56 },
      { t: 0.04, v: hipsRadii.rz * 0.88 },
      { t: tHips, v: hipsRadii.rz },
      { t: tWaist, v: waistRadii.rz },
      { t: tChest, v: chestRadii.rz },
      { t: tShoulder, v: shoulderRz },
      { t: 0.97, v: 0.056 },
      { t: 1.0, v: 0.046 },
    ];

    const zOffsetKeys = [
      { t: 0.0, v: -0.004 },
      { t: tHips, v: -0.005 },
      { t: tWaist, v: 0.012 },
      { t: tChest, v: 0.008 },
      { t: tShoulder, v: -0.006 },
      { t: 1.0, v: 0.005 },
    ];

    // 1. Sculpted Anatomical Torso Mesh
    const torsoPos = this.torsoGeometry.attributes.position as THREE.BufferAttribute;
    const stride = TORSO_SEGS + 1;

    for (let r = 0; r <= TORSO_RINGS; r++) {
      const t = r / TORSO_RINGS;
      const y = torsoBottomY + t * effectiveTorsoH;
      const baseRx = interpolateKeyframes(rxKeys, t);
      const baseRz = interpolateKeyframes(rzKeys, t);
      const zOff = interpolateKeyframes(zOffsetKeys, t);

      const chestEnv = Math.exp(-Math.pow((t - tChest) / 0.105, 2));
      const gluteEnv = Math.exp(-Math.pow((t - (tHips * 0.95)) / 0.095, 2));
      const spineEnv = Math.exp(-Math.pow((t - 0.56) / 0.3, 2));
      const squareMix = 0.032 * smoothstep(0.08, 0.85, t);

      for (let s = 0; s <= TORSO_SEGS; s++) {
        const theta = (s / TORSO_SEGS) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Mild anatomical ribcage/pelvis squaring via cos(4*theta)
        const ribShape = 1 + squareMix * (1 - Math.cos(4 * theta)) * 0.5;
        let x = baseRx * ribShape * cosT;
        let z = baseRz * ribShape * sinT + zOff;

        if (sinT > 0) {
          // Bilateral left/right chest or bust contour + sternum indentation
          const absCos = Math.abs(cosT);
          const bilateralLobe = Math.exp(-Math.pow((absCos - 0.38) / 0.3, 2));
          const sternumCleavage =
            Math.exp(-Math.pow(cosT / 0.15, 2)) *
            (genderStyle === "female" ? 0.0055 : 0.0025);
          const archFactor = Math.pow(sinT, 1.35);
          z += chestEnv * archFactor * (bustProjectionM * bilateralLobe - sternumCleavage);

          // Clavicle subtle collar contour near shoulder top
          if (t > 0.84 && t < 0.97) {
            const clavEnv = Math.exp(-Math.pow((t - 0.91) / 0.04, 2));
            z += clavEnv * 0.003 * Math.exp(-Math.pow((absCos - 0.45) / 0.25, 2)) * sinT;
          }
        } else {
          // Bilateral gluteal curves + posterior spinal furrow
          const backFactor = Math.pow(-sinT, 1.4);
          const absCos = Math.abs(cosT);
          const gluteLobe = Math.exp(-Math.pow((absCos - 0.36) / 0.32, 2));
          const gluteCleft = Math.exp(-Math.pow(cosT / 0.12, 2)) * 0.0055;
          z -= gluteEnv * backFactor * (gluteProjectionM * gluteLobe - gluteCleft);

          const spineFurrow = 0.0075 * spineEnv * Math.exp(-Math.pow(cosT / 0.18, 2));
          z += spineFurrow * backFactor;
        }

        // Subtle shoulder-cap drop near neck root
        if (t > 0.9 && Math.abs(cosT) > 0.72) {
          x *= 0.99;
        }

        torsoPos.setXYZ(r * stride + s, x, y, z);
      }
    }
    torsoPos.needsUpdate = true;
    weldSeamNormals(this.torsoGeometry, TORSO_RINGS, TORSO_SEGS);
    this.torsoGeometry.computeBoundingSphere();

    // 2. Anatomically Proportioned Legs (Quadriceps -> Patella -> Calf -> Ankle)
    const legSpanX = hipsRadii.rx * 0.46;
    const thighRadius = hipsRadii.rx * 0.455 * (1 + fullness * 0.075);
    const kneeRadius = Math.max(0.045, thighRadius * 0.67);
    const calfRadius = Math.max(0.047, thighRadius * 0.73);
    const ankleRadius = Math.max(0.031, thighRadius * 0.46);
    const legTopY = crotchY + 0.032 * H;
    const ankleY = 0.044 * H;
    const kneeY = 0.285 * H;
    const calfY = 0.175 * H;

    this.updateLimbGeometry(
      this.leftLegGeometry,
      [
        { y: ankleY - 0.014 * H, x: -legSpanX * 0.88, z: -0.006, rx: 0.006, rz: 0.006 },
        { y: ankleY, x: -legSpanX * 0.88, z: -0.006, rx: ankleRadius * 0.95, rz: ankleRadius * 1.08 },
        { y: calfY, x: -legSpanX * 0.91, z: -0.012, rx: calfRadius * 0.98, rz: calfRadius * 1.07 },
        { y: kneeY, x: -legSpanX * 0.95, z: 0.005, rx: kneeRadius * 0.98, rz: kneeRadius * 1.02 },
        { y: (kneeY + legTopY) * 0.48, x: -legSpanX * 0.98, z: 0.004, rx: thighRadius * 0.9, rz: thighRadius * 0.97 },
        { y: legTopY, x: -legSpanX * 0.99, z: -0.002, rx: thighRadius, rz: thighRadius * 1.08 },
        { y: legTopY + 0.024 * H, x: -legSpanX * 0.84, z: -0.002, rx: thighRadius * 0.45, rz: thighRadius * 0.48 },
      ],
      false
    );

    this.updateLimbGeometry(
      this.rightLegGeometry,
      [
        { y: ankleY - 0.014 * H, x: legSpanX * 0.88, z: -0.006, rx: 0.006, rz: 0.006 },
        { y: ankleY, x: legSpanX * 0.88, z: -0.006, rx: ankleRadius * 0.95, rz: ankleRadius * 1.08 },
        { y: calfY, x: legSpanX * 0.91, z: -0.012, rx: calfRadius * 0.98, rz: calfRadius * 1.07 },
        { y: kneeY, x: legSpanX * 0.95, z: 0.005, rx: kneeRadius * 0.98, rz: kneeRadius * 1.02 },
        { y: (kneeY + legTopY) * 0.48, x: legSpanX * 0.98, z: 0.004, rx: thighRadius * 0.9, rz: thighRadius * 0.97 },
        { y: legTopY, x: legSpanX * 0.99, z: -0.002, rx: thighRadius, rz: thighRadius * 1.08 },
        { y: legTopY + 0.024 * H, x: legSpanX * 0.84, z: -0.002, rx: thighRadius * 0.45, rz: thighRadius * 0.48 },
      ],
      false
    );

    const footScale = THREE.MathUtils.clamp(0.92 + (H - 1.66) * 0.25, 0.84, 1.08);
    this.leftFootMesh.scale.setScalar(footScale);
    this.leftFootMesh.position.set(-legSpanX * 0.89, 0.0, 0.004);
    this.leftFootMesh.rotation.y = 0.06;

    this.rightFootMesh.scale.setScalar(footScale);
    this.rightFootMesh.position.set(legSpanX * 0.89, 0.0, 0.004);
    this.rightFootMesh.rotation.y = -0.06;

    // 3. Relaxed A-Pose Arms with Deltoid Shoulder Overlap & Sculpted Hands
    const armTopY = frame.shoulderY - 0.012 * H;
    const armOutX = shoulderHalfW * 0.92;
    const armRadius = THREE.MathUtils.clamp(0.039 + fullness * 0.0085, 0.032, 0.058);
    const wristRadius = armRadius * 0.63;
    const wristX = armOutX + 0.072 * H;
    const wristY = crotchY + 0.025 * H;

    this.updateLimbGeometry(
      this.leftArmGeometry,
      [
        { y: wristY - 0.01 * H, x: -wristX, z: 0.036, rx: 0.004, rz: 0.004 },
        { y: wristY, x: -wristX, z: 0.035, rx: wristRadius * 0.88, rz: wristRadius * 0.74 },
        { y: wristY + 0.075 * H, x: -(armOutX + 0.061 * H), z: 0.016, rx: armRadius * 0.84, rz: armRadius * 0.82 },
        { y: armTopY - 0.175 * H, x: -(armOutX + 0.043 * H), z: -0.003, rx: armRadius * 0.88, rz: armRadius * 0.9 },
        { y: armTopY - 0.075 * H, x: -(armOutX + 0.02 * H), z: -0.005, rx: armRadius * 1.03, rz: armRadius * 1.02 },
        { y: armTopY, x: -armOutX * 0.93, z: -0.004, rx: armRadius * 1.15, rz: armRadius * 1.1 },
        { y: armTopY + 0.018 * H, x: -armOutX * 0.76, z: -0.004, rx: armRadius * 0.65, rz: armRadius * 0.65 },
      ],
      false
    );

    this.updateLimbGeometry(
      this.rightArmGeometry,
      [
        { y: wristY - 0.01 * H, x: wristX, z: 0.036, rx: 0.004, rz: 0.004 },
        { y: wristY, x: wristX, z: 0.035, rx: wristRadius * 0.88, rz: wristRadius * 0.74 },
        { y: wristY + 0.075 * H, x: armOutX + 0.061 * H, z: 0.016, rx: armRadius * 0.84, rz: armRadius * 0.82 },
        { y: armTopY - 0.175 * H, x: armOutX + 0.043 * H, z: -0.003, rx: armRadius * 0.88, rz: armRadius * 0.9 },
        { y: armTopY - 0.075 * H, x: armOutX + 0.02 * H, z: -0.005, rx: armRadius * 1.03, rz: armRadius * 1.02 },
        { y: armTopY, x: armOutX * 0.93, z: -0.004, rx: armRadius * 1.15, rz: armRadius * 1.1 },
        { y: armTopY + 0.018 * H, x: armOutX * 0.76, z: -0.004, rx: armRadius * 0.65, rz: armRadius * 0.65 },
      ],
      false
    );

    const handScale = THREE.MathUtils.clamp(0.92 + (H - 1.66) * 0.2, 0.84, 1.08);
    this.leftHandGroup.scale.setScalar(handScale);
    this.leftHandGroup.position.set(-(wristX + 0.005), wristY - 0.048, 0.042);
    this.leftHandGroup.rotation.set(0.16, 0.12, -0.09);

    this.rightHandGroup.scale.setScalar(handScale);
    this.rightHandGroup.position.set(wristX + 0.005, wristY - 0.048, 0.042);
    this.rightHandGroup.rotation.set(0.16, -0.12, 0.09);

    // 4. Sub-linear Neck & Sculpted Head
    const neckLenScale = neckHeightM / 0.07;
    const neckThickScale = genderStyle === "male" ? 1.06 : 0.94;
    this.neckMesh.scale.set(neckThickScale, neckLenScale, neckThickScale);
    this.neckMesh.position.set(0, neckBaseY + neckHeightM * 0.56, 0.004);

    // Sphere head has vertical radius 0.1 * 1.12 = 0.112 -> height 0.224m
    const headScale = headHeightM / 0.224;
    this.headGroup.scale.setScalar(headScale);
    this.headGroup.position.set(0, chinY + headHeightM * 0.5, 0.01);

    // 5. Paint initial studio fitting apparel & AO shading
    this.paintBaseSurfaceColors(0, 0);

    // 6. Update Measurement Overlay Anchors
    this.anchors = frame.anchors;
    this.overlay.updateAnchors(this.anchors);
  }

  private paintBaseSurfaceColors(highlightY: number, highlightIntensity: number): void {
    const torsoColors = this.torsoColorAttr.array as Float32Array;
    const torsoPos = this.torsoGeometry.attributes.position as THREE.BufferAttribute;

    const frame = this.lastFrame;
    const showApparel = !this.lastIsLinen && frame !== null;
    const baseCol = this.torsoMaterial.color;
    const appMultR = THREE.MathUtils.clamp(STUDIO_APPAREL_COLOR.r / Math.max(baseCol.r, 0.02), 0.02, 3.2);
    const appMultG = THREE.MathUtils.clamp(STUDIO_APPAREL_COLOR.g / Math.max(baseCol.g, 0.02), 0.02, 3.2);
    const appMultB = THREE.MathUtils.clamp(STUDIO_APPAREL_COLOR.b / Math.max(baseCol.b, 0.02), 0.02, 3.2);

    for (let r = 0; r <= TORSO_RINGS; r++) {
      const t = r / TORSO_RINGS;
      const neckAO = 1 - 0.075 * smoothstep(0.92, 1.0, t);

      let apparelMask = 0;
      if (showApparel) {
        const shortsMask = 1 - smoothstep(0.32, 0.355, t);
        let topMask = 0;
        if (this.lastGender !== "male") {
          const topLow = smoothstep(0.615, 0.64, t);
          const topHigh = 1 - smoothstep(0.805, 0.835, t);
          topMask = topLow * topHigh;
        }
        apparelMask = Math.max(shortsMask, topMask);
      }

      for (let s = 0; s <= TORSO_SEGS; s++) {
        const idx = r * (TORSO_SEGS + 1) + s;
        const vy = torsoPos.getY(idx);

        let cr = (1 - apparelMask) * neckAO + apparelMask * appMultR;
        let cg = (1 - apparelMask) * neckAO + apparelMask * appMultG;
        let cb = (1 - apparelMask) * neckAO + apparelMask * appMultB;

        if (this.lastIsLinen) {
          // Subtle front/back tailoring princess seam line
          const theta = (s / TORSO_SEGS) * Math.PI * 2;
          const seam =
            Math.exp(-Math.pow(Math.cos(theta) / 0.03, 2)) * 0.07;
          cr -= seam;
          cg -= seam;
          cb -= seam;
        }

        if (highlightIntensity > 0.008) {
          const dist = vy - highlightY;
          const falloff =
            highlightIntensity * 0.52 * Math.exp(-(dist * dist) / (2 * 0.06 * 0.06));
          cr += falloff * 0.22;
          cg -= falloff * 0.16;
          cb -= falloff * 0.24;
        }

        torsoColors[idx * 3] = THREE.MathUtils.clamp(cr, 0.08, 2.0);
        torsoColors[idx * 3 + 1] = THREE.MathUtils.clamp(cg, 0.08, 2.0);
        torsoColors[idx * 3 + 2] = THREE.MathUtils.clamp(cb, 0.08, 2.0);
      }
    }
    this.torsoColorAttr.needsUpdate = true;

    // Matching shorts upper-thigh band on both legs
    for (const colorAttr of [this.leftLegColorAttr, this.rightLegColorAttr]) {
      const arr = colorAttr.array as Float32Array;
      for (let r = 0; r <= LIMB_RINGS; r++) {
        const v = r / LIMB_RINGS;
        const shortsLegMask = showApparel ? smoothstep(0.68, 0.725, v) : 0;
        const cr = (1 - shortsLegMask) + shortsLegMask * appMultR;
        const cg = (1 - shortsLegMask) + shortsLegMask * appMultG;
        const cb = (1 - shortsLegMask) + shortsLegMask * appMultB;
        for (let s = 0; s <= LIMB_SEGS; s++) {
          const idx = r * (LIMB_SEGS + 1) + s;
          arr[idx * 3] = THREE.MathUtils.clamp(cr, 0.08, 2.0);
          arr[idx * 3 + 1] = THREE.MathUtils.clamp(cg, 0.08, 2.0);
          arr[idx * 3 + 2] = THREE.MathUtils.clamp(cb, 0.08, 2.0);
        }
      }
      colorAttr.needsUpdate = true;
    }
  }

  private updateLimbGeometry(
    geometry: THREE.BufferGeometry,
    stations: ReadonlyArray<{
      y: number;
      x: number;
      z: number;
      rx: number;
      rz: number;
    }>,
    circularEndsOnly: boolean
  ): void {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const stride = LIMB_SEGS + 1;
    const tList = stations.map((_, idx) => idx / (stations.length - 1));

    const yKeys = stations.map((st, idx) => ({ t: tList[idx], v: st.y }));
    const xKeys = stations.map((st, idx) => ({ t: tList[idx], v: st.x }));
    const zKeys = stations.map((st, idx) => ({ t: tList[idx], v: st.z }));
    const rxKeys = stations.map((st, idx) => ({ t: tList[idx], v: st.rx }));
    const rzKeys = stations.map((st, idx) => ({ t: tList[idx], v: st.rz }));

    for (let r = 0; r <= LIMB_RINGS; r++) {
      const t = r / LIMB_RINGS;
      const cy = interpolateKeyframes(yKeys, t);
      const cx = interpolateKeyframes(xKeys, t);
      const cz = interpolateKeyframes(zKeys, t);
      const rx = interpolateKeyframes(rxKeys, t);
      const rz = interpolateKeyframes(rzKeys, t);

      for (let s = 0; s <= LIMB_SEGS; s++) {
        const theta = (s / LIMB_SEGS) * Math.PI * 2;
        const shinRidge =
          !circularEndsOnly && t > 0.12 && t < 0.45 && Math.sin(theta) < -0.2
            ? 1 + 0.06 * Math.sin(-theta)
            : 1;
        pos.setXYZ(
          r * stride + s,
          cx + rx * Math.cos(theta),
          cy,
          cz + rz * shinRidge * Math.sin(theta)
        );
      }
    }
    pos.needsUpdate = true;
    weldSeamNormals(geometry, LIMB_RINGS, LIMB_SEGS);
    geometry.computeBoundingSphere();
  }

  animate(
    elapsedSec: number,
    activeMetric: ActiveBodyMetric,
    showAllRings: boolean
  ): void {
    const breathWave = Math.sin(elapsedSec * 1.55) * 0.0028;
    this.breathPivot.position.y = breathWave * 0.35;
    this.breathPivot.scale.set(
      1 + breathWave * 0.5,
      1,
      1 + breathWave * 0.95
    );

    const { highlightY, highlightIntensity } = this.overlay.animate(
      elapsedSec,
      activeMetric,
      showAllRings
    );

    if (highlightIntensity > 0.008 || this.prevHighlightIntensity > 0.008) {
      this.paintBaseSurfaceColors(highlightY, highlightIntensity);
    }
    this.prevHighlightIntensity = highlightIntensity;
  }

  dispose(): void {
    this.overlay.dispose();
    this.skinBumpTexture.dispose();
    this.skinDetailNormal.dispose();
    this.skinRoughnessTexture.dispose();

    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();

    this.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        geos.add(obj.geometry);
        const list = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        for (const m of list) {
          mats.add(m);
        }
      }
    });

    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
  }
}
