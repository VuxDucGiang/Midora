export type GenderStyle = "female" | "male" | "neutral";

export type BodyShapePreset =
  | "slim"
  | "balanced"
  | "curvy"
  | "athletic"
  | "broad_shoulder";

export type HairStyle =
  | "none"
  | "short_clean"
  | "medium_bob"
  | "long_straight";

export type ActiveBodyMetric =
  | "height"
  | "shoulder"
  | "chest"
  | "waist"
  | "hips"
  | null;

export interface AvatarCustomizationParams {
  genderStyle: GenderStyle;
  bodyShape: BodyShapePreset;
  skinTone: string;
  hairStyle: HairStyle;
}

export interface BodyProfileRequest {
  profileName: string;
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  shoulderWidthCm?: number;
  avatarCustomizationParams: AvatarCustomizationParams;
  isDefault?: boolean;
}

export interface BodyProfileResponse {
  id: number;
  userId: number;
  profileName: string;
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  shoulderWidthCm: number;
  avatarCustomizationParams: AvatarCustomizationParams;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarDraft {
  id?: number;
  profileName: string;
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  shoulderWidthCm: number;
  avatarCustomizationParams: AvatarCustomizationParams;
  isDefault: boolean;
}

