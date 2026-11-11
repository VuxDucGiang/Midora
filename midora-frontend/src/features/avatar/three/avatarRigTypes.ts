import * as THREE from "three";
import type { ActiveBodyMetric, AvatarDraft, GenderStyle } from "@/types/bodyProfile";

export type ZoneKey = "chest" | "waist" | "hips" | "shoulder";

export interface ZoneRingTarget {
  y: number;
  z: number;
  rx: number;
  rz: number;
}

export interface MetricAnchorInfo {
  chestY: number;
  waistY: number;
  hipsY: number;
  shoulderY: number;
  heightM: number;
  shoulderHalfW: number;
  zones: Record<ZoneKey, ZoneRingTarget>;
}

export interface AvatarRigInstance {
  readonly root: THREE.Group;
  readonly mode: "glb" | "parametric";
  update(draft: AvatarDraft): void;
  animate(
    elapsedSec: number,
    activeMetric: ActiveBodyMetric,
    showAllRings: boolean
  ): void;
  getAnchors(): MetricAnchorInfo;
  dispose(): void;
}

export interface AvatarModelCalibration {
  chestRangeCm: [number, number];
  waistRangeCm: [number, number];
  hipsRangeCm: [number, number];
  shoulderRangeCm: [number, number];
}

export interface AvatarModelSpec {
  url: string;
  neutralHeightCm: number;
  neutralWeightKg: number;
  neutralMeasurements: {
    chestCm: number;
    waistCm: number;
    hipsCm: number;
    shoulderWidthCm: number;
  };
  calibration: AvatarModelCalibration;
  landmarksYRatio?: Partial<Record<ZoneKey, number>>;
}

export interface AvatarManifest {
  version: number;
  enabled: boolean;
  notes?: string;
  models: Partial<Record<GenderStyle, AvatarModelSpec>>;
}

