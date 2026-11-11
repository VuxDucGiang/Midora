import React from "react";
import Link from "next/link";
import { contestInfo } from "@/data/teamData";

export default function Footer() {
  return (
    <footer className="w-full bg-[#141416] text-[#A1A1AA] py-12 border-t border-[#242426]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#242426]">
          <div>
            <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#FAF7F2]">
              MIDORA
            </span>
            <p className="mt-1.5 text-xs text-[#8E8A85] font-light">
              Making every unique piece find its perfect fit — Khám phá thời trang độc bản theo cách của riêng bạn.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-medium text-[#A1A1AA]">
            <Link href="/#de-an" className="hover:text-[#FAF7F2] transition-colors">
              Đề án
            </Link>
            <Link href="/avatar" className="hover:text-[#FAF7F2] transition-colors">
              Avatar 3D
            </Link>
            <Link href="/#demo-tryon" className="hover:text-[#FAF7F2] transition-colors">
              Cách hoạt động
            </Link>
            <Link href="/#tam-nhin" className="hover:text-[#FAF7F2] transition-colors">
              Tầm nhìn
            </Link>
            <Link href="/#doi-ngu" className="hover:text-[#FAF7F2] transition-colors">
              Đội ngũ
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] gap-3">
          <p>© 2026 MIDORA Team. {contestInfo.name}.</p>
          <p className="font-mono text-[11px]">Mã dự án: {contestInfo.projectCode}</p>
        </div>
      </div>
    </footer>
  );
}
