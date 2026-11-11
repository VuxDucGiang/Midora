import { apiClient } from "@/lib/apiClient";
import type {
  BodyProfileRequest,
  BodyProfileResponse,
} from "@/types/bodyProfile";

export const bodyProfileService = {
  getMyProfiles: (signal?: AbortSignal) =>
    apiClient.get<BodyProfileResponse[]>("/body-profiles", { signal }),

  getDefaultProfile: (signal?: AbortSignal) =>
    apiClient.get<BodyProfileResponse>("/body-profiles/default", { signal }),

  createProfile: (payload: BodyProfileRequest) =>
    apiClient.post<BodyProfileResponse>("/body-profiles", payload),

  updateProfile: (id: number, payload: BodyProfileRequest) =>
    apiClient.put<BodyProfileResponse>(`/body-profiles/${id}`, payload),

  setDefaultProfile: (id: number) =>
    apiClient.patch<BodyProfileResponse>(`/body-profiles/${id}/default`),

  deleteProfile: (id: number) =>
    apiClient.delete<void>(`/body-profiles/${id}`),
};

