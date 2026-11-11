import * as THREE from "three";
import { MeasurementOverlayRig } from "@/features/avatar/three/MeasurementOverlayRig";
import type {
  AvatarModelSpec,
  AvatarRigInstance,
  MetricAnchorInfo,
} from "@/features/avatar/three/avatarRigTypes";
import {
  computeAnthropometricFrame,
  solveGlbBodyControls,
} from "@/features/avatar/three/bodyCalibration";
import type { ActiveBodyMetric, AvatarDraft, HairStyle } from "@/types/bodyProfile";

interface BoneEntry {
  bone: THREE.Bone;
  baseScale: THREE.Vector3;
}

const BONE_ROLE_ALIASES = {
  pelvis: ["pelvis", "hips", "mixamorighips"],
  spine: ["spine", "spine_01", "mixamorigspine"],
  spineMid: ["spine1", "spine_02", "mixamorigspine1"],
  chest: ["spine2", "spine_03", "chest", "mixamorigspine2"],
  neck: ["neck", "neck_01", "mixamorigneck"],
  head: ["head", "mixamorighead"],
  leftThigh: ["leftupleg", "thigh_l", "mixamorigleftupleg"],
  leftCalf: ["leftleg", "calf_l", "shin_l", "mixamorigleftleg"],
  leftFoot: ["leftfoot", "foot_l", "mixamorigleftfoot"],
  rightThigh: ["rightupleg", "thigh_r", "mixamorigrightupleg"],
  rightCalf: ["rightleg", "calf_r", "shin_r", "mixamorigrightleg"],
  rightFoot: ["rightfoot", "foot_r", "mixamorigrightfoot"],
} as const;

type BoneRole = keyof typeof BONE_ROLE_ALIASES;

const HAIR_NODE_ALIASES: Record<HairStyle, string[]> = {
  none: [],
  short_clean: ["hair_short", "hair_short_clean", "short_hair"],
  medium_bob: ["hair_bob", "hair_medium_bob", "bob_hair"],
  long_straight: ["hair_long", "hair_long_straight", "long_hair"],
};

function normalizeIdentifier(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function isGarmentMaterial(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("short") ||
    n.includes("brief") ||
    n.includes("under") ||
    n.includes("bra") ||
    n.includes("top") ||
    n.includes("cloth") ||
    n.includes("apparel")
  );
}

function isHairMaterial(name: string): boolean {
  return name.toLowerCase().includes("hair");
}

function isSkinMaterial(name: string): boolean {
  const n = name.toLowerCase();
  if (isGarmentMaterial(n) || isHairMaterial(n)) return false;
  return (
    n.includes("skin") ||
    n.includes("body") ||
    n.includes("human") ||
    n.includes("head") ||
    n.includes("torso") ||
    n === ""
  );
}

export class GlbMorphAvatarRig implements AvatarRigInstance {
  readonly root: THREE.Group;
  readonly mode = "glb" as const;

  private readonly modelGroup: THREE.Group;
  private readonly overlay: MeasurementOverlayRig;
  private readonly spec?: AvatarModelSpec;

  private readonly morphedMeshes: THREE.Mesh[] = [];
  private readonly skinMaterials: THREE.MeshPhysicalMaterial[] = [];
  private readonly bonesByRole = new Map<BoneRole, BoneEntry>();
  private readonly hairNodes: Partial<Record<HairStyle, THREE.Object3D[]>> = {};

  private readonly baseModelScale: number;
  private readonly baseCenterOffset = new THREE.Vector3();
  private readonly baseFootWorldY: number = 0;
  private readonly tempFootPos = new THREE.Vector3();
  private chestBreathBone: BoneEntry | null = null;
  private anchors: MetricAnchorInfo;

