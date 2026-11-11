"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import AuthFormCard from "@/features/auth/components/AuthFormCard";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
  } = useAuth();

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAuthModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#141416]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Xác thực tài khoản MIDORA"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Đóng cửa sổ"
          className="absolute right-3 top-3 z-10 rounded-xs p-1.5 text-[#8E8A85] hover:bg-[#FAF7F2] hover:text-[#191817] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <AuthFormCard
          mode={authModalMode}
          onModeChange={setAuthModalMode}
          onSuccess={closeAuthModal}
        />
      </div>
    </div>
  );
}

