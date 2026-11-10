"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { proposalSummary } from "@/data/proposalData";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAF7F2] py-20 sm:py-28 border-b border-[#E5DFD5]">
      <div className="absolute inset-0 vintage-stitch opacity-35 pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-mono text-xs tracking-[0.22em] text-[#A25B26] font-semibold">
          SEE IT. TRY IT. LOVE IT.
        </p>

        <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#191817] leading-[1.15]">
          Mỗi món đồ vintage là một câu chuyện độc bản.{" "}
          <span className="italic text-[#57534E] block sm:inline">
            Hãy để nó vừa vặn với bạn.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#57534E] max-w-2xl mx-auto font-light leading-relaxed">
          MIDORA là nền tảng thử đồ ảo 3D cá nhân hóa cho thời trang secondhand và vintage, kết hợp số đo cơ thể thực tế để xóa bỏ rào cản mua sắm trực tuyến.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href="#de-an"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xs bg-[#191817] px-6 text-xs font-medium tracking-wider uppercase text-[#FAF7F2] transition-all hover:bg-[#2C3E55]"
          >
            Tìm hiểu Đề án
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#doi-ngu"
            className="inline-flex h-11 items-center justify-center rounded-xs border border-[#D3CBC0] bg-[#FFFFFF] px-6 text-xs font-medium tracking-wider uppercase text-[#191817] transition-all hover:bg-[#F4EFEA]"
          >
            Đội ngũ thực hiện
          </a>
        </div>

        {/* Key Highlights */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#E5DFD5]">
          {proposalSummary.impactStats.map((stat, i) => (
            <div key={i} className="text-center py-2">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#191817]">
                {stat.value}
              </p>
              <p className="text-xs text-[#57534E] mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
