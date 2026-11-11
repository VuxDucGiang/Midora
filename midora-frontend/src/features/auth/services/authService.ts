import { apiClient } from "@/lib/apiClient";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "@/types/auth";

export const authService = {
  login: (payload: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", payload, { withAuth: false }),

  register: (payload: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", payload, {
      withAuth: false,
    }),

  getMe: (signal?: AbortSignal) =>
    apiClient.get<UserResponse>("/auth/me", { withAuth: true, signal }),
};