  constructor(gltfScene: THREE.Group, spec?: AvatarModelSpec) {
    this.root = new THREE.Group();
    this.root.name = "MidoraGlbAvatarRig";
    this.spec = spec;

    this.modelGroup = new THREE.Group();
    this.modelGroup.add(gltfScene);
    this.root.add(this.modelGroup);

    // Measure raw asset bounds & ground to y = 0 at reference height
    gltfScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(gltfScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const neutralHeightM = (spec?.neutralHeightCm ?? 168) / 100;
    const rawHeight = Math.max(size.y, 0.1);
    this.baseModelScale = neutralHeightM / rawHeight;
    this.baseCenterOffset.set(-center.x, -box.min.y, -center.z);

    gltfScene.position.copy(this.baseCenterOffset);
    this.modelGroup.scale.setScalar(this.baseModelScale);

    // Inspect meshes, materials, morph targets, and skeletons
    gltfScene.traverse((obj) => {
      if (obj instanceof THREE.Bone) {
        this.registerBone(obj);
      }

      this.registerOptionalHairNode(obj);

      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.frustumCulled = false; // Prevent skinned/morphed bounding-sphere clipping

        if (
          obj.morphTargetDictionary &&
          obj.morphTargetInfluences &&
          Object.keys(obj.morphTargetDictionary).length > 0
        ) {
          this.morphedMeshes.push(obj);
        }

        const matList = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        const upgradedMats = matList.map((mat) => {
          if (
            mat instanceof THREE.MeshStandardMaterial &&
            isSkinMaterial(mat.name || obj.name)
          ) {
            const physical = new THREE.MeshPhysicalMaterial({
              name: mat.name,
              color: mat.color.clone(),
              map: mat.map,
              normalMap: mat.normalMap,
              normalScale: mat.normalScale.clone(),
              roughnessMap: mat.roughnessMap,
              roughness: Math.min(Math.max(mat.roughness, 0.42), 0.78),
              metalness: 0.02,
              aoMap: mat.aoMap,
              aoMapIntensity: mat.aoMapIntensity,
              sheen: 0.28,
              sheenRoughness: 0.7,
              sheenColor: new THREE.Color("#FFE5D6"),
            });
            mat.dispose();
            this.skinMaterials.push(physical);
            return physical;
          }
          return mat;
        });

        obj.material = Array.isArray(obj.material)
          ? upgradedMats
          : upgradedMats[0];
      }
    });

    this.chestBreathBone =
      this.bonesByRole.get("chest") ?? this.bonesByRole.get("spineMid") ?? null;

    const footRef = this.bonesByRole.get("leftFoot") ?? this.bonesByRole.get("rightFoot");
    if (footRef) {
      this.root.updateMatrixWorld(true);
      footRef.bone.getWorldPosition(this.tempFootPos);
      this.baseFootWorldY = this.tempFootPos.y;
    }

    this.overlay = new MeasurementOverlayRig();
    this.root.add(this.overlay.group);

    this.anchors = {
      chestY: 1.2,
      waistY: 1.02,
      hipsY: 0.85,
      shoulderY: 1.35,
      heightM: neutralHeightM,
      shoulderHalfW: 0.2,
      zones: {
        chest: { y: 1.2, z: 0.008, rx: 0.14, rz: 0.1 },
        waist: { y: 1.02, z: 0.012, rx: 0.11, rz: 0.08 },
        hips: { y: 0.85, z: -0.006, rx: 0.15, rz: 0.11 },
        shoulder: { y: 1.35, z: -0.006, rx: 0.2, rz: 0.09 },
      },
    };
  }

  private registerBone(bone: THREE.Bone): void {
    const normalized = normalizeIdentifier(bone.name);
    for (const [role, aliases] of Object.entries(BONE_ROLE_ALIASES) as Array<
      [BoneRole, readonly string[]]
    >) {
      if (this.bonesByRole.has(role)) continue;
      if (aliases.some((alias) => normalized === alias || normalized.endsWith(alias))) {
        this.bonesByRole.set(role, {
          bone,
          baseScale: bone.scale.clone(),
        });
        break;
      }
    }
  }

  private registerOptionalHairNode(obj: THREE.Object3D): void {
    const normalized = normalizeIdentifier(obj.name);
    (Object.keys(HAIR_NODE_ALIASES) as HairStyle[]).forEach((style) => {
      if (style === "none") return;
      const aliases = HAIR_NODE_ALIASES[style];
      if (aliases.some((a) => normalized.includes(a))) {
        const list = this.hairNodes[style] ?? [];
        list.push(obj);
        this.hairNodes[style] = list;
      }
    });
  }

  getAnchors(): MetricAnchorInfo {
    return this.anchors;
  }

  update(draft: AvatarDraft): void {
    const frame = computeAnthropometricFrame(draft);
    const controls = solveGlbBodyControls(draft, this.spec);
    const { skinTone, hairStyle } = draft.avatarCustomizationParams;

    // 1. Update calibrated Morph Targets across all body & garment meshes (longest key first)
    const sortedMorphKeys = Object.keys(controls.morphWeightMap).sort(
      (a, b) => b.length - a.length
    );
    for (const mesh of this.morphedMeshes) {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) continue;

      for (const [targetName, index] of Object.entries(dict)) {
        const normName = normalizeIdentifier(targetName);
        if (controls.morphWeightMap[normName] !== undefined) {
          influences[index] = controls.morphWeightMap[normName];
          continue;
        }
        const matchedKey = sortedMorphKeys.find((k) => normName.includes(k));
        if (matchedKey) {
          influences[index] = controls.morphWeightMap[matchedKey];
        }
      }
    }

