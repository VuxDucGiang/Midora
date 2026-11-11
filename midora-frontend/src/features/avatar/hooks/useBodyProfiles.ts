"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiRequestError } from "@/lib/apiClient";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { bodyProfileService } from "@/features/avatar/services/bodyProfileService";
import {
  createDefaultAvatarDraft,
  estimateBodyMeasurements,
} from "@/features/avatar/utils/bodyEstimator";
import type {
  ActiveBodyMetric,
  AvatarCustomizationParams,
  AvatarDraft,
  BodyProfileRequest,
  BodyProfileResponse,
  GenderStyle,
} from "@/types/bodyProfile";

const DEFAULT_SINGLE_PROFILE_NAME = "Số đo cá nhân";

function toDraft(profile: BodyProfileResponse): AvatarDraft {
  return {
    id: profile.id,
    profileName: profile.profileName || DEFAULT_SINGLE_PROFILE_NAME,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    chestCm: profile.chestCm,
    waistCm: profile.waistCm,
    hipsCm: profile.hipsCm,
    shoulderWidthCm: profile.shoulderWidthCm,
    avatarCustomizationParams: { ...profile.avatarCustomizationParams },
    isDefault: true,
  };
}

function toRequestPayload(draft: AvatarDraft): BodyProfileRequest {
  return {
    profileName: DEFAULT_SINGLE_PROFILE_NAME,
    heightCm: draft.heightCm,
    weightKg: draft.weightKg,
    chestCm: draft.chestCm,
    waistCm: draft.waistCm,
    hipsCm: draft.hipsCm,
    shoulderWidthCm: draft.shoulderWidthCm,
    avatarCustomizationParams: draft.avatarCustomizationParams,
    isDefault: true,
  };
}

