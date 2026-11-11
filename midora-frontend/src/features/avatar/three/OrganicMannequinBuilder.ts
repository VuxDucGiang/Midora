import * as THREE from "three";
import type { ActiveBodyMetric, AvatarDraft, HairStyle } from "@/types/bodyProfile";

const TORSO_RINGS = 38;
const TORSO_SEGS = 40;
const LIMB_RINGS = 18;
const LIMB_SEGS = 20;
const BEAD_COUNT = 48;

const T_HIPS = 0.21;
const T_WAIST = 0.45;
const T_CHEST = 0.7;
const T_SHOULDER = 0.89;

/**
 * Converts a circumference (meters) and depth-to-width ratio k = rz / rx
 * into accurate ellipse semi-axes using Ramanujan's perimeter approximation.
 */
function circumferenceToRadii(circumferenceM: number, k: number): { rx: number; rz: number } {
  const denom = Math.PI * (3 * (1 + k) - Math.sqrt((3 + k) * (1 + 3 * k)));
  const rx = circumferenceM / Math.max(denom, 0.001);
  return { rx, rz: rx * k };
}

function catmullRomValue(p0: number, p1: number, p2: number, p3: number, t: number): number {
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

function createLoftedBufferGeometry(rings: number, segs: number): THREE.BufferGeometry {
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
      // Outward-facing CCW winding in right-handed +Y up space
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function weldSeamNormals(geometry: THREE.BufferGeometry, rings: number, segs: number): void {
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

export interface MetricAnchorInfo {
  chestY: number;
  waistY: number;
  hipsY: number;
  shoulderY: number;
  heightM: number;
}

export class OrganicMannequinRig {
  readonly root: THREE.Group;
  readonly breathPivot: THREE.Group;

  private readonly skinMaterial: THREE.MeshStandardMaterial;
  private readonly torsoMaterial: THREE.MeshStandardMaterial;
  private readonly hairMaterial: THREE.MeshStandardMaterial;
  private readonly hairCurtainMaterial: THREE.MeshStandardMaterial;
  private readonly jointMaterial: THREE.MeshStandardMaterial;

  private readonly torsoGeometry: THREE.BufferGeometry;
  private readonly torsoColorAttr: THREE.BufferAttribute;
  private readonly leftLegGeometry: THREE.BufferGeometry;
  private readonly rightLegGeometry: THREE.BufferGeometry;
  private readonly leftArmGeometry: THREE.BufferGeometry;
  private readonly rightArmGeometry: THREE.BufferGeometry;

  private readonly torsoMesh: THREE.Mesh;
  private readonly headGroup: THREE.Group;
  private readonly neckMesh: THREE.Mesh;
  private readonly headMesh: THREE.Mesh;
  private readonly leftFootMesh: THREE.Mesh;
  private readonly rightFootMesh: THREE.Mesh;
  private readonly leftHandMesh: THREE.Mesh;
  private readonly rightHandMesh: THREE.Mesh;

  private readonly hairGroups: Record<HairStyle, THREE.Group>;
  private readonly measureRings: Record<"chest" | "waist" | "hips" | "shoulder", THREE.Mesh>;
  private readonly ringMaterials: Record<
    "chest" | "waist" | "hips" | "shoulder",
    THREE.MeshBasicMaterial
  >;
  private readonly beadRingMesh: THREE.InstancedMesh;
  private readonly beadRingMaterial: THREE.MeshBasicMaterial;
  private readonly beadDummy = new THREE.Object3D();
  private readonly heightRulerGroup: THREE.Group;
  private readonly heightRulerBar: THREE.Mesh;
  private readonly heightRulerCapTop: THREE.Mesh;
  private readonly heightRulerCapBottom: THREE.Mesh;
  private readonly heightRulerMaterial: THREE.MeshBasicMaterial;

  private currentRingTargets: Record<
    "chest" | "waist" | "hips" | "shoulder",
    { y: number; z: number; rx: number; rz: number }
  > = {
    chest: { y: 1.18, z: 0.006, rx: 0.14, rz: 0.1 },
    waist: { y: 1.02, z: 0.014, rx: 0.11, rz: 0.08 },
    hips: { y: 0.85, z: -0.002, rx: 0.15, rz: 0.11 },
    shoulder: { y: 1.33, z: -0.005, rx: 0.19, rz: 0.09 },
  };
  private smoothBead = { y: 1.02, z: 0.014, rx: 0.11, rz: 0.08, opacity: 0 };
  private smoothHighlightY = 1.02;
  private smoothHighlightIntensity = 0;

  private anchors: MetricAnchorInfo = {
    chestY: 1.18,
    waistY: 1.02,
    hipsY: 0.85,
    shoulderY: 1.33,
    heightM: 1.63,
  };

  constructor() {
    this.root = new THREE.Group();
    this.root.name = "MidoraOrganicMannequin";
    this.breathPivot = new THREE.Group();
    this.root.add(this.breathPivot);

    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#DFB99B"),
      roughness: 0.56,
      metalness: 0.03,
    });

    this.torsoMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#DFB99B"),
      roughness: 0.56,
      metalness: 0.03,
      vertexColors: true,
    });

    this.jointMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#D5AE90"),
      roughness: 0.62,
      metalness: 0.03,
    });

    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2A201B"),
      roughness: 0.78,
      metalness: 0.04,
    });

    this.hairCurtainMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2A201B"),
      roughness: 0.78,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });

    // Lofted torso & limbs
    this.torsoGeometry = createLoftedBufferGeometry(TORSO_RINGS, TORSO_SEGS);
    const torsoVertCount = (TORSO_RINGS + 1) * (TORSO_SEGS + 1);
    const torsoColors = new Float32Array(torsoVertCount * 3);
    torsoColors.fill(1);
    this.torsoColorAttr = new THREE.BufferAttribute(torsoColors, 3);
    this.torsoGeometry.setAttribute("color", this.torsoColorAttr);

    this.torsoMesh = new THREE.Mesh(this.torsoGeometry, this.torsoMaterial);
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.breathPivot.add(this.torsoMesh);

    this.leftLegGeometry = createLoftedBufferGeometry(LIMB_RINGS, LIMB_SEGS);
    const leftLegMesh = new THREE.Mesh(this.leftLegGeometry, this.skinMaterial);
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    this.root.add(leftLegMesh);

    this.rightLegGeometry = createLoftedBufferGeometry(LIMB_RINGS, LIMB_SEGS);
    const rightLegMesh = new THREE.Mesh(this.rightLegGeometry, this.skinMaterial);
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

    // Stylized sculpted feet
    const footGeo = new THREE.CapsuleGeometry(0.033, 0.105, 8, 16);
    footGeo.rotateX(Math.PI / 2);
    this.leftFootMesh = new THREE.Mesh(footGeo, this.jointMaterial);
    this.leftFootMesh.castShadow = true;
    this.rightFootMesh = new THREE.Mesh(footGeo, this.jointMaterial);
    this.rightFootMesh.castShadow = true;
    this.root.add(this.leftFootMesh, this.rightFootMesh);

    // Stylized sculpted hands so wrists terminate cleanly
    const handGeo = new THREE.SphereGeometry(0.026, 16, 14);
    handGeo.scale(0.68, 1.55, 0.48);
    this.leftHandMesh = new THREE.Mesh(handGeo, this.jointMaterial);
    this.leftHandMesh.castShadow = true;
    this.rightHandMesh = new THREE.Mesh(handGeo, this.jointMaterial);
    this.rightHandMesh.castShadow = true;
    this.breathPivot.add(this.leftHandMesh, this.rightHandMesh);

    // Neck & Head with gentle anatomical sculpting (jawline + soft nose bridge)
    const neckGeo = new THREE.CylinderGeometry(0.041, 0.049, 0.095, 24);
    this.neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    this.neckMesh.castShadow = true;
    this.breathPivot.add(this.neckMesh);

    this.headGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.092, 32, 24);
    const headPos = headGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < headPos.count; i++) {
      const x = headPos.getX(i);
      const y = headPos.getY(i);
      const z = headPos.getZ(i);
      const ny = y / 0.092;
      const jawTaper = ny < 0 ? 1 + ny * 0.24 : 1;
      const chinPush = ny < -0.25 && z > 0 ? 0.092 * 0.1 * -ny : 0;
      const noseRidge =
        z > 0.055 && Math.abs(x) < 0.022 && y > -0.024 && y < 0.028
          ? 0.0085 *
            Math.cos((x / 0.022) * (Math.PI / 2)) *
            Math.cos(((y - 0.002) / 0.026) * (Math.PI / 2))
          : 0;
      headPos.setXYZ(
        i,
        x * 0.85 * jawTaper,
        y * 1.15,
        z * 0.96 * jawTaper + chinPush + noseRidge
      );
    }
    headGeo.computeVertexNormals();
    this.headMesh = new THREE.Mesh(headGeo, this.skinMaterial);
    this.headMesh.castShadow = true;
    this.headGroup.add(this.headMesh);
    this.breathPivot.add(this.headGroup);

    // Stylized minimalist hair presets
    this.hairGroups = this.buildHairStyles();
    for (const group of Object.values(this.hairGroups)) {
      this.headGroup.add(group);
    }

    // Measuring tape rings built from thin TorusGeometry so stroke width renders crisply across all GPUs
    const baseRingGeo = new THREE.TorusGeometry(1, 0.018, 10, 72);
    baseRingGeo.rotateX(Math.PI / 2);

    const makeRing = () => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xa25b26,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(baseRingGeo, mat);
      this.root.add(mesh);
      return { mesh, mat };
    };

    const chestR = makeRing();
    const waistR = makeRing();
    const hipsR = makeRing();
    const shoulderR = makeRing();

    this.measureRings = {
      chest: chestR.mesh,
      waist: waistR.mesh,
      hips: hipsR.mesh,
      shoulder: shoulderR.mesh,
    };
    this.ringMaterials = {
      chest: chestR.mat,
      waist: waistR.mat,
      hips: hipsR.mat,
      shoulder: shoulderR.mat,
    };

    // Beaded Tobacco measuring tape ring that glides smoothly onto active body zone
    const beadGeo = new THREE.SphereGeometry(0.0048, 10, 8);
    this.beadRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xa25b26,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.beadRingMesh = new THREE.InstancedMesh(
      beadGeo,
      this.beadRingMaterial,
      BEAD_COUNT
    );
    this.beadRingMesh.visible = false;
    this.root.add(this.beadRingMesh);

    // Height indicator ruler beside the avatar
    this.heightRulerGroup = new THREE.Group();
    this.heightRulerMaterial = new THREE.MeshBasicMaterial({
      color: 0xa25b26,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.heightRulerBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 1, 8),
      this.heightRulerMaterial
    );
    this.heightRulerCapTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.004, 0.004),
      this.heightRulerMaterial
    );
    this.heightRulerCapBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.004, 0.004),
      this.heightRulerMaterial
    );
    this.heightRulerGroup.add(
      this.heightRulerBar,
      this.heightRulerCapTop,
      this.heightRulerCapBottom
    );
    this.root.add(this.heightRulerGroup);
  }

  private buildHairStyles(): Record<HairStyle, THREE.Group> {
    const none = new THREE.Group();

    // Base crown sphere tilted slightly backward so forehead & face (+Z) remain completely open
    const shortClean = new THREE.Group();
    const shortCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.097, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.56),
      this.hairMaterial
    );
    shortCap.scale.set(0.88, 1.15, 0.99);
    shortCap.position.set(0, 0.009, -0.007);
    shortCap.rotation.x = -0.22;
    const crownBun = new THREE.Mesh(
      new THREE.SphereGeometry(0.072, 20, 16),
      this.hairMaterial
    );
    crownBun.scale.set(0.95, 0.85, 0.85);
    crownBun.position.set(0, 0.015, -0.04);
    shortClean.add(shortCap, crownBun);

    // Medium bob: covers sides (+X/-X) & back (-Z) while keeping front face (+Z) clear
    // In CylinderGeometry, theta=0 is +Z (face), theta=PI is -Z (back).
    const mediumBob = new THREE.Group();
    const bobCap = shortCap.clone();
    const bobCurtain = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.09,
        0.104,
        0.175,
        28,
        1,
        true,
        Math.PI * 0.36,
        Math.PI * 1.28
      ),
      this.hairCurtainMaterial
    );
    bobCurtain.position.set(0, -0.056, -0.012);
    bobCurtain.rotation.x = 0.06;
    mediumBob.add(bobCap, bobCurtain);

    // Long straight silhouette reaching mid-shoulder
    const longStraight = new THREE.Group();
    const longCap = shortCap.clone();
    const longCurtain = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.092,
        0.118,
        0.31,
        28,
        1,
        true,
        Math.PI * 0.38,
        Math.PI * 1.24
      ),
      this.hairCurtainMaterial
    );
    longCurtain.position.set(0, -0.124, -0.018);
    longCurtain.rotation.x = 0.08;
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
    const H = THREE.MathUtils.clamp(draft.heightCm / 100, 1.2, 2.2);
    const { genderStyle, skinTone, hairStyle } = draft.avatarCustomizationParams;

    this.skinMaterial.color.set(skinTone);
    this.torsoMaterial.color.set(skinTone);
    const shadeColor = new THREE.Color(skinTone).multiplyScalar(0.94);
    this.jointMaterial.color.copy(shadeColor);

    (Object.keys(this.hairGroups) as HairStyle[]).forEach((style) => {
      this.hairGroups[style].visible = style === hairStyle;
    });

    const chestM = draft.chestCm / 100;
    const waistM = draft.waistCm / 100;
    const hipsM = draft.hipsCm / 100;
    const shoulderHalfW = Math.max(0.14, draft.shoulderWidthCm / 200);

    const bmi = draft.weightKg / (H * H);
    const fullness = THREE.MathUtils.clamp((bmi - 18) / 14, -0.25, 1.1);

    const hipRatio = genderStyle === "female" ? 0.74 : 0.78;
    const waistRatio = genderStyle === "female" ? 0.74 : 0.79;
    const chestRatio = genderStyle === "female" ? 0.71 : 0.73;

    const hipsRadii = circumferenceToRadii(hipsM, hipRatio);
    const waistRadii = circumferenceToRadii(waistM, waistRatio);
    const chestRadii = circumferenceToRadii(chestM, chestRatio);
    const shoulderRz = chestRadii.rz * 0.76;

    const torsoBottomY = 0.442 * H;
    const neckBaseY = 0.85 * H;
    const torsoHeight = neckBaseY - torsoBottomY;

    const hipY = torsoBottomY + T_HIPS * torsoHeight;
    const waistY = torsoBottomY + T_WAIST * torsoHeight;
    const chestY = torsoBottomY + T_CHEST * torsoHeight;
    const shoulderY = torsoBottomY + T_SHOULDER * torsoHeight;

    const bustFactor = genderStyle === "female" ? 0.016 : genderStyle === "neutral" ? 0.006 : 0.004;

    const rxKeys = [
      { t: 0.0, v: 0.004 },
      { t: 0.07, v: hipsRadii.rx * 0.85 },
      { t: T_HIPS, v: hipsRadii.rx },
      { t: T_WAIST, v: waistRadii.rx },
      { t: T_CHEST, v: chestRadii.rx },
      { t: T_SHOULDER, v: shoulderHalfW * 0.94 },
      { t: 1.0, v: 0.044 },
    ];

    const rzKeys = [
      { t: 0.0, v: 0.004 },
      { t: 0.07, v: hipsRadii.rz * 0.82 },
      { t: T_HIPS, v: hipsRadii.rz },
      { t: T_WAIST, v: waistRadii.rz },
      { t: T_CHEST, v: chestRadii.rz },
      { t: T_SHOULDER, v: shoulderRz },
      { t: 1.0, v: 0.042 },
    ];

    const zOffsetKeys = [
      { t: 0.0, v: -0.004 },
      { t: T_HIPS, v: -0.002 },
      { t: T_WAIST, v: 0.014 },
      { t: T_CHEST, v: 0.006 },
      { t: T_SHOULDER, v: -0.005 },
      { t: 1.0, v: 0.004 },
    ];

    // 1. Update Torso Mesh in-place
    const torsoPos = this.torsoGeometry.attributes.position as THREE.BufferAttribute;
    const stride = TORSO_SEGS + 1;

    for (let r = 0; r <= TORSO_RINGS; r++) {
      const t = r / TORSO_RINGS;
      const y = torsoBottomY + t * torsoHeight;
      const rx = interpolateKeyframes(rxKeys, t);
      const rz = interpolateKeyframes(rzKeys, t);
      const zOff = interpolateKeyframes(zOffsetKeys, t);
      const bustBump = bustFactor * Math.exp(-Math.pow((t - T_CHEST) / 0.11, 2));

      for (let s = 0; s <= TORSO_SEGS; s++) {
        const theta = (s / TORSO_SEGS) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        let localRz = rz;
        if (sinT > 0) {
          localRz += bustBump * Math.pow(sinT, 1.6);
        } else if (sinT < 0 && t < 0.28) {
          const gluteBump = 0.018 * Math.exp(-Math.pow((t - T_HIPS) / 0.09, 2));
          localRz += gluteBump * Math.pow(-sinT, 1.4);
        }

        const x = rx * cosT;
        const z = localRz * sinT + zOff;
        torsoPos.setXYZ(r * stride + s, x, y, z);
      }
    }
    torsoPos.needsUpdate = true;
    weldSeamNormals(this.torsoGeometry, TORSO_RINGS, TORSO_SEGS);
    this.torsoGeometry.computeBoundingSphere();

    // 2. Update Legs
    const legSpanX = hipsRadii.rx * 0.45;
    const thighRadius = hipsRadii.rx * 0.44 * (1 + fullness * 0.08);
    const kneeRadius = Math.max(0.044, thighRadius * 0.68);
    const calfRadius = Math.max(0.046, thighRadius * 0.72);
    const ankleRadius = Math.max(0.032, thighRadius * 0.48);
    const legTopY = 0.485 * H;
    const ankleY = 0.04 * H;

    this.updateLimbGeometry(this.leftLegGeometry, [
      { y: ankleY - 0.01 * H, x: -legSpanX * 0.9, z: -0.005, rx: 0.003, rz: 0.003 },
      { y: ankleY, x: -legSpanX * 0.9, z: -0.005, rx: ankleRadius, rz: ankleRadius * 1.05 },
      { y: 0.17 * H, x: -legSpanX * 0.93, z: -0.008, rx: calfRadius, rz: calfRadius * 1.04 },
      { y: 0.285 * H, x: -legSpanX * 0.96, z: 0.004, rx: kneeRadius, rz: kneeRadius },
      { y: 0.39 * H, x: -legSpanX * 0.98, z: 0.002, rx: thighRadius * 0.9, rz: thighRadius * 0.96 },
      { y: legTopY, x: -legSpanX, z: -0.002, rx: thighRadius, rz: thighRadius * 1.06 },
      { y: legTopY + 0.018 * H, x: -legSpanX * 0.92, z: -0.002, rx: 0.004, rz: 0.004 },
    ]);

    this.updateLimbGeometry(this.rightLegGeometry, [
      { y: ankleY - 0.01 * H, x: legSpanX * 0.9, z: -0.005, rx: 0.003, rz: 0.003 },
      { y: ankleY, x: legSpanX * 0.9, z: -0.005, rx: ankleRadius, rz: ankleRadius * 1.05 },
      { y: 0.17 * H, x: legSpanX * 0.93, z: -0.008, rx: calfRadius, rz: calfRadius * 1.04 },
      { y: 0.285 * H, x: legSpanX * 0.96, z: 0.004, rx: kneeRadius, rz: kneeRadius },
      { y: 0.39 * H, x: legSpanX * 0.98, z: 0.002, rx: thighRadius * 0.9, rz: thighRadius * 0.96 },
      { y: legTopY, x: legSpanX, z: -0.002, rx: thighRadius, rz: thighRadius * 1.06 },
      { y: legTopY + 0.018 * H, x: legSpanX * 0.92, z: -0.002, rx: 0.004, rz: 0.004 },
    ]);

    this.leftFootMesh.position.set(-legSpanX * 0.9, 0.028 * H, 0.032);
    this.rightFootMesh.position.set(legSpanX * 0.9, 0.028 * H, 0.032);

    // 3. Update Arms (relaxed A-pose + sculpted hands)
    const armTopY = shoulderY - 0.016 * H;
    const armOutX = shoulderHalfW * 0.93;
    const armRadius = THREE.MathUtils.clamp(0.038 + fullness * 0.008, 0.032, 0.056);
    const wristRadius = armRadius * 0.66;
    const wristX = armOutX + 0.071 * H;
    const wristY = 0.468 * H;

    this.updateLimbGeometry(this.leftArmGeometry, [
      { y: wristY - 0.01 * H, x: -wristX, z: 0.035, rx: 0.003, rz: 0.003 },
      { y: wristY, x: -wristX, z: 0.034, rx: wristRadius * 0.92, rz: wristRadius * 0.78 },
      { y: 0.54 * H, x: -(armOutX + 0.062 * H), z: 0.015, rx: armRadius * 0.82, rz: armRadius * 0.82 },
      { y: 0.64 * H, x: -(armOutX + 0.044 * H), z: -0.004, rx: armRadius * 0.9, rz: armRadius * 0.92 },
      { y: 0.74 * H, x: -(armOutX + 0.02 * H), z: -0.005, rx: armRadius, rz: armRadius * 1.02 },
      { y: armTopY, x: -armOutX * 0.92, z: -0.004, rx: armRadius * 1.06, rz: armRadius * 1.06 },
      { y: armTopY + 0.015 * H, x: -armOutX * 0.8, z: -0.004, rx: 0.004, rz: 0.004 },
    ]);

    this.updateLimbGeometry(this.rightArmGeometry, [
      { y: wristY - 0.01 * H, x: wristX, z: 0.035, rx: 0.003, rz: 0.003 },
      { y: wristY, x: wristX, z: 0.034, rx: wristRadius * 0.92, rz: wristRadius * 0.78 },
      { y: 0.54 * H, x: armOutX + 0.062 * H, z: 0.015, rx: armRadius * 0.82, rz: armRadius * 0.82 },
      { y: 0.64 * H, x: armOutX + 0.044 * H, z: -0.004, rx: armRadius * 0.9, rz: armRadius * 0.92 },
      { y: 0.74 * H, x: armOutX + 0.02 * H, z: -0.005, rx: armRadius, rz: armRadius * 1.02 },
      { y: armTopY, x: armOutX * 0.92, z: -0.004, rx: armRadius * 1.06, rz: armRadius * 1.06 },
      { y: armTopY + 0.015 * H, x: armOutX * 0.8, z: -0.004, rx: 0.004, rz: 0.004 },
    ]);

    const handScale = THREE.MathUtils.clamp(H / 1.66, 0.9, 1.12);
    this.leftHandMesh.scale.setScalar(handScale);
    this.leftHandMesh.position.set(-(wristX + 0.004), wristY - 0.03 * H, 0.042);
    this.leftHandMesh.rotation.set(0.18, 0.1, -0.08);

    this.rightHandMesh.scale.setScalar(handScale);
    this.rightHandMesh.position.set(wristX + 0.004, wristY - 0.03 * H, 0.042);
    this.rightHandMesh.rotation.set(0.18, -0.1, 0.08);

    // 4. Neck & Head placement
    this.neckMesh.position.set(0, 0.865 * H, 0.004);
    const headScale = THREE.MathUtils.clamp(H / 1.66, 0.9, 1.12);
    this.headGroup.scale.setScalar(headScale);
    this.headGroup.position.set(0, 0.938 * H, 0.008);

    // 5. Update Measure Rings
    const chestRx = chestRadii.rx * 1.025;
    const chestRz = (chestRadii.rz + bustFactor * 0.55) * 1.035;
    const waistRx = waistRadii.rx * 1.025;
    const waistRz = waistRadii.rz * 1.035;
    const hipsRx = hipsRadii.rx * 1.025;
    const hipsRz = hipsRadii.rz * 1.035;
    const shoulderRx = shoulderHalfW * 1.01;
    const shoulderRingRz = shoulderRz * 1.12;

    this.measureRings.chest.position.set(0, chestY, 0.006);
    this.measureRings.chest.scale.set(chestRx, (chestRx + chestRz) * 0.5, chestRz);

    this.measureRings.waist.position.set(0, waistY, 0.014);
    this.measureRings.waist.scale.set(waistRx, (waistRx + waistRz) * 0.5, waistRz);

    this.measureRings.hips.position.set(0, hipY, -0.002);
    this.measureRings.hips.scale.set(hipsRx, (hipsRx + hipsRz) * 0.5, hipsRz);

    this.measureRings.shoulder.position.set(0, shoulderY, -0.005);
    this.measureRings.shoulder.scale.set(
      shoulderRx,
      (shoulderRx + shoulderRingRz) * 0.5,
      shoulderRingRz
    );

    this.currentRingTargets = {
      chest: { y: chestY, z: 0.006, rx: chestRx * 1.03, rz: chestRz * 1.04 },
      waist: { y: waistY, z: 0.014, rx: waistRx * 1.03, rz: waistRz * 1.04 },
      hips: { y: hipY, z: -0.002, rx: hipsRx * 1.03, rz: hipsRz * 1.04 },
      shoulder: {
        y: shoulderY,
        z: -0.005,
        rx: shoulderRx * 1.02,
        rz: shoulderRingRz * 1.08,
      },
    };

    // Height bar beside avatar (matches total head crown ~ 1.005 * H)
    const totalHeightVisual = 1.005 * H;
    const rulerX = -(shoulderHalfW + 0.18);
    this.heightRulerBar.scale.set(1, totalHeightVisual, 1);
    this.heightRulerBar.position.set(rulerX, totalHeightVisual * 0.5, 0);
    this.heightRulerCapTop.position.set(rulerX + 0.045, totalHeightVisual, 0);
    this.heightRulerCapBottom.position.set(rulerX + 0.025, 0.003, 0);

    this.anchors = {
      chestY,
      waistY,
      hipsY: hipY,
      shoulderY,
      heightM: totalHeightVisual,
    };
  }

  private updateLimbGeometry(
    geometry: THREE.BufferGeometry,
    stations: ReadonlyArray<{ y: number; x: number; z: number; rx: number; rz: number }>
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
        pos.setXYZ(
          r * stride + s,
          cx + rx * Math.cos(theta),
          cy,
          cz + rz * Math.sin(theta)
        );
      }
    }
    pos.needsUpdate = true;
    weldSeamNormals(geometry, LIMB_RINGS, LIMB_SEGS);
    geometry.computeBoundingSphere();
  }

  animate(elapsedSec: number, activeMetric: ActiveBodyMetric, showAllRings: boolean): void {
    // Subtle lifelike breathing motion
    const breathWave = Math.sin(elapsedSec * 1.55) * 0.003;
    this.breathPivot.position.y = breathWave * 0.4;
    this.breathPivot.scale.set(1 + breathWave * 0.55, 1, 1 + breathWave * 1.0);

    const keys: Array<"chest" | "waist" | "hips" | "shoulder"> = [
      "chest",
      "waist",
      "hips",
      "shoulder",
    ];
    for (const key of keys) {
      const isFocused = activeMetric === key;
      const targetOpacity = isFocused ? 0.48 : showAllRings ? 0.3 : 0.0;
      const mat = this.ringMaterials[key];
      mat.opacity += (targetOpacity - mat.opacity) * 0.18;
      mat.color.setHex(isFocused ? 0xa25b26 : 0x78716c);
      this.measureRings[key].visible = mat.opacity > 0.01;
    }

    // Update gliding beaded measuring tape + subtle skin warmth band on active torso zone
    const isTorsoRing =
      activeMetric === "chest" ||
      activeMetric === "waist" ||
      activeMetric === "hips" ||
      activeMetric === "shoulder";

    const wasHidden = this.smoothBead.opacity < 0.03;
    const beadTargetOpacity = isTorsoRing ? 0.96 : 0;
    this.smoothBead.opacity += (beadTargetOpacity - this.smoothBead.opacity) * 0.2;

    if (isTorsoRing) {
      const targetRing = this.currentRingTargets[activeMetric];
      const factor = wasHidden ? 1 : 0.22;
      this.smoothBead.y += (targetRing.y - this.smoothBead.y) * factor;
      this.smoothBead.z += (targetRing.z - this.smoothBead.z) * factor;
      this.smoothBead.rx += (targetRing.rx - this.smoothBead.rx) * factor;
      this.smoothBead.rz += (targetRing.rz - this.smoothBead.rz) * factor;
      this.smoothHighlightY += (targetRing.y - this.smoothHighlightY) * factor;
    }

    const prevIntensity = this.smoothHighlightIntensity;
    this.smoothHighlightIntensity +=
      ((isTorsoRing ? 1 : 0) - this.smoothHighlightIntensity) * 0.18;

    this.beadRingMaterial.opacity = this.smoothBead.opacity;
    this.beadRingMesh.visible = this.smoothBead.opacity > 0.02;
    if (this.beadRingMesh.visible) {
      for (let i = 0; i < BEAD_COUNT; i++) {
        const theta = (i / BEAD_COUNT) * Math.PI * 2 + elapsedSec * 0.25;
        this.beadDummy.position.set(
          this.smoothBead.rx * Math.cos(theta),
          this.smoothBead.y,
          this.smoothBead.z + this.smoothBead.rz * Math.sin(theta)
        );
        this.beadDummy.updateMatrix();
        this.beadRingMesh.setMatrixAt(i, this.beadDummy.matrix);
      }
      this.beadRingMesh.instanceMatrix.needsUpdate = true;
    }

    const colorArr = this.torsoColorAttr.array as Float32Array;
    if (this.smoothHighlightIntensity > 0.008) {
      const posAttr = this.torsoGeometry.attributes.position as THREE.BufferAttribute;
      const bandSigma = 0.062;
      const bandStrength = this.smoothHighlightIntensity * 0.58;

      for (let i = 0; i < posAttr.count; i++) {
        const vy = posAttr.getY(i);
        const dist = vy - this.smoothHighlightY;
        const falloff =
          bandStrength * Math.exp(-(dist * dist) / (2 * bandSigma * bandSigma));
        colorArr[i * 3] = 1 + falloff * 0.18;
        colorArr[i * 3 + 1] = 1 - falloff * 0.28;
        colorArr[i * 3 + 2] = 1 - falloff * 0.42;
      }
      this.torsoColorAttr.needsUpdate = true;
    } else if (prevIntensity > 0.008) {
      colorArr.fill(1);
      this.torsoColorAttr.needsUpdate = true;
    }

    const heightTarget = activeMetric === "height" ? 0.92 : showAllRings ? 0.26 : 0.0;
    this.heightRulerMaterial.opacity +=
      (heightTarget - this.heightRulerMaterial.opacity) * 0.18;
    this.heightRulerGroup.visible = this.heightRulerMaterial.opacity > 0.01;
  }

  dispose(): void {
    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();

    this.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        geos.add(obj.geometry);
        const list = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of list) {
          mats.add(m);
        }
      }
    });

    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
  }
}
