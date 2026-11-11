"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Ruler, UserCheck } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Avatar3DCanvas from "@/features/avatar/components/Avatar3DCanvas";
import BodyProfileBuilder, {
  GUIDED_AVATAR_STEPS,
} from "@/features/avatar/components/BodyProfileBuilder";
import { useBodyProfiles } from "@/features/avatar/hooks/useBodyProfiles";
import { getBodyBalanceNote } from "@/features/avatar/utils/bodyEstimator";

export default function AvatarWorkspace() {
  const { openAuthModal } = useAuth();
  const {
    savedProfile,
    activeDraft,
    autoSyncQuickSetup,
    isAuthenticated,
    isLoadingProfile,
    isSaving,
    errorMessage,
    successMessage,
    hasUnsavedChanges,
    setAutoSyncQuickSetup,
    updateDimensions,
    updateQuickSetup,
    applySmartEstimate,
    updateAppearance,
    saveProfile,
  } = useBodyProfiles();

  const [stepIndex, setStepIndex] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const currentStep =
    GUIDED_AVATAR_STEPS[stepIndex] ?? GUIDED_AVATAR_STEPS[0];

  const balanceNote = useMemo(
    () => getBodyBalanceNote(activeDraft.heightCm, activeDraft.weightKg),
    [activeDraft.heightCm, activeDraft.weightKg]
  );

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-[#F4EFEA]">
      {/* Full-Viewport Centered 3D Atelier Canvas */}
      <Avatar3DCanvas
        draft={activeDraft}
        activeMetric={currentStep.metric}
      />

      {/* Top-Left Compact Body Summary Chip (1 person = 1 editable body profile) */}
      <div className="pointer-events-none absolute left-3 top-[78px] sm:left-6 sm:top-[84px] z-20 flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={() => setSummaryOpen((prev) => !prev)}
          className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full liquid-glass-subtle px-3 text-xs font-medium text-[#191817] hover:bg-white/85 transition-all cursor-pointer"
        >
          {isLoadingProfile ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#A25B26]" />
          ) : savedProfile && !hasUnsavedChanges ? (
            <Check className="h-3.5 w-3.5 text-[#2C523F]" />
          ) : (
            <Ruler className="h-3.5 w-3.5 text-[#A25B26]" />
          )}
          <span className="font-mono">
            {activeDraft.heightCm} cm · {activeDraft.weightKg} kg
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#57534E] transition-transform ${
              summaryOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {summaryOpen && (
          <div className="pointer-events-auto w-72 rounded-2xl liquid-glass p-4 text-xs shadow-lg">
            <div className="flex items-center justify-between border-b border-[#191817]/10 pb-2">
              <span className="text-xs font-semibold text-[#191817]">
                Số đo cơ thể của bạn
              </span>
              {savedProfile && (
                <span className="rounded-full bg-[#2C523F]/10 px-2 py-0.5 text-[11px] font-medium text-[#2C523F]">
                  {hasUnsavedChanges ? "Chưa lưu" : "Đã đồng bộ"}
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs text-[#191817]">
              <div className="rounded-xl bg-white/65 px-2.5 py-1.5">
                <span className="block text-[11px] text-[#57534E] font-sans">
                  Rộng vai
                </span>
                <strong>{activeDraft.shoulderWidthCm} cm</strong>
              </div>
              <div className="rounded-xl bg-white/65 px-2.5 py-1.5">
                <span className="block text-[11px] text-[#57534E] font-sans">
                  Vòng ngực
                </span>
                <strong>{activeDraft.chestCm} cm</strong>
              </div>
              <div className="rounded-xl bg-white/65 px-2.5 py-1.5">
                <span className="block text-[11px] text-[#57534E] font-sans">
                  Vòng eo
                </span>
                <strong>{activeDraft.waistCm} cm</strong>
              </div>
              <div className="rounded-xl bg-white/65 px-2.5 py-1.5">
                <span className="block text-[11px] text-[#57534E] font-sans">
                  Vòng hông
                </span>
                <strong>{activeDraft.hipsCm} cm</strong>
              </div>
            </div>

            <p className="mt-2.5 text-xs text-[#57534E] leading-relaxed">
              {balanceNote}
            </p>

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setSummaryOpen(false);
                  openAuthModal("login");
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#191817] py-2 text-xs font-semibold text-[#FAF7F2] hover:bg-[#22384F] cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Đăng nhập để lưu số đo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Top-Center Guided Step Prompt */}
      <div className="pointer-events-none absolute inset-x-4 top-[118px] lg:inset-x-64 lg:top-[84px] z-10 flex flex-col items-center text-center">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#57534E]">
          Bước {stepIndex + 1} / {GUIDED_AVATAR_STEPS.length}
        </span>
        <h1 className="mt-0.5 font-serif text-lg sm:text-xl lg:text-2xl font-normal text-[#191817] leading-snug">
          {currentStep.promptPrefix}{" "}
          <span className="font-semibold text-[#A25B26]">
            {currentStep.promptHighlight}
          </span>
          {currentStep.promptSuffix ? ` ${currentStep.promptSuffix}` : ""}
        </h1>
      </div>

      {/* Bottom-Center Unified Compact Control Dock (flush near bottom to maximize Avatar space) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 sm:bottom-4 z-20 flex justify-center px-3">
        <BodyProfileBuilder
          stepIndex={stepIndex}
          onStepChange={setStepIndex}
          activeDraft={activeDraft}
          autoSyncQuickSetup={autoSyncQuickSetup}
          isAuthenticated={isAuthenticated}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          errorMessage={errorMessage}
          successMessage={successMessage}
          onToggleAutoSync={setAutoSyncQuickSetup}
          onApplySmartEstimate={applySmartEstimate}
          onUpdateQuickSetup={updateQuickSetup}
          onUpdateDimensions={updateDimensions}
          onUpdateAppearance={updateAppearance}
          onSave={() => void saveProfile()}
        />
      </div>
    </section>
  );
}