export function useBodyProfiles() {
  const { isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();

  const [savedProfile, setSavedProfile] = useState<BodyProfileResponse | null>(
    null
  );
  const [activeDraft, setActiveDraft] = useState<AvatarDraft>(() =>
    createDefaultAvatarDraft("female")
  );
  const [activeMetric, setActiveMetric] = useState<ActiveBodyMetric>(null);
  const [autoSyncQuickSetup, setAutoSyncQuickSetup] = useState(true);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pendingSaveAfterAuthRef = useRef(false);
  const activeDraftRef = useRef(activeDraft);
  useEffect(() => {
    activeDraftRef.current = activeDraft;
  }, [activeDraft]);

  useEffect(() => {
    if (isAuthLoading) return;

    const controller = new AbortController();
    let mounted = true;

    async function syncWithAccount() {
      if (!isAuthenticated) {
        await Promise.resolve();
        if (!mounted) return;
        pendingSaveAfterAuthRef.current = false;
        setSavedProfile(null);
        setActiveDraft((prev) => (prev.id ? { ...prev, id: undefined } : prev));
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      setErrorMessage(null);

      try {
        if (pendingSaveAfterAuthRef.current) {
          pendingSaveAfterAuthRef.current = false;
          const draftToSave = activeDraftRef.current;
          const saved = await bodyProfileService.createProfile(
            toRequestPayload(draftToSave)
          );
          if (!mounted) return;
          setSavedProfile(saved);
          setActiveDraft(toDraft(saved));
          setSuccessMessage("Đã đăng nhập và lưu số đo Avatar của bạn.");
          return;
        }

        const list = await bodyProfileService.getMyProfiles(controller.signal);
        if (!mounted) return;
        if (list.length > 0) {
          const existing = list.find((item) => item.isDefault) ?? list[0];
          setSavedProfile(existing);
          setActiveDraft(toDraft(existing));
        } else {
          setSavedProfile(null);
        }
      } catch (err) {
        if (!mounted || controller.signal.aborted) return;
        if (err instanceof ApiRequestError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Không thể tải số đo cá nhân của bạn.");
        }
      } finally {
        if (mounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    void syncWithAccount();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isAuthenticated, isAuthLoading]);

  const clearFeedback = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const updateDimensions = useCallback(
    (
      patch: Partial<
        Pick<
          AvatarDraft,
          | "heightCm"
          | "weightKg"
          | "chestCm"
          | "waistCm"
          | "hipsCm"
          | "shoulderWidthCm"
        >
      >
    ) => {
      setSuccessMessage(null);
      setErrorMessage(null);
      setActiveDraft((prev) => ({
        ...prev,
        ...patch,
      }));
    },
    []
  );

  const updateQuickSetup = useCallback(
    (patch: {
      genderStyle?: GenderStyle;
      heightCm?: number;
      weightKg?: number;
    }) => {
      setSuccessMessage(null);
      setErrorMessage(null);
      setActiveDraft((prev) => {
        const nextGender =
          patch.genderStyle ?? prev.avatarCustomizationParams.genderStyle;
        const nextShape = "balanced" as const;
        const nextHeight = patch.heightCm ?? prev.heightCm;
        const nextWeight = patch.weightKg ?? prev.weightKg;

        const nextHair =
          patch.genderStyle &&
          patch.genderStyle !== prev.avatarCustomizationParams.genderStyle
            ? patch.genderStyle === "male"
              ? "short_clean"
              : "medium_bob"
            : prev.avatarCustomizationParams.hairStyle;

        const nextEstimated = autoSyncQuickSetup
          ? estimateBodyMeasurements({
              genderStyle: nextGender,
              bodyShape: nextShape,
              heightCm: nextHeight,
              weightKg: nextWeight,
            })
          : {};

        return {
          ...prev,
          heightCm: nextHeight,
          weightKg: nextWeight,
          ...nextEstimated,
          avatarCustomizationParams: {
            ...prev.avatarCustomizationParams,
            genderStyle: nextGender,
            bodyShape: nextShape,
            hairStyle: nextHair,
          },
        };
      });
    },
    [autoSyncQuickSetup]
  );

  const applySmartEstimate = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setActiveDraft((prev) => {
      const estimated = estimateBodyMeasurements({
        genderStyle: prev.avatarCustomizationParams.genderStyle,
        bodyShape: "balanced",
        heightCm: prev.heightCm,
        weightKg: prev.weightKg,
      });
      return {
        ...prev,
        ...estimated,
        avatarCustomizationParams: {
          ...prev.avatarCustomizationParams,
          bodyShape: "balanced",
        },
      };
    });
  }, []);

  const updateAppearance = useCallback(
    (patch: Partial<AvatarCustomizationParams>) => {
      setSuccessMessage(null);
      setErrorMessage(null);
      setActiveDraft((prev) => ({
        ...prev,
        avatarCustomizationParams: {
          ...prev.avatarCustomizationParams,
          ...patch,
        },
      }));
    },
    []
  );

  const saveProfile = useCallback(async (): Promise<BodyProfileResponse | null> => {
    clearFeedback();

    if (!isAuthenticated) {
      pendingSaveAfterAuthRef.current = true;
      openAuthModal("login");
      return null;
    }

    const current = activeDraftRef.current;
    setIsSaving(true);
    try {
      const payload = toRequestPayload(current);
      const saved = current.id
        ? await bodyProfileService.updateProfile(current.id, payload)
        : await bodyProfileService.createProfile(payload);

      setSavedProfile(saved);
      setActiveDraft(toDraft(saved));
      setSuccessMessage(
        current.id
          ? "Đã cập nhật số đo cơ thể của bạn."
          : "Đã lưu số đo Avatar cá nhân thành công."
      );
      return saved;
    } catch (err) {
      setErrorMessage(
        err instanceof ApiRequestError
          ? err.message
          : "Không thể lưu số đo Avatar, vui lòng thử lại."
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, openAuthModal, clearFeedback]);

  const hasUnsavedChanges = useMemo(() => {
    if (!savedProfile) return true;
    return (
      savedProfile.heightCm !== activeDraft.heightCm ||
      savedProfile.weightKg !== activeDraft.weightKg ||
      savedProfile.chestCm !== activeDraft.chestCm ||
      savedProfile.waistCm !== activeDraft.waistCm ||
      savedProfile.hipsCm !== activeDraft.hipsCm ||
      savedProfile.shoulderWidthCm !== activeDraft.shoulderWidthCm ||
      savedProfile.avatarCustomizationParams.genderStyle !==
        activeDraft.avatarCustomizationParams.genderStyle ||
      savedProfile.avatarCustomizationParams.bodyShape !==
        activeDraft.avatarCustomizationParams.bodyShape ||
      savedProfile.avatarCustomizationParams.skinTone !==
        activeDraft.avatarCustomizationParams.skinTone ||
      savedProfile.avatarCustomizationParams.hairStyle !==
        activeDraft.avatarCustomizationParams.hairStyle
    );
  }, [activeDraft, savedProfile]);

  return {
    savedProfile,
    activeDraft,
    activeMetric,
    autoSyncQuickSetup,
    isAuthenticated,
    isLoadingProfile,
    isSaving,
    errorMessage,
    successMessage,
    hasUnsavedChanges,
    setActiveMetric,
    setAutoSyncQuickSetup,
    updateDimensions,
    updateQuickSetup,
    applySmartEstimate,
    updateAppearance,
    saveProfile,
    clearFeedback,
  };
}
