import type {
  AvatarDraft,
  BodyShapePreset,
  GenderStyle,
  HairStyle,
} from "@/types/bodyProfile";

export interface SkinToneOption {
  id: string;
  label: string;
  hex: string;
  isMannequin?: boolean;
}

export const SKIN_TONE_OPTIONS: SkinToneOption[] = [
  { id: "porcelain", label: "Sáng ấm", hex: "#ECCDB8" },
  { id: "sand", label: "Tự nhiên", hex: "#DFB99B" },
  { id: "honey", label: "Mật ong", hex: "#C69570" },
  { id: "caramel", label: "Nâu ấm", hex: "#9B6847" },
  { id: "espresso", label: "Nâu trầm", hex: "#6A4330" },
  { id: "linen", label: "Vải Linen", hex: "#E5DDD0", isMannequin: true },
];

export interface HairStyleOption {
  id: HairStyle;
  label: string;
}

export const HAIR_STYLE_OPTIONS: HairStyleOption[] = [
  { id: "short_clean", label: "Tóc ngắn gọn" },
  { id: "medium_bob", label: "Tóc bob ngang vai" },
  { id: "long_straight", label: "Tóc dài suôn" },
  { id: "none", label: "Ma-nơ-canh tối giản" },
];

function clampAndRound(val: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, val));
  return Math.round(clamped * 2) / 2;
}

export function estimateBodyMeasurements(params: {
  genderStyle: GenderStyle;
  bodyShape: BodyShapePreset;
  heightCm: number;
  weightKg: number;
}): {
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  shoulderWidthCm: number;
} {
  const { genderStyle, bodyShape, heightCm, weightKg } = params;
  const heightM = Math.max(1.2, heightCm / 100);
  const bmi = Math.max(15, Math.min(38, weightKg / (heightM * heightM)));

  let chest: number;
  let waist: number;
  let hips: number;
  let shoulder: number;

  if (genderStyle === "female") {
    chest = 84 + (bmi - 20) * 2.1 + (heightCm - 162) * 0.14;
    waist = 65 + (bmi - 20) * 2.2 + (heightCm - 162) * 0.08;
    hips = 91 + (bmi - 20) * 2.15 + (heightCm - 162) * 0.14;
    shoulder = 38 + (heightCm - 162) * 0.17 + (bmi - 20) * 0.42;
  } else if (genderStyle === "male") {
    chest = 95 + (bmi - 22) * 2.3 + (heightCm - 175) * 0.18;
    waist = 78 + (bmi - 22) * 2.5 + (heightCm - 175) * 0.12;
    hips = 94 + (bmi - 22) * 2.0 + (heightCm - 175) * 0.14;
    shoulder = 44.5 + (heightCm - 175) * 0.21 + (bmi - 22) * 0.55;
  } else {
    chest = 89.5 + (bmi - 21) * 2.2 + (heightCm - 168) * 0.16;
    waist = 71.5 + (bmi - 21) * 2.35 + (heightCm - 168) * 0.1;
    hips = 92.5 + (bmi - 21) * 2.05 + (heightCm - 168) * 0.14;
    shoulder = 41.2 + (heightCm - 168) * 0.19 + (bmi - 21) * 0.48;
  }

  switch (bodyShape) {
    case "slim":
      chest -= 2.5;
      waist -= 3.0;
      hips -= 2.5;
      shoulder -= 0.8;
      break;
    case "curvy":
      chest += 3.5;
      waist -= 2.5;
      hips += 5.5;
      shoulder -= 0.4;
      break;
    case "athletic":
      chest += 4.0;
      waist -= 1.5;
      hips += 0.5;
      shoulder += 2.2;
      break;
    case "broad_shoulder":
      chest += 3.5;
      waist += 1.0;
      hips -= 1.0;
      shoulder += 3.2;
      break;
    case "balanced":
    default:
      break;
  }

  return {
    chestCm: clampAndRound(chest, 60, 160),
    waistCm: clampAndRound(waist, 45, 150),
    hipsCm: clampAndRound(hips, 65, 170),
    shoulderWidthCm: clampAndRound(shoulder, 30, 65),
  };
}

export function createDefaultAvatarDraft(
  genderStyle: GenderStyle = "female"
): AvatarDraft {
  const heightCm = genderStyle === "male" ? 175 : genderStyle === "female" ? 163 : 168;
  const weightKg = genderStyle === "male" ? 68 : genderStyle === "female" ? 53 : 60;
  const bodyShape: BodyShapePreset = "balanced";
  const estimated = estimateBodyMeasurements({
    genderStyle,
    bodyShape,
    heightCm,
    weightKg,
  });

  return {
    profileName: "Dáng chuẩn của tôi",
    heightCm,
    weightKg,
    ...estimated,
    avatarCustomizationParams: {
      genderStyle,
      bodyShape,
      skinTone: "#DFB99B",
      hairStyle: genderStyle === "male" ? "short_clean" : "medium_bob",
    },
    isDefault: true,
  };
}

export function getBodyBalanceNote(heightCm: number, weightKg: number): string {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (bmi < 18.5) return "Dáng thanh mảnh • Thích hợp form layer & vintage suông";
  if (bmi < 23.5) return "Tỷ lệ cân đối • Dễ phối đa dạng phom dáng vintage";
  if (bmi < 27.5) return "Dáng đầy đặn • Gợi ý chọn áo vai vừa & chất liệu rũ";
  return "Form dáng rộng rãi • Ưu tiên độ thoải mái vùng ngực & eo";
}

