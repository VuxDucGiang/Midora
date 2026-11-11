"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Plus,
  Star,
  Trash2,
  UserCheck,
} from "lucide-react";
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
    profiles,
    activeDraft,
    autoSyncQuickSetup,
    isAuthenticated,
    isLoadingProfiles,
    isSaving,
    isDeleting,
    errorMessage,
    fieldErrors,
    successMessage,
    hasUnsavedChanges,
    setAutoSyncQuickSetup,
    selectProfile,
    startNewDraft,
    updateDimensions,
    updateQuickSetup,
    applySmartEstimate,
    updateAppearance,
    saveProfile,
    setAsDefault,
    deleteProfile,
  } = useBodyProfiles();

  const [stepIndex, setStepIndex] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

      {/* Top-Left Compact Saved Profile Switcher Pill */}
      <div className="pointer-events-none absolute left-3 top-[78px] sm:left-6 sm:top-[84px] z-20 flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={() => setProfileMenuOpen((prev) => !prev)}
          className="pointer-events-auto inline-flex h-8 max-w-[185px] sm:max-w-[230px] items-center gap-1.5 rounded-full liquid-glass-subtle px-3 text-xs font-medium text-[#191817] hover:bg-white/80 transition-all cursor-pointer"
        >
          {activeDraft.isDefault && isAuthenticated && (
            <Star className="h-3 w-3 shrink-0 fill-[#A25B26] text-[#A25B26]" />
          )}
          <span className="truncate">
            {activeDraft.profileName.trim() || "Dáng chuẩn của tôi"}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-[#57534E] transition-transform ${
              profileMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Expandable Profile & Quick Stats Popover */}
        {profileMenuOpen && (
          <div className="pointer-events-auto w-72 rounded-2xl liquid-glass p-3.5 text-xs shadow-lg">
            <div className="flex items-center justify-between border-b border-[#191817]/10 pb-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A25B26]">
                Hồ sơ số đo 3D
              </span>
              <button
                type="button"
                onClick={() => {
                  startNewDraft();
                  setStepIndex(0);
                  setProfileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-[#191817] px-2.5 py-0.5 font-mono text-[10px] text-[#FAF7F2] hover:bg-[#22384F] cursor-pointer"
              >
                <Plus className="h-2.5 w-2.5" />
                Mới
              </button>
            </div>

            {isAuthenticated ? (
              <div className="mt-2.5 space-y-1.5">
                {isLoadingProfiles ? (
                  <div className="flex items-center gap-2 py-2 text-[#57534E]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang tải hồ sơ...</span>
                  </div>
                ) : profiles.length > 0 ? (
                  <div className="max-h-40 space-y-1 overflow-y-auto pr-0.5">
                    {profiles.map((profile) => {
                      const selected = activeDraft.id === profile.id;
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => {
                            selectProfile(profile.id);
                            setProfileMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                            selected
                              ? "bg-[#191817] text-[#FAF7F2] font-medium"
                              : "bg-white/60 text-[#191817] hover:bg-white"
                          }`}
                        >
                          <span className="truncate">{profile.profileName}</span>
                          {profile.isDefault && (
                            <Star
                              className={`h-3 w-3 shrink-0 ${
                                selected
                                  ? "fill-[#A25B26] text-[#A25B26]"
                                  : "text-[#A25B26]"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-1 text-[11px] text-[#57534E]">
                    Chưa có hồ sơ nào được lưu.
                  </p>
                )}

                {activeDraft.id && (
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#191817]/10 text-[11px]">
                    {!activeDraft.isDefault ? (
                      <button
                        type="button"
                        onClick={() => void setAsDefault(activeDraft.id!)}
                        className="inline-flex items-center gap-1 font-medium text-[#A25B26] hover:underline cursor-pointer"
                      >
                        <Star className="h-3 w-3" />
                        Đặt mặc định
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[#2C523F]">
                        Đang dùng mặc định
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => void deleteProfile(activeDraft.id!)}
                      className="inline-flex items-center gap-1 text-[#8E8A85] hover:text-red-600 disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2.5 space-y-2">
                <p className="flex items-start gap-1.5 text-[11px] text-[#57534E] leading-snug">
                  <UserCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A25B26]" />
                  <span>
                    Đăng nhập để lưu nhiều hồ sơ vóc dáng và đồng bộ sang phòng thử đồ.
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full rounded-xl bg-[#191817] py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#FAF7F2] hover:bg-[#22384F] cursor-pointer"
                >
                  Đăng nhập / Đăng ký
                </button>
              </div>
            )}

            {/* Compact Telemetry Summary inside Popover */}
            <div className="mt-2.5 rounded-xl bg-white/60 p-2 text-[11px]">
              <p className="font-mono text-[10px] font-semibold text-[#191817]">
                {activeDraft.heightCm} cm • {activeDraft.weightKg} kg
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-[#57534E]">
                Vai {activeDraft.shoulderWidthCm} · Ngực {activeDraft.chestCm} · Eo{" "}
                {activeDraft.waistCm} · Hông {activeDraft.hipsCm}
              </p>
              <p className="mt-1 text-[10px] text-[#8E8A85]">{balanceNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Top-Center Guided Step Prompt */}
      <div className="pointer-events-none absolute inset-x-4 top-[120px] lg:inset-x-64 lg:top-[84px] z-10 flex flex-col items-center text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8E8A85]">
          Bước {stepIndex + 1} / {GUIDED_AVATAR_STEPS.length}
        </span>
        <h1 className="mt-0.5 font-serif text-base sm:text-xl lg:text-2xl font-normal text-[#191817] leading-snug">
          {currentStep.promptPrefix}{" "}
          <span className="font-semibold text-[#A25B26]">
            {currentStep.promptHighlight}
          </span>
          {currentStep.promptSuffix ? ` ${currentStep.promptSuffix}` : ""}
        </h1>
      </div>

      {/* Bottom-Center Compact Guided Control Dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 sm:bottom-5 z-20 flex justify-center px-3">
        <BodyProfileBuilder
          stepIndex={stepIndex}
          onStepChange={setStepIndex}
          activeDraft={activeDraft}
          autoSyncQuickSetup={autoSyncQuickSetup}
          isAuthenticated={isAuthenticated}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          errorMessage={errorMessage}
          fieldErrors={fieldErrors}
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
