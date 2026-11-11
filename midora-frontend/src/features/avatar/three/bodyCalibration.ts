import * as THREE from "three";
import type {
  AvatarModelSpec,
  MetricAnchorInfo,
  ZoneKey,
  ZoneRingTarget,
} from "@/features/avatar/three/avatarRigTypes";
import type { AvatarDraft, GenderStyle } from "@/types/bodyProfile";

export interface AnthropometricFrame {
  H: number;
  refH: number;
  bmi: number;
  fullness: number;
  headHeightM: number;
  neckHeightM: number;
  crownY: number;
  chinY: number;
  neckBaseY: number;
  crotchY: number;
  torsoHeight: number;
  hipY: number;
  waistY: number;
  chestY: number;
  shoulderY: number;
  tHips: number;
  tWaist: number;
  tChest: number;
  tShoulder: number;
  shoulderHalfW: number;
  hipsRadii: { rx: number; rz: number };
  waistRadii: { rx: number; rz: number };
  chestRadii: { rx: number; rz: number };
  shoulderRz: number;
  bustProjectionM: number;
  gluteProjectionM: number;
  anchors: MetricAnchorInfo;
}

export interface GlbBodyControlSolution {
  /** Signed morphological controls [-1..1] */
  signedControls: {
    chest: number;
    waist: number;
    hips: number;
    shoulder: number;
    fullness: number;
    femaleBlend: number;
    maleBlend: number;
  };
  /** Named target weights compatible with both bidirectional & split (+/-) shape keys */
  morphWeightMap: Record<string, number>;
  /** Sub-linear bone scaling factors relative to the reference neutral model */
  boneScales: {
    overallScale: number;
    legScaleY: number;
    spineScaleY: number;
    headCompensationY: number;
    headCompensationXZ: number;
    armLengthScale: number;
    shoulderShiftX: number;
  };
}

/**
 * Converts a perimeter in meters and depth-to-width ratio k = rz / rx
 * into accurate ellipse semi-axes via Ramanujan's perimeter formula.
 */
export function circumferenceToRadii(
  circumferenceM: number,
  k: number
): { rx: number; rz: number } {
  const denom = Math.PI * (3 * (1 + k) - Math.sqrt((3 + k) * (1 + 3 * k)));
  const rx = circumferenceM / Math.max(denom, 0.001);
  return { rx, rz: rx * k };
}

function getReferenceHeight(genderStyle: GenderStyle): number {
  return genderStyle === "male" ? 1.75 : genderStyle === "female" ? 1.63 : 1.68;
}

/**
 * Computes sub-linear ANSUR-II-inspired human proportions so taller or shorter
 * avatars adjust naturally through the legs and trunk rather than scaling the head linearly.
 */
