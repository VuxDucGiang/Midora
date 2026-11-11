"use client";

import React, { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import RulerSlider from "@/features/avatar/components/RulerSlider";
import {
  BODY_SHAPE_OPTIONS,
  HAIR_STYLE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from "@/features/avatar/utils/bodyEstimator";
import type {
  ActiveBodyMetric,
  AvatarCustomizationParams,
  AvatarDraft,
  BodyShapePreset,
  GenderStyle,
} from "@/types/bodyProfile";

export interface GuidedStepDef {
  id:
    | "shape"
    | "height"
    | "weight"
    | "shoulder"
    | "chest"
    | "waist"
    | "hips"
    | "appearance";
  shortLabel: string;
  title: string;
  promptPrefix: string;
  promptHighlight: string;
  promptSuffix: string;
  metric: ActiveBodyMetric;
  tip: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  majorInterval?: number;
  pixelsPerUnit?: number;
}

export const GUIDED_AVATAR_STEPS: GuidedStepDef[] = [
  {
    id: "shape",
    shortLabel: "Dáng",
    title: "Khung dáng cơ bản",
    promptPrefix: "Hãy bắt đầu bằng cách chọn",
    promptHighlight: "khung dáng & hình thể",
    promptSuffix: "gần giống bạn nhất.",
    metric: null,
    tip: "MIDORA sẽ tự động gợi ý các số đo chuẩn dựa trên khung dáng bạn chọn.",
  },
  {
    id: "height",
    shortLabel: "Cao",
    title: "Chiều cao",
    promptPrefix: "Tiếp theo, điều chỉnh",
    promptHighlight: "chiều cao thực tế",
    promptSuffix: "của bạn.",
    metric: "height",
    tip: "Kéo thước hoặc chạm vào con số để nhập chiều cao từ gót đến đỉnh đầu.",
    min: 140,
    max: 210,
    step: 1,
    unit: "cm",
    majorInterval: 5,
    pixelsPerUnit: 22,
  },
  {
    id: "weight",
    shortLabel: "Nặng",
    title: "Cân nặng",
    promptPrefix: "Chọn mức",
    promptHighlight: "cân nặng",
    promptSuffix: "để mô phỏng độ đầy đặn của cơ thể.",
    metric: null,
    tip: "Khi bật tự động ước lượng, 3 vòng và rộng vai sẽ tự cân chỉnh theo BMI.",
    min: 35,
    max: 140,
    step: 0.5,
    unit: "kg",
    majorInterval: 1,
    pixelsPerUnit: 52,
  },
  {
    id: "shoulder",
    shortLabel: "Vai",
    title: "Độ rộng vai",
    promptPrefix: "Kiểm tra & chỉnh",
    promptHighlight: "độ rộng vai",
    promptSuffix: "trên mẫu 3D.",
    metric: "shoulder",
    tip: "Đo thẳng ngang qua đỉnh hai xương vai — quyết định độ vừa của áo sơ mi & áo khoác.",
    min: 30,
    max: 60,
    step: 0.5,
    unit: "cm",
    majorInterval: 1,
    pixelsPerUnit: 62,
  },
  {
    id: "chest",
    shortLabel: "Ngực",
    title: "Vòng ngực",
    promptPrefix: "Kéo thước đo để chỉnh",
    promptHighlight: "vòng ngực",
    promptSuffix: "của bạn.",
    metric: "chest",
    tip: "Đo vòng ngang qua phần đầy nhất của ngực khi đứng thẳng tự nhiên.",
    min: 65,
    max: 150,
    step: 0.5,
    unit: "cm",
    majorInterval: 1,
    pixelsPerUnit: 62,
  },
  {
    id: "waist",
    shortLabel: "Eo",
    title: "Vòng eo",
    promptPrefix: "Tiếp tục, hãy nhập số đo",
    promptHighlight: "vòng eo",
    promptSuffix: "của bạn.",
    metric: "waist",
    tip: "Đo quanh phần thon nhất của eo, thường cao hơn rốn khoảng 2 cm.",
    min: 50,
    max: 140,
    step: 0.5,
    unit: "cm",
    majorInterval: 1,
    pixelsPerUnit: 62,
  },
  {
    id: "hips",
    shortLabel: "Hông",
    title: "Vòng hông",
    promptPrefix: "Tinh chỉnh số đo",
    promptHighlight: "vòng hông",
    promptSuffix: "để thử quần & chân váy chuẩn xác.",
    metric: "hips",
    tip: "Đo vòng quanh phần nở nhất của hông khi đứng khép hai chân.",
    min: 70,
    max: 155,
    step: 0.5,
    unit: "cm",
    majorInterval: 1,
    pixelsPerUnit: 62,
  },
  {
    id: "appearance",
    shortLabel: "Lưu",
    title: "Ngoại hình & Hồ sơ",
    promptPrefix: "Hoàn tất — chọn",
    promptHighlight: "sắc thái & lưu Avatar",
    promptSuffix: "của riêng bạn.",
    metric: null,
    tip: "Đặt tên hồ sơ và chọn tông màu hoặc chất liệu Ma-nơ-canh yêu thích.",
  },
];

interface BodyProfileBuilderProps {
  stepIndex: number;
  onStepChange: (nextIndex: number) => void;
  activeDraft: AvatarDraft;
  autoSyncQuickSetup: boolean;
  isAuthenticated: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  errorMessage: string | null;
  fieldErrors: Record<string, string>;
  successMessage: string | null;
  onToggleAutoSync: (enabled: boolean) => void;
  onApplySmartEstimate: () => void;
  onUpdateQuickSetup: (patch: {
    genderStyle?: GenderStyle;
    bodyShape?: BodyShapePreset;
    heightCm?: number;
    weightKg?: number;
  }) => void;
  onUpdateDimensions: (
    patch: Partial<
      Pick<
        AvatarDraft,
        | "profileName"
        | "heightCm"
        | "weightKg"
        | "chestCm"
        | "waistCm"
        | "hipsCm"
        | "shoulderWidthCm"
        | "isDefault"
      >
    >
  ) => void;
  onUpdateAppearance: (patch: Partial<AvatarCustomizationParams>) => void;
  onSave: () => void;
}

const GENDER_OPTIONS: Array<{ id: GenderStyle; label: string }> = [
  { id: "female", label: "Nữ" },
  { id: "male", label: "Nam" },
  { id: "neutral", label: "Unisex" },
];

export default function BodyProfileBuilder({
  stepIndex,
  onStepChange,
  activeDraft,
  autoSyncQuickSetup,
  isAuthenticated,
  isSaving,
  hasUnsavedChanges,
  errorMessage,
  fieldErrors,
  successMessage,
  onToggleAutoSync,
  onApplySmartEstimate,
  onUpdateQuickSetup,
  onUpdateDimensions,
  onUpdateAppearance,
  onSave,
}: BodyProfileBuilderProps) {
  const [showTip, setShowTip] = useState(false);
  const [editingNumber, setEditingNumber] = useState(false);
  const [draftNumberInput, setDraftNumberInput] = useState("");

  const currentStep = GUIDED_AVATAR_STEPS[stepIndex] ?? GUIDED_AVATAR_STEPS[0];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === GUIDED_AVATAR_STEPS.length - 1;

  const { genderStyle, bodyShape, skinTone, hairStyle } =
    activeDraft.avatarCustomizationParams;

  const getNumericValue = (): number => {
    switch (currentStep.id) {
      case "height":
        return activeDraft.heightCm;
      case "weight":
        return activeDraft.weightKg;
      case "shoulder":
        return activeDraft.shoulderWidthCm;
      case "chest":
        return activeDraft.chestCm;
      case "waist":
        return activeDraft.waistCm;
      case "hips":
        return activeDraft.hipsCm;
      default:
        return 0;
    }
  };

  const handleNumericChange = (nextVal: number) => {
    switch (currentStep.id) {
      case "height":
        onUpdateQuickSetup({ heightCm: nextVal });
        break;
      case "weight":
        onUpdateQuickSetup({ weightKg: nextVal });
        break;
      case "shoulder":
        onUpdateDimensions({ shoulderWidthCm: nextVal });
        break;
      case "chest":
        onUpdateDimensions({ chestCm: nextVal });
        break;
      case "waist":
        onUpdateDimensions({ waistCm: nextVal });
        break;
      case "hips":
        onUpdateDimensions({ hipsCm: nextVal });
        break;
      default:
        break;
    }
  };

  const currentVal = getNumericValue();
  const isNumericStep =
    currentStep.id !== "shape" && currentStep.id !== "appearance";

  const goToStep = (nextIdx: number) => {
    setShowTip(false);
    setEditingNumber(false);
    onStepChange(Math.max(0, Math.min(GUIDED_AVATAR_STEPS.length - 1, nextIdx)));
  };

  const commitInlineInput = () => {
    if (!isNumericStep) return;
    const parsed = Number.parseFloat(draftNumberInput);
    if (!Number.isNaN(parsed)) {
      const min = currentStep.min ?? 30;
      const max = currentStep.max ?? 220;
      const clamped = Math.max(min, Math.min(max, parsed));
      const rounded = Math.round(clamped * 2) / 2;
      handleNumericChange(rounded);
    }
    setEditingNumber(false);
  };

  return (
    <div className="pointer-events-auto flex w-[min(94vw,440px)] flex-col items-center gap-2.5">
      {/* Compact Status Toast Banner above dock */}
      {(errorMessage || successMessage) && (
        <div
          role={errorMessage ? "alert" : "status"}
          className={`w-full rounded-xl px-3.5 py-2 text-center text-xs shadow-xs backdrop-blur-md ${
            errorMessage
              ? "border border-red-200 bg-red-50/95 text-red-700"
              : "border border-[#2C523F]/25 bg-[#FAF7F2]/95 text-[#2C523F]"
          }`}
        >
          {errorMessage || successMessage}
        </div>
      )}

      {/* Main Compact Floating Glass Control Card */}
      <div className="w-full rounded-2xl liquid-glass px-4 py-3.5 sm:px-5 sm:py-4">
        {/* Card Header: < Prev | Title + Tip + Value | Next > */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={isFirstStep}
            onClick={() => goToStep(stepIndex - 1)}
            aria-label="Bước trước"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#57534E] transition-colors hover:bg-white/70 hover:text-[#191817] disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-xs font-medium text-[#57534E]">
                {currentStep.title}
              </span>
              <button
                type="button"
                onClick={() => setShowTip((prev) => !prev)}
                aria-label="Xem hướng dẫn đo"
                title={currentStep.tip}
                className="inline-flex items-center justify-center rounded-full p-0.5 text-[#8E8A85] hover:text-[#A25B26] cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>

            {isNumericStep && (
              <div className="mt-0.5 flex items-center justify-center">
                {editingNumber ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      autoFocus
                      min={currentStep.min}
                      max={currentStep.max}
                      step={currentStep.step}
                      value={draftNumberInput}
                      onChange={(e) => setDraftNumberInput(e.target.value)}
                      onBlur={commitInlineInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitInlineInput();
                        if (e.key === "Escape") setEditingNumber(false);
                      }}
                      className="h-7 w-20 rounded-lg border border-[#A25B26] bg-white px-2 text-center font-mono text-sm font-bold text-[#191817] focus:outline-hidden"
                    />
                    <span className="font-mono text-xs font-semibold text-[#57534E]">
                      {currentStep.unit}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftNumberInput(String(currentVal));
                      setEditingNumber(true);
                    }}
                    title="Nhấn để nhập số trực tiếp"
                    className="font-mono text-lg font-bold tracking-tight text-[#191817] hover:text-[#A25B26] transition-colors cursor-pointer"
                  >
                    {currentStep.step === 1
                      ? `${currentVal}`
                      : currentVal.toFixed(1)}{" "}
                    <span className="text-xs font-semibold text-[#57534E]">
                      {currentStep.unit}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isLastStep}
            onClick={() => goToStep(stepIndex + 1)}
            aria-label="Bước tiếp theo"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#57534E] transition-colors hover:bg-white/70 hover:text-[#191817] disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Concise Contextual Tip */}
        {showTip && (
          <p className="mt-1.5 rounded-lg bg-white/75 px-3 py-1.5 text-center text-[11px] text-[#57534E] leading-snug">
            {currentStep.tip}
          </p>
        )}

        {/* Step Body Control */}
        <div className="mt-2.5">
          {currentStep.id === "shape" && (
            <div className="space-y-2.5">
              {/* Gender Selector */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white/55 p-1">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      onUpdateQuickSetup({ genderStyle: option.id })
                    }
                    className={`rounded-lg py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      genderStyle === option.id
                        ? "bg-[#191817] text-[#FAF7F2] shadow-xs"
                        : "text-[#57534E] hover:text-[#191817]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* 5 Compact Shape Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {BODY_SHAPE_OPTIONS.map((shape) => {
                  const selected = bodyShape === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() =>
                        onUpdateQuickSetup({ bodyShape: shape.id })
                      }
                      title={shape.hint}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                        selected
                          ? "border-[#A25B26] bg-[#A25B26] text-[#FAF7F2]"
                          : "border-[#D3CBC0]/80 bg-white/65 text-[#191817] hover:bg-white"
                      }`}
                    >
                      {shape.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isNumericStep && (
            <div className="space-y-1.5">
              <RulerSlider
                value={currentVal}
                min={currentStep.min ?? 40}
                max={currentStep.max ?? 180}
                step={currentStep.step ?? 0.5}
                unit={currentStep.unit ?? "cm"}
                majorInterval={currentStep.majorInterval ?? 1}
                pixelsPerUnit={currentStep.pixelsPerUnit ?? 62}
                onChange={handleNumericChange}
              />

              {currentStep.id === "weight" && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#57534E]">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncQuickSetup}
                      onChange={(e) => onToggleAutoSync(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#A25B26] cursor-pointer"
                    />
                    Tự ước lượng 3 vòng & vai
                  </label>
                  <button
                    type="button"
                    onClick={onApplySmartEstimate}
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#A25B26] hover:underline cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    Ước lượng lại
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep.id === "appearance" && (
            <div className="space-y-2.5">
              {/* Profile Name + Default */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={100}
                  value={activeDraft.profileName}
                  onChange={(e) =>
                    onUpdateDimensions({ profileName: e.target.value })
                  }
                  placeholder="Tên hồ sơ (VD: Dáng chuẩn của tôi)"
                  className="h-9 flex-1 rounded-xl border border-[#D3CBC0] bg-white/80 px-3 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#A25B26] focus:bg-white focus:outline-hidden"
                />
                <label className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5DFD5] bg-white/70 px-2.5 h-9 text-[11px] text-[#191817] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeDraft.isDefault}
                    onChange={(e) =>
                      onUpdateDimensions({ isDefault: e.target.checked })
                    }
                    className="h-3.5 w-3.5 accent-[#A25B26] cursor-pointer"
                  />
                  Mặc định
                </label>
              </div>
              {fieldErrors.profileName && (
                <p className="text-[11px] text-red-600">
                  {fieldErrors.profileName}
                </p>
              )}

              {/* Skin Tone Swatches */}
              <div className="flex items-center justify-between gap-2 rounded-xl bg-white/55 px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#57534E]">
                  Sắc thái
                </span>
                <div className="flex items-center gap-2">
                  {SKIN_TONE_OPTIONS.map((tone) => {
                    const selected =
                      skinTone.toLowerCase() === tone.hex.toLowerCase();
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => onUpdateAppearance({ skinTone: tone.hex })}
                        title={tone.label}
                        className={`relative h-6 w-6 rounded-full border transition-transform cursor-pointer ${
                          selected
                            ? "scale-110 border-[#A25B26] ring-2 ring-[#A25B26]/35"
                            : "border-[#191817]/15 hover:scale-105"
                        }`}
                        style={{ backgroundColor: tone.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Compact Hair Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {HAIR_STYLE_OPTIONS.map((opt) => {
                  const selected = hairStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateAppearance({ hairStyle: opt.id })}
                      className={`inline-flex items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
                        selected
                          ? "border-[#191817] bg-[#191817] text-[#FAF7F2]"
                          : "border-[#D3CBC0]/80 bg-white/70 text-[#57534E] hover:text-[#191817]"
                      }`}
                    >
                      {selected && <Check className="h-2.5 w-2.5 shrink-0" />}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick-Jump Step Pills Strip inside Dock Footer */}
        <div className="mt-3 flex items-center justify-between gap-1 border-t border-[#191817]/[0.07] pt-2.5 overflow-x-auto">
          {GUIDED_AVATAR_STEPS.map((step, idx) => {
            const active = idx === stepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(idx)}
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-[#191817] text-[#FAF7F2] font-semibold"
                    : "text-[#8E8A85] hover:bg-white/70 hover:text-[#191817]"
                }`}
              >
                {step.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Centered Primary CTA Button directly below dock */}
      <div className="flex items-center justify-center gap-2">
        {!isLastStep ? (
          <>
            <button
              type="button"
              onClick={() => goToStep(stepIndex + 1)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#A25B26] px-7 font-mono text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-md transition-all hover:bg-[#8B4C1D] hover:-translate-y-0.5 cursor-pointer"
            >
              Tiếp tục
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {hasUnsavedChanges && (
              <button
                type="button"
                disabled={isSaving}
                onClick={onSave}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full liquid-glass-subtle px-4 font-mono text-[11px] font-medium uppercase tracking-wider text-[#191817] hover:bg-white/85 disabled:opacity-60 cursor-pointer"
              >
                {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                {isAuthenticated ? "Lưu nhanh" : "Lưu"}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#A25B26] px-7 font-mono text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-md transition-all hover:bg-[#8B4C1D] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {!isAuthenticated
              ? "Đăng nhập & Lưu Avatar"
              : activeDraft.id
                ? hasUnsavedChanges
                  ? "Lưu thay đổi Avatar"
                  : "Đã lưu hồ sơ"
                : "Hoàn tất & Lưu Avatar"}
          </button>
        )}
      </div>
    </div>
  );
}
