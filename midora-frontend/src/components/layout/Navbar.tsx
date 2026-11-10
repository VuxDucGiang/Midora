"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowUpRight } from "lucide-react";
import { contestInfo } from "@/data/teamData";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Đề án MIDORA", href: "#de-an" },
    { label: "Giải pháp 3D", href: "#giai-phap" },
    { label: "Demo Thử đồ", href: "#demo-tryon" },
    { label: "Lộ trình", href: "#lo-trinh" },
    { label: "Đội thi", href: "#doi-ngu" },
    { label: "Tài liệu", href: "#tai-lieu" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-[#ffffff]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark & Contest Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-xl tracking-[-1px] text-[#111111] group-hover:opacity-85 transition-opacity">
              MIDORA
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-xs font-medium text-[#374151] border border-[#e5e7eb]">
            <Sparkles className="h-3 w-3 text-[#111111]" />
            {contestInfo.projectCode}
          </span>
        </div>

        {/* Center Nav-Pill-Group (Cal.com signature component) */}
        <nav className="hidden md:flex items-center rounded-full bg-[#f8f9fa] p-1 border border-[#e5e7eb]/60">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 text-xs font-medium text-[#6b7280] hover:text-[#111111] hover:bg-[#ffffff] rounded-full transition-all duration-150"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Cluster */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="#tai-lieu"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#f8f9fa]"
          >
            Tài liệu Đề án
          </a>
          <a
            href="#doi-ngu"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#111111] px-4 text-xs font-semibold text-[#ffffff] transition-colors hover:bg-[#242424]"
          >
            Đội ngũ
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-[#374151] hover:bg-[#f5f5f5] hover:text-[#111111]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#e5e7eb] bg-[#ffffff] px-4 pt-2 pb-6 sm:hidden">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#f5f5f5] hover:text-[#111111]"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <a
                href="#tai-lieu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 items-center justify-center rounded-md border border-[#e5e7eb] text-sm font-semibold text-[#111111]"
              >
                Xem Bản Đề Án
              </a>
              <a
                href="#doi-ngu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 items-center justify-center rounded-md bg-[#111111] text-sm font-semibold text-[#ffffff]"
              >
                Gặp Đội ngũ MIDORA
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