export function computeAnthropometricFrame(draft: AvatarDraft): AnthropometricFrame {
  const H = THREE.MathUtils.clamp(draft.heightCm / 100, 1.3, 2.15);
  const { genderStyle } = draft.avatarCustomizationParams;
  const refH = getReferenceHeight(genderStyle);
  const deltaH = H - refH;

  // Sub-linear head height (~22.1cm female / ~23.1cm male, ~7.3 to 8.1 head ratios)
  const baseHead =
    genderStyle === "male" ? 0.231 : genderStyle === "female" ? 0.221 : 0.226;
  const headHeightM = THREE.MathUtils.clamp(baseHead + deltaH * 0.045, 0.205, 0.252);

  // Subtle neck elongation with stature
  const baseNeck = genderStyle === "male" ? 0.072 : 0.068;
  const neckHeightM = THREE.MathUtils.clamp(baseNeck + deltaH * 0.055, 0.056, 0.09);

  const crownY = H;
  const chinY = crownY - headHeightM;
  const neckBaseY = chinY - neckHeightM;

  // Taller statures distribute slightly more gain into femur/tibia than trunk
  const baseLegFraction = genderStyle === "male" ? 0.466 : 0.46;
  const legFraction = THREE.MathUtils.clamp(
    baseLegFraction + deltaH * 0.045,
    0.442,
    0.486
  );
  const crotchY = H * legFraction;
  const torsoHeight = Math.max(0.42, neckBaseY - crotchY);

  // Anatomical landmark fractions along torso (0 = crotch, 1 = neck/clavicle root)
  const tHips = genderStyle === "female" ? 0.145 : 0.135;
  const tWaist = genderStyle === "female" ? 0.465 : 0.44;
  const tChest = genderStyle === "female" ? 0.725 : 0.735;
  const tShoulder = 0.915;

  const hipY = crotchY + tHips * torsoHeight;
  const waistY = crotchY + tWaist * torsoHeight;
  const chestY = crotchY + tChest * torsoHeight;
  const shoulderY = crotchY + tShoulder * torsoHeight;

  const bmi = draft.weightKg / (H * H);
  const fullness = THREE.MathUtils.clamp((bmi - 19) / 13, -0.3, 1.15);

  const chestM = draft.chestCm / 100;
  const waistM = draft.waistCm / 100;
  const hipsM = draft.hipsCm / 100;
  const shoulderHalfW = Math.max(0.14, draft.shoulderWidthCm / 200);

  // Realistic anterior-posterior (depth/width) ratios calibrated by gender & fullness
  const hipK = (genderStyle === "female" ? 0.72 : 0.75) + fullness * 0.03;
  const waistK = (genderStyle === "female" ? 0.73 : 0.78) + fullness * 0.045;
  const chestK = (genderStyle === "female" ? 0.7 : 0.72) + fullness * 0.035;

  const hipsRadii = circumferenceToRadii(hipsM, hipK);
  const waistRadii = circumferenceToRadii(waistM, waistK);
  const chestRadii = circumferenceToRadii(chestM, chestK);
  const shoulderRz = chestRadii.rz * 0.74;

  // Bilateral anatomical forward/posterior surface projection
  const bustProjectionM =
    genderStyle === "female"
      ? 0.015 + Math.max(0, fullness) * 0.005
      : genderStyle === "neutral"
        ? 0.007
        : 0.006;
  const gluteProjectionM =
    genderStyle === "female" ? 0.022 : genderStyle === "neutral" ? 0.017 : 0.015;

  const zones: Record<ZoneKey, ZoneRingTarget> = {
    chest: {
      y: chestY,
      z: 0.008,
      rx: chestRadii.rx * 1.028,
      rz: (chestRadii.rz + bustProjectionM * 0.65) * 1.032,
    },
    waist: {
      y: waistY,
      z: 0.012,
      rx: waistRadii.rx * 1.028,
      rz: waistRadii.rz * 1.032,
    },
    hips: {
      y: hipY,
      z: -0.006,
      rx: hipsRadii.rx * 1.026,
      rz: (hipsRadii.rz + gluteProjectionM * 0.6) * 1.03,
    },
    shoulder: {
      y: shoulderY,
      z: -0.006,
      rx: shoulderHalfW * 1.015,
      rz: shoulderRz * 1.12,
    },
  };

  return {
    H,
    refH,
    bmi,
    fullness,
    headHeightM,
    neckHeightM,
    crownY,
    chinY,
    neckBaseY,
    crotchY,
    torsoHeight,
    hipY,
    waistY,
    chestY,
    shoulderY,
    tHips,
    tWaist,
    tChest,
    tShoulder,
    shoulderHalfW,
    hipsRadii,
    waistRadii,
    chestRadii,
    shoulderRz,
    bustProjectionM,
    gluteProjectionM,
    anchors: {
      chestY,
      waistY,
      hipsY: hipY,
      shoulderY,
      heightM: H,
      shoulderHalfW,
      zones,
    },
  };
}

function normalizeSignedRange(
  value: number,
  neutral: number,
  range: [number, number]
): number {
  const [minVal, maxVal] = range;
  if (value >= neutral) {
    return THREE.MathUtils.clamp((value - neutral) / Math.max(maxVal - neutral, 1), 0, 1);
  }
  return -THREE.MathUtils.clamp((neutral - value) / Math.max(neutral - minVal, 1), 0, 1);
}

/**
 * Solves glTF Morph Target weights and sub-linear Skeleton Bone scales
 * for MPFB2/Blender-exported MIDORA avatar rigs.
 */