    // 2. Apply non-compounding sub-linear Skeletal Proportions
    const hasLegBones =
      this.bonesByRole.has("leftThigh") &&
      (this.bonesByRole.has("spine") || this.bonesByRole.has("spineMid"));
    const gltfScene = this.modelGroup.children[0];

    if (hasLegBones) {
      this.modelGroup.scale.setScalar(this.baseModelScale);
      const {
        legScaleY,
        spineScaleY,
        headCompensationY,
        headCompensationXZ,
      } = controls.boneScales;

      // Scale thigh Y once (cascades through calf without squaring) and invert on foot to preserve ankle shape
      for (const thighRole of ["leftThigh", "rightThigh"] as const) {
        const entry = this.bonesByRole.get(thighRole);
        if (entry) {
          entry.bone.scale.set(
            entry.baseScale.x,
            entry.baseScale.y * legScaleY,
            entry.baseScale.z
          );
        }
      }
      for (const footRole of ["leftFoot", "rightFoot"] as const) {
        const entry = this.bonesByRole.get(footRole);
        if (entry) {
          entry.bone.scale.set(
            entry.baseScale.x,
            entry.baseScale.y / Math.max(legScaleY, 0.5),
            entry.baseScale.z
          );
        }
      }

      // Scale a single trunk root bone so nested Spine1/Spine2 do not compound
      const trunkRootBone =
        this.bonesByRole.get("spine") ?? this.bonesByRole.get("spineMid");
      if (trunkRootBone) {
        trunkRootBone.bone.scale.set(
          trunkRootBone.baseScale.x,
          trunkRootBone.baseScale.y * spineScaleY,
          trunkRootBone.baseScale.z
        );
      }

      const headEntry = this.bonesByRole.get("head");
      if (headEntry) {
        headEntry.bone.scale.set(
          headEntry.baseScale.x * headCompensationXZ,
          headEntry.baseScale.y * headCompensationY,
          headEntry.baseScale.z * headCompensationXZ
        );
      }

      // Re-ground soles cleanly onto y = 0 after femur lengthening/shortening
      const footRef =
        this.bonesByRole.get("leftFoot") ?? this.bonesByRole.get("rightFoot");
      if (gltfScene && footRef) {
        gltfScene.position.y = this.baseCenterOffset.y;
        this.root.updateMatrixWorld(true);
        footRef.bone.getWorldPosition(this.tempFootPos);
        gltfScene.position.y +=
          (this.baseFootWorldY - this.tempFootPos.y) / this.baseModelScale;
      }
    } else {
      // Static-rig fallback: overall uniform height scale
      this.modelGroup.scale.setScalar(
        this.baseModelScale * controls.boneScales.overallScale
      );
    }

    // 3. Apply studio Skin / Linen material tone
    const isLinen = skinTone.toLowerCase() === "#e5ddd0";
    for (const mat of this.skinMaterials) {
      if (mat.map) {
        // Blend lightly over textured skin so pores & shading remain visible
        mat.color.set("#ffffff").lerp(new THREE.Color(skinTone), isLinen ? 0.85 : 0.42);
      } else {
        mat.color.set(skinTone);
      }
      mat.roughness = isLinen ? 0.88 : 0.52;
      mat.sheen = isLinen ? 0.12 : 0.28;
    }

    // 4. Toggle optional Hair meshes bundled in GLB
    (Object.keys(this.hairNodes) as HairStyle[]).forEach((style) => {
      const nodes = this.hairNodes[style];
      if (!nodes) return;
      for (const node of nodes) {
        node.visible = style === hairStyle;
      }
    });

    // 5. Update Measurement Overlay Anchors
    this.anchors = frame.anchors;
    this.overlay.updateAnchors(this.anchors);
  }

  animate(
    elapsedSec: number,
    activeMetric: ActiveBodyMetric,
    showAllRings: boolean
  ): void {
    const breathWave = Math.sin(elapsedSec * 1.55) * 0.004;
    if (this.chestBreathBone) {
      const base = this.chestBreathBone.baseScale;
      this.chestBreathBone.bone.scale.x = base.x * (1 + breathWave);
      this.chestBreathBone.bone.scale.z = base.z * (1 + breathWave * 1.5);
    }

    this.overlay.animate(elapsedSec, activeMetric, showAllRings);
  }

  dispose(): void {
    this.overlay.dispose();

    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();

    this.modelGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        geos.add(obj.geometry);
        const list = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        for (const m of list) {
          mats.add(m);
          if (m instanceof THREE.MeshStandardMaterial) {
            if (m.map) textures.add(m.map);
            if (m.normalMap) textures.add(m.normalMap);
            if (m.roughnessMap) textures.add(m.roughnessMap);
            if (m.aoMap) textures.add(m.aoMap);
          }
        }
      }
    });

    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  }
}
