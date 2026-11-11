import * as THREE from "three";
import type {
  MetricAnchorInfo,
  ZoneKey,
  ZoneRingTarget,
} from "@/features/avatar/three/avatarRigTypes";
import type { ActiveBodyMetric } from "@/types/bodyProfile";

const BEAD_COUNT = 52;
const ZONE_KEYS: readonly ZoneKey[] = ["chest", "waist", "hips", "shoulder"];

export class MeasurementOverlayRig {
  readonly group: THREE.Group;

  private readonly measureRings: Record<ZoneKey, THREE.Mesh>;
  private readonly ringMaterials: Record<ZoneKey, THREE.MeshBasicMaterial>;
  private readonly beadRingMesh: THREE.InstancedMesh;
  private readonly beadRingMaterial: THREE.MeshBasicMaterial;
  private readonly beadDummy = new THREE.Object3D();

  private readonly heightRulerGroup: THREE.Group;
  private readonly heightRulerBar: THREE.Mesh;
  private readonly heightRulerCapTop: THREE.Mesh;
  private readonly heightRulerCapBottom: THREE.Mesh;
  private readonly heightRulerMaterial: THREE.MeshBasicMaterial;

  private zoneTargets: Record<ZoneKey, ZoneRingTarget> = {
    chest: { y: 1.18, z: 0.008, rx: 0.145, rz: 0.105 },
    waist: { y: 1.02, z: 0.012, rx: 0.115, rz: 0.085 },
    hips: { y: 0.84, z: -0.006, rx: 0.155, rz: 0.115 },
    shoulder: { y: 1.33, z: -0.006, rx: 0.195, rz: 0.095 },
  };

  private smoothBead = { y: 1.02, z: 0.012, rx: 0.115, rz: 0.085, opacity: 0 };
  private smoothHighlightY = 1.02;
  private smoothHighlightIntensity = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "MidoraMeasurementOverlay";

    const baseRingGeo = new THREE.TorusGeometry(1, 0.016, 10, 72);
    baseRingGeo.rotateX(Math.PI / 2);

    const makeRing = () => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xa25b26,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(baseRingGeo, mat);
      mesh.visible = false;
      this.group.add(mesh);
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

    const beadGeo = new THREE.SphereGeometry(0.0044, 10, 8);
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
    this.group.add(this.beadRingMesh);

    this.heightRulerGroup = new THREE.Group();
    this.heightRulerMaterial = new THREE.MeshBasicMaterial({
      color: 0xa25b26,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.heightRulerBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0028, 0.0028, 1, 8),
      this.heightRulerMaterial
    );
    this.heightRulerCapTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.0038, 0.0038),
      this.heightRulerMaterial
    );
    this.heightRulerCapBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.0038, 0.0038),
      this.heightRulerMaterial
    );
    this.heightRulerGroup.add(
      this.heightRulerBar,
      this.heightRulerCapTop,
      this.heightRulerCapBottom
    );
    this.heightRulerGroup.visible = false;
    this.group.add(this.heightRulerGroup);
  }

  updateAnchors(anchors: MetricAnchorInfo): void {
    this.zoneTargets = anchors.zones;

    for (const key of ZONE_KEYS) {
      const target = anchors.zones[key];
      const ring = this.measureRings[key];
      ring.position.set(0, target.y, target.z);
      ring.scale.set(
        target.rx,
        (target.rx + target.rz) * 0.5,
        target.rz
      );
    }

    const totalH = Math.max(1.2, anchors.heightM);
    const rulerX = -(anchors.shoulderHalfW + 0.19);
    this.heightRulerBar.scale.set(1, totalH, 1);
    this.heightRulerBar.position.set(rulerX, totalH * 0.5, 0);
    this.heightRulerCapTop.position.set(rulerX + 0.045, totalH, 0);
    this.heightRulerCapBottom.position.set(rulerX + 0.025, 0.003, 0);
  }

  animate(
    elapsedSec: number,
    activeMetric: ActiveBodyMetric,
    showAllRings: boolean
  ): { highlightY: number; highlightIntensity: number } {
    for (const key of ZONE_KEYS) {
      const isFocused = activeMetric === key;
      const targetOpacity = isFocused ? 0.44 : showAllRings ? 0.28 : 0.0;
      const mat = this.ringMaterials[key];
      mat.opacity += (targetOpacity - mat.opacity) * 0.18;
      mat.color.setHex(isFocused ? 0xa25b26 : 0x78716c);
      this.measureRings[key].visible = mat.opacity > 0.01;
    }

    const isTorsoRing =
      activeMetric === "chest" ||
      activeMetric === "waist" ||
      activeMetric === "hips" ||
      activeMetric === "shoulder";

    const wasHidden = this.smoothBead.opacity < 0.03;
    const beadTargetOpacity = isTorsoRing ? 0.94 : 0;
    this.smoothBead.opacity +=
      (beadTargetOpacity - this.smoothBead.opacity) * 0.2;

    if (isTorsoRing) {
      const tRing = this.zoneTargets[activeMetric];
      const factor = wasHidden ? 1 : 0.22;
      this.smoothBead.y += (tRing.y - this.smoothBead.y) * factor;
      this.smoothBead.z += (tRing.z - this.smoothBead.z) * factor;
      this.smoothBead.rx += (tRing.rx * 1.02 - this.smoothBead.rx) * factor;
      this.smoothBead.rz += (tRing.rz * 1.02 - this.smoothBead.rz) * factor;
      this.smoothHighlightY += (tRing.y - this.smoothHighlightY) * factor;
    }

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

    const heightTarget =
      activeMetric === "height" ? 0.92 : showAllRings ? 0.28 : 0.0;
    this.heightRulerMaterial.opacity +=
      (heightTarget - this.heightRulerMaterial.opacity) * 0.18;
    this.heightRulerGroup.visible = this.heightRulerMaterial.opacity > 0.01;

    return {
      highlightY: this.smoothHighlightY,
      highlightIntensity: this.smoothHighlightIntensity,
    };
  }

  dispose(): void {
    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();

    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
        geos.add(obj.geometry);
        const list = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        for (const m of list) mats.add(m);
      }
    });

    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
  }
}

