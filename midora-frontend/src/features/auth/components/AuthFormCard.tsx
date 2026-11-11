"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { ApiRequestError } from "@/lib/apiClient";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AuthModalMode } from "@/features/auth/context/AuthContext";
import type { AuthResponse } from "@/types/auth";

interface AuthFormCardProps {
  mode: AuthModalMode;
  onModeChange: (mode: AuthModalMode) => void;
  onSuccess?: (auth: AuthResponse) => void;
}

export default function AuthFormCard({
  mode,
  onModeChange,
  onSuccess,
}: AuthFormCardProps) {
  const { login, register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isRegister = mode === "register";

  const handleSwitchMode = (nextMode: AuthModalMode) => {
    setGeneralError(null);
    setFieldErrors({});
    onModeChange(nextMode);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = isRegister
        ? await register({
            email: email.trim(),
            password,
            fullName: fullName.trim(),
            phone: phone.trim() || undefined,
          })
        : await login({
            email: email.trim(),
            password,
          });

      onSuccess?.(response);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setGeneralError(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setGeneralError("Đã có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-xs border border-[#E5DFD5] bg-[#FFFFFF] p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#A25B26] font-semibold">
          MIDORA DIGITAL ATELIER
        </p>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-normal text-[#191817]">
          {isRegister ? "Tạo tài khoản cá nhân" : "Đăng nhập MIDORA"}
        </h2>
        <p className="mt-1.5 text-xs text-[#57534E] font-light">
          {isRegister
            ? "Lưu hồ sơ vóc dáng 3D và trải nghiệm thử đồ vintage theo số đo riêng."
            : "Truy cập Avatar 3D cá nhân hóa và phòng thử đồ ảo của bạn."}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="mt-6 grid grid-cols-2 rounded-xs border border-[#E5DFD5] bg-[#FAF7F2] p-1">
        <button
          type="button"
          onClick={() => handleSwitchMode("login")}
          className={`py-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
            !isRegister
              ? "bg-[#191817] text-[#FAF7F2] font-semibold"
              : "text-[#57534E] hover:text-[#191817]"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode("register")}
          className={`py-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
            isRegister
              ? "bg-[#191817] text-[#FAF7F2] font-semibold"
              : "text-[#57534E] hover:text-[#191817]"
          }`}
        >
          Đăng ký
        </button>
      </div>

      {/* Error Alert */}
      {generalError && (
        <div
          role="alert"
          className="mt-4 rounded-xs border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
        >
          {generalError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {isRegister && (
          <div>
            <label
              htmlFor="auth-fullname"
              className="block font-mono text-[11px] uppercase tracking-wider text-[#57534E] mb-1.5"
            >
              Họ và tên *
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8A85]" />
              <input
                id="auth-fullname"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                className="h-10 w-full rounded-xs border border-[#D3CBC0] bg-[#FAF7F2]/50 pl-9 pr-3.5 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#191817] focus:bg-[#FFFFFF] focus:outline-hidden transition-colors"
              />
            </div>
            {fieldErrors.fullName && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.fullName}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="block font-mono text-[11px] uppercase tracking-wider text-[#57534E] mb-1.5"
          >
            Email *
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8A85]" />
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-10 w-full rounded-xs border border-[#D3CBC0] bg-[#FAF7F2]/50 pl-9 pr-3.5 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#191817] focus:bg-[#FFFFFF] focus:outline-hidden transition-colors"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-[11px] text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block font-mono text-[11px] uppercase tracking-wider text-[#57534E] mb-1.5"
          >
            Mật khẩu *
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8A85]" />
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="h-10 w-full rounded-xs border border-[#D3CBC0] bg-[#FAF7F2]/50 pl-9 pr-10 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#191817] focus:bg-[#FFFFFF] focus:outline-hidden transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8E8A85] hover:text-[#191817] cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-[11px] text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {isRegister && (
          <div>
            <label
              htmlFor="auth-phone"
              className="block font-mono text-[11px] uppercase tracking-wider text-[#57534E] mb-1.5"
            >
              Số điện thoại (tùy chọn)
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8A85]" />
              <input
                id="auth-phone"
                type="tel"
                maxLength={20}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="h-10 w-full rounded-xs border border-[#D3CBC0] bg-[#FAF7F2]/50 pl-9 pr-3.5 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#191817] focus:bg-[#FFFFFF] focus:outline-hidden transition-colors"
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.phone}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xs bg-[#191817] px-6 font-mono text-xs font-medium uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#22384F] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isRegister ? "Tạo tài khoản & Bắt đầu" : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

