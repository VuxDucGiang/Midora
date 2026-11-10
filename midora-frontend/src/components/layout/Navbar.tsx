"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Đề án", href: "#de-an" },
    { label: "Cách hoạt động", href: "#demo-tryon" },
    { label: "Lộ trình", href: "#lo-trinh" },
    { label: "Đội ngũ", href: "#doi-ngu" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5DFD5] bg-[#FAF7F2]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Clean Brand Wordmark */}
        <Link href="/" className="shrink-0">
          <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#191817] transition-opacity hover:opacity-80">
            MIDORA
          </span>
        </Link>

        {/* Balanced Single-Line Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#57534E]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap py-1 text-[#57534E] hover:text-[#191817] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-[#191817] hover:after:w-full after:transition-all after:duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Single Clean CTA */}
        <div className="hidden md:flex items-center shrink-0">
          <a
            href="#doi-ngu"
            className="whitespace-nowrap inline-flex h-9 items-center justify-center rounded-xs bg-[#191817] px-5 text-xs font-medium tracking-wide text-[#FAF7F2] transition-colors hover:bg-[#2C3E55]"
          >
            Thành viên Đội thi
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-xs p-2 text-[#191817] hover:bg-[#F4EFEA]"
          aria-label="Mở menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E5DFD5] bg-[#FAF7F2] px-6 py-5 md:hidden">
          <div className="flex flex-col space-y-3 text-base text-[#191817]">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 border-b border-[#E5DFD5]/60 font-medium hover:text-[#A25B26]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