export function solveGlbBodyControls(
  draft: AvatarDraft,
  spec?: AvatarModelSpec
): GlbBodyControlSolution {
  const { genderStyle } = draft.avatarCustomizationParams;
  const frame = computeAnthropometricFrame(draft);

  const neutral = spec?.neutralMeasurements ?? {
    chestCm: genderStyle === "male" ? 97 : genderStyle === "female" ? 86 : 90,
    waistCm: genderStyle === "male" ? 80 : genderStyle === "female" ? 67 : 72,
    hipsCm: genderStyle === "male" ? 96 : genderStyle === "female" ? 93 : 94,
    shoulderWidthCm:
      genderStyle === "male" ? 44.5 : genderStyle === "female" ? 38.5 : 41,
  };

  const cal = spec?.calibration ?? {
    chestRangeCm: genderStyle === "male" ? [82, 130] : [72, 118],
    waistRangeCm: genderStyle === "male" ? [65, 118] : [54, 108],
    hipsRangeCm: genderStyle === "male" ? [82, 122] : [78, 126],
    shoulderRangeCm: genderStyle === "male" ? [38, 54] : [33, 47],
  };

  const chest = normalizeSignedRange(draft.chestCm, neutral.chestCm, cal.chestRangeCm);
  const waist = normalizeSignedRange(draft.waistCm, neutral.waistCm, cal.waistRangeCm);
  const hips = normalizeSignedRange(draft.hipsCm, neutral.hipsCm, cal.hipsRangeCm);
  const shoulder = normalizeSignedRange(
    draft.shoulderWidthCm,
    neutral.shoulderWidthCm,
    cal.shoulderRangeCm
  );

  const neutralH = (spec?.neutralHeightCm ?? (genderStyle === "male" ? 175 : 163)) / 100;
  const neutralW = spec?.neutralWeightKg ?? (genderStyle === "male" ? 69 : 54);
  const neutralBmi = neutralW / (neutralH * neutralH);
  const fullness = THREE.MathUtils.clamp((frame.bmi - neutralBmi) / 8.5, -1, 1);

  const femaleBlend = genderStyle === "female" ? 1 : genderStyle === "neutral" ? 0.5 : 0;
  const maleBlend = genderStyle === "male" ? 1 : genderStyle === "neutral" ? 0.5 : 0;

  // Sub-linear bone scales anchored to reference neutral stature
  const overallScale = frame.H / neutralH;
  const neutralLegRatio = genderStyle === "male" ? 0.466 : 0.46;
  const legScaleY = frame.crotchY / (neutralH * neutralLegRatio);
  const neutralHeadH = genderStyle === "male" ? 0.231 : 0.221;
  const neutralNeckH = genderStyle === "male" ? 0.072 : 0.068;
  const neutralTorsoH = neutralH - neutralHeadH - neutralNeckH - neutralH * neutralLegRatio;
  const spineScaleY = frame.torsoHeight / Math.max(neutralTorsoH, 0.35);

  const headTargetScale = frame.headHeightM / neutralHeadH;
  const headCompensationY = headTargetScale / Math.max(spineScaleY, 0.5);
  const headCompensationXZ = headTargetScale;

  // Populate both signed targets and positive/negative split keys (glTF export friendly)
  const pairs: Array<[string, number]> = [
    ["chest_girth", chest],
    ["waist_girth", waist],
    ["hip_girth", hips],
    ["shoulder_width", shoulder],
    ["body_weight", fullness],
  ];

  const morphWeightMap: Record<string, number> = {
    gender_female: femaleBlend,
    gender_male: maleBlend,
    body_fullness: Math.max(0, fullness),
  };

  for (const [key, val] of pairs) {
    morphWeightMap[key] = val;
    morphWeightMap[`${key}_plus`] = Math.max(0, val);
    morphWeightMap[`${key}_minus`] = Math.max(0, -val);
  }

  return {
    signedControls: {
      chest,
      waist,
      hips,
      shoulder,
      fullness,
      femaleBlend,
      maleBlend,
    },
    morphWeightMap,
    boneScales: {
      overallScale,
      legScaleY,
      spineScaleY,
      headCompensationY,
      headCompensationXZ,
      armLengthScale: 0.5 * legScaleY + 0.5 * spineScaleY,
      shoulderShiftX: (draft.shoulderWidthCm - neutral.shoulderWidthCm) / 200,
    },
  };
}

