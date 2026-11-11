"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import AuthFormCard from "@/features/auth/components/AuthFormCard";
import type { AuthModalMode } from "@/features/auth/context/AuthContext";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LoginView() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mode, setMode] = useState<AuthModalMode>("login");

  if (isAuthenticated && user) {
    return (
      <div className="w-full max-w-md mx-auto rounded-xs border border-[#E5DFD5] bg-[#FFFFFF] p-8 text-center shadow-sm space-y-4">
        <CheckCircle2 className="h-9 w-9 text-[#2C523F] mx-auto" />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A25B26] font-semibold">
            ĐÃ ĐĂNG NHẬP
          </p>
          <h1 className="mt-1.5 font-serif text-2xl font-normal text-[#191817]">
            Xin chào, {user.fullName}
          </h1>
          <p className="mt-1 text-xs text-[#57534E] font-light">{user.email}</p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xs bg-[#191817] px-5 font-mono text-xs uppercase tracking-wider text-[#FAF7F2] hover:bg-[#22384F] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Về trang chủ
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center justify-center rounded-xs border border-[#D3CBC0] bg-[#FFFFFF] px-5 font-mono text-xs uppercase tracking-wider text-[#191817] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-[#57534E] hover:text-[#191817] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Quay lại trang chủ
      </Link>
      <AuthFormCard
        mode={mode}
        onModeChange={setMode}
        onSuccess={() => router.push("/")}
      />
    </div>
  );
}

