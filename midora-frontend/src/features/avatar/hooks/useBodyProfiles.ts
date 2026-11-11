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
  BodyShapePreset,
  GenderStyle,
} from "@/types/bodyProfile";

function toDraft(profile: BodyProfileResponse): AvatarDraft {
  return {
    id: profile.id,
    profileName: profile.profileName,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    chestCm: profile.chestCm,
    waistCm: profile.waistCm,
    hipsCm: profile.hipsCm,
    shoulderWidthCm: profile.shoulderWidthCm,
    avatarCustomizationParams: { ...profile.avatarCustomizationParams },
    isDefault: profile.isDefault,
  };
}

function toRequestPayload(draft: AvatarDraft): BodyProfileRequest {
  return {
    profileName: draft.profileName.trim() || "Dáng chuẩn của tôi",
    heightCm: draft.heightCm,
    weightKg: draft.weightKg,
    chestCm: draft.chestCm,
    waistCm: draft.waistCm,
    hipsCm: draft.hipsCm,
    shoulderWidthCm: draft.shoulderWidthCm,
    avatarCustomizationParams: draft.avatarCustomizationParams,
    isDefault: draft.isDefault,
  };
}

export function useBodyProfiles() {
  const { isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();

  const [profiles, setProfiles] = useState<BodyProfileResponse[]>([]);
  const [activeDraft, setActiveDraft] = useState<AvatarDraft>(() =>
    createDefaultAvatarDraft("female")
  );
  const [activeMetric, setActiveMetric] = useState<ActiveBodyMetric>(null);
  const [autoSyncQuickSetup, setAutoSyncQuickSetup] = useState(true);

  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        setProfiles([]);
        setActiveDraft((prev) => (prev.id ? { ...prev, id: undefined } : prev));
        setIsLoadingProfiles(false);
        return;
      }

      setIsLoadingProfiles(true);
      setErrorMessage(null);

      try {
        if (pendingSaveAfterAuthRef.current) {
          pendingSaveAfterAuthRef.current = false;
          const draftToSave = activeDraftRef.current;
          const saved = await bodyProfileService.createProfile(
            toRequestPayload(draftToSave)
          );
          if (!mounted) return;
          const refreshed = await bodyProfileService.getMyProfiles(controller.signal);
          if (!mounted) return;
          setProfiles(refreshed);
          setActiveDraft(toDraft(saved));
          setSuccessMessage(
            `Đã đăng nhập và lưu hồ sơ "${saved.profileName}" thành công.`
          );
          return;
        }

        const list = await bodyProfileService.getMyProfiles(controller.signal);
        if (!mounted) return;
        setProfiles(list);
        if (list.length > 0) {
          const preferred = list.find((item) => item.isDefault) ?? list[0];
          setActiveDraft(toDraft(preferred));
        }
      } catch (err) {
        if (!mounted || controller.signal.aborted) return;
        if (err instanceof ApiRequestError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Không thể tải danh sách hồ sơ số đo của bạn.");
        }
      } finally {
        if (mounted) {
          setIsLoadingProfiles(false);
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
    setFieldErrors({});
  }, []);

  const selectProfile = useCallback(
    (id: number) => {
      const found = profiles.find((item) => item.id === id);
      if (!found) return;
      clearFeedback();
      setActiveDraft(toDraft(found));
    },
    [profiles, clearFeedback]
  );

  const startNewDraft = useCallback(
    (genderStyle?: GenderStyle) => {
      clearFeedback();
      const targetGender =
        genderStyle ?? activeDraftRef.current.avatarCustomizationParams.genderStyle;
      const fresh = createDefaultAvatarDraft(targetGender);
      fresh.profileName =
        profiles.length > 0 ? `Dáng số ${profiles.length + 1}` : "Dáng chuẩn của tôi";
      fresh.isDefault = profiles.length === 0;
      setActiveDraft(fresh);
    },
    [profiles.length, clearFeedback]
  );

  const updateDimensions = useCallback(
    (
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
    ) => {
      setSuccessMessage(null);
      setErrorMessage(null);
      setFieldErrors({});
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
      bodyShape?: BodyShapePreset;
      heightCm?: number;
      weightKg?: number;
    }) => {
      setSuccessMessage(null);
      setErrorMessage(null);
      setFieldErrors({});
      setActiveDraft((prev) => {
        const nextGender =
          patch.genderStyle ?? prev.avatarCustomizationParams.genderStyle;
        const nextShape =
          patch.bodyShape ?? prev.avatarCustomizationParams.bodyShape;
        const nextHeight = patch.heightCm ?? prev.heightCm;
        const nextWeight = patch.weightKg ?? prev.weightKg;

        const nextHair =
          patch.genderStyle && patch.genderStyle !== prev.avatarCustomizationParams.genderStyle
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
        bodyShape: prev.avatarCustomizationParams.bodyShape,
        heightCm: prev.heightCm,
        weightKg: prev.weightKg,
      });
      return {
        ...prev,
        ...estimated,
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
    if (!current.profileName.trim()) {
      setFieldErrors({ profileName: "Vui lòng đặt tên cho hồ sơ Avatar." });
      setErrorMessage("Vui lòng nhập tên hồ sơ trước khi lưu.");
      return null;
    }

    setIsSaving(true);
    try {
      const payload = toRequestPayload(current);
      const saved = current.id
        ? await bodyProfileService.updateProfile(current.id, payload)
        : await bodyProfileService.createProfile(payload);

      const refreshed = await bodyProfileService.getMyProfiles();
      setProfiles(refreshed);
      setActiveDraft(toDraft(saved));
      setSuccessMessage(
        current.id
          ? `Đã cập nhật hồ sơ "${saved.profileName}".`
          : `Đã lưu hồ sơ mới "${saved.profileName}".`
      );
      return saved;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorMessage("Không thể lưu hồ sơ Avatar, vui lòng thử lại.");
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, openAuthModal, clearFeedback]);

  const setAsDefault = useCallback(
    async (id: number) => {
      clearFeedback();
      try {
        const updated = await bodyProfileService.setDefaultProfile(id);
        const refreshed = await bodyProfileService.getMyProfiles();
        setProfiles(refreshed);
        if (activeDraftRef.current.id === id) {
          setActiveDraft(toDraft(updated));
        }
        setSuccessMessage(`Đã đặt "${updated.profileName}" làm dáng mặc định.`);
      } catch (err) {
        setErrorMessage(
          err instanceof ApiRequestError
            ? err.message
            : "Không thể đặt làm hồ sơ mặc định."
        );
      }
    },
    [clearFeedback]
  );

  const deleteProfile = useCallback(
    async (id: number) => {
      clearFeedback();
      setIsDeleting(true);
      try {
        await bodyProfileService.deleteProfile(id);
        const refreshed = await bodyProfileService.getMyProfiles();
        setProfiles(refreshed);
        if (refreshed.length > 0) {
          const preferred = refreshed.find((p) => p.isDefault) ?? refreshed[0];
          setActiveDraft(toDraft(preferred));
        } else {
          setActiveDraft(createDefaultAvatarDraft("female"));
        }
        setSuccessMessage("Đã xóa hồ sơ số đo.");
      } catch (err) {
        setErrorMessage(
          err instanceof ApiRequestError ? err.message : "Không thể xóa hồ sơ."
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [clearFeedback]
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!activeDraft.id) return true;
    const saved = profiles.find((p) => p.id === activeDraft.id);
    if (!saved) return true;
    return (
      saved.profileName !== activeDraft.profileName.trim() ||
      saved.heightCm !== activeDraft.heightCm ||
      saved.weightKg !== activeDraft.weightKg ||
      saved.chestCm !== activeDraft.chestCm ||
      saved.waistCm !== activeDraft.waistCm ||
      saved.hipsCm !== activeDraft.hipsCm ||
      saved.shoulderWidthCm !== activeDraft.shoulderWidthCm ||
      saved.isDefault !== activeDraft.isDefault ||
      saved.avatarCustomizationParams.genderStyle !==
        activeDraft.avatarCustomizationParams.genderStyle ||
      saved.avatarCustomizationParams.bodyShape !==
        activeDraft.avatarCustomizationParams.bodyShape ||
      saved.avatarCustomizationParams.skinTone !==
        activeDraft.avatarCustomizationParams.skinTone ||
      saved.avatarCustomizationParams.hairStyle !==
        activeDraft.avatarCustomizationParams.hairStyle
    );
  }, [activeDraft, profiles]);

  return {
    profiles,
    activeDraft,
    activeMetric,
    autoSyncQuickSetup,
    isAuthenticated,
    isLoadingProfiles,
    isSaving,
    isDeleting,
    errorMessage,
    fieldErrors,
    successMessage,
    hasUnsavedChanges,
    setActiveMetric,
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
    clearFeedback,
  };
}

