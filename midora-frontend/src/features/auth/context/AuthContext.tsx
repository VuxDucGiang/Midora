"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiRequestError } from "@/lib/apiClient";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  updateStoredUser,
} from "@/lib/authStorage";
import { authService } from "@/features/auth/services/authService";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "@/types/auth";

export type AuthModalMode = "login" | "register";

export interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  login: (payload: LoginRequest) => Promise<AuthResponse>;
  register: (payload: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<UserResponse | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function bootstrapSession() {
      const token = getStoredToken();
      if (!token) {
        await Promise.resolve();
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const cachedUser = getStoredUser();
      if (cachedUser && active) {
        setUser(cachedUser);
      }

      try {
        const freshUser = await authService.getMe(controller.signal);
        if (active) {
          updateStoredUser(freshUser);
          setUser(freshUser);
        }
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        if (
          err instanceof ApiRequestError &&
          (err.status === 401 || err.status === 403 || err.status === 404)
        ) {
          clearAuthSession();
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const openAuthModal = useCallback((mode: AuthModalMode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const auth = await authService.login(payload);
    saveAuthSession(auth.accessToken, auth.user);
    setUser(auth.user);
    setIsAuthModalOpen(false);
    return auth;
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const auth = await authService.register(payload);
    saveAuthSession(auth.accessToken, auth.user);
    setUser(auth.user);
    setIsAuthModalOpen(false);
    return auth;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const freshUser = await authService.getMe();
      updateStoredUser(freshUser);
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      if (
        err instanceof ApiRequestError &&
        (err.status === 401 || err.status === 403)
      ) {
        clearAuthSession();
        setUser(null);
      }
      return null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      setAuthModalMode,
      login,
      register,
      logout,
      refreshUser,
    }),
    [
      user,
      isLoading,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      login,
      register,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

