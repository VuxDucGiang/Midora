"use client";

import React from "react";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function NavbarAuthControls({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { user, isAuthenticated, isLoading, openAuthModal, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-xs bg-[#EFE9E1]" />
    );
  }

  if (isAuthenticated && user) {
    if (mobile) {
      return (
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center gap-2.5 rounded-xs border border-[#E5DFD5] bg-[#FFFFFF] px-3 py-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#191817] text-[11px] font-mono font-semibold text-[#FAF7F2]">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#191817]">
                {user.fullName}
              </p>
              <p className="truncate font-mono text-[10px] text-[#8E8A85]">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              onNavigate?.();
            }}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-[#D3CBC0]/80 bg-white/80 px-4 text-xs font-medium text-[#191817] hover:bg-white cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-[#E5DFD5]/80 bg-white/75 px-3 h-9">
          <UserIcon className="h-3.5 w-3.5 text-[#A25B26]" />
          <span className="max-w-[140px] truncate text-xs font-medium text-[#191817]">
            {user.fullName}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Đăng xuất"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D3CBC0]/80 bg-white/75 px-3 text-xs font-medium text-[#57534E] transition-colors hover:border-[#191817] hover:bg-white hover:text-[#191817] cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Đăng xuất</span>
        </button>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="pt-2 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            openAuthModal("login");
          }}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-[#D3CBC0]/80 bg-white/80 px-4 text-xs font-medium text-[#191817] hover:bg-white cursor-pointer"
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            openAuthModal("register");
          }}
          className="inline-flex h-9 items-center justify-center rounded-xl bg-[#191817] px-4 text-xs font-medium text-[#FAF7F2] hover:bg-[#22384F] cursor-pointer"
        >
          Đăng ký
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openAuthModal("login")}
        className="whitespace-nowrap inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D3CBC0]/80 bg-white/75 px-4 text-xs font-medium tracking-wide text-[#191817] transition-colors hover:bg-white cursor-pointer"
      >
        <LogIn className="h-3.5 w-3.5" />
        Đăng nhập
      </button>
      <button
        type="button"
        onClick={() => openAuthModal("register")}
        className="whitespace-nowrap inline-flex h-9 items-center justify-center rounded-xl bg-[#191817] px-4 text-xs font-medium tracking-wide text-[#FAF7F2] transition-colors hover:bg-[#22384F] cursor-pointer"
      >
        Đăng ký
      </button>
    </div>
  );
}

