"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  authSlot?: React.ReactNode;
  mobileAuthSlot?: React.ReactNode;
  overlay?: boolean;
}

export default function Navbar({
  authSlot,
  mobileAuthSlot,
  overlay = false,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Đề án", href: "/#de-an" },
    { label: "Avatar 3D", href: "/avatar" },
    { label: "Cách hoạt động", href: "/#demo-tryon" },
    { label: "Tầm nhìn", href: "/#tam-nhin" },
    { label: "Đội ngũ", href: "/#doi-ngu" },
  ];

  return (
    <header
      className={`${
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0"
      } z-50 w-full px-3 pt-2.5 pb-1.5 sm:px-6 pointer-events-none`}
    >
      <div className="pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl liquid-glass px-4 sm:px-6 transition-shadow duration-300">
        {/* Clean Brand Wordmark */}
        <Link href="/" className="shrink-0">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#191817] transition-opacity hover:opacity-80">
            MIDORA
          </span>
        </Link>

        {/* Balanced Single-Line Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
          {navItems.map((item) => {
            const isActive = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#A25B26] after:transition-all after:duration-200 ${
                  isActive
                    ? "text-[#191817] font-semibold after:w-full"
                    : "text-[#57534E] hover:text-[#191817] after:w-0 hover:after:w-full"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth / Action Controls */}
        <div className="hidden md:flex items-center shrink-0">
          {authSlot ?? (
            <Link
              href="/login"
              className="whitespace-nowrap inline-flex h-9 items-center justify-center rounded-xl bg-[#191817] px-5 text-xs font-medium tracking-wide text-[#FAF7F2] transition-colors hover:bg-[#22384F]"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-xl p-2 text-[#191817] hover:bg-white/50 transition-colors cursor-pointer"
          aria-label="Mở menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Liquid Glass Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-2xl liquid-glass px-5 py-4 md:hidden">
          <div className="flex flex-col space-y-2.5 text-base text-[#191817]">
            {navItems.map((item) => {
              const isActive = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-1.5 border-b border-[#191817]/10 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#A25B26] font-semibold"
                      : "hover:text-[#A25B26]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {mobileAuthSlot ?? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-[#191817] px-4 text-xs font-medium text-[#FAF7F2]"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
