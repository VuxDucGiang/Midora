"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { proposalSummary } from "@/data/proposalData";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAF7F2] py-20 sm:py-28 border-b border-[#E5DFD5]">
      {/* Subtle Grid & Artistic Floating Ambient Halos */}
      <div className="absolute inset-0 vintage-stitch opacity-35 pointer-events-none" />
      <div className="ambient-aura-warm pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#A25B26]/10 blur-3xl" />
      <div className="ambient-aura-indigo pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-[#22384F]/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <Reveal delay={50} direction="down">
          <p className="font-mono text-xs tracking-[0.22em] text-[#A25B26] font-semibold">
            SEE IT. TRY IT. LOVE IT.
          </p>
        </Reveal>

        <Reveal delay={150} direction="up">
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#191817] leading-[1.15]">
            Mỗi món đồ vintage là một câu chuyện độc bản.{" "}
            <span className="italic text-[#57534E] block sm:inline">
              Hãy để nó vừa vặn với bạn.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={260} direction="up">
          <p className="mt-6 text-base sm:text-lg text-[#57534E] max-w-2xl mx-auto font-light leading-relaxed">
            MIDORA là nền tảng thử đồ ảo 3D cá nhân hóa cho thời trang secondhand và vintage, kết hợp số đo cơ thể thực tế để xóa bỏ rào cản mua sắm trực tuyến.
          </p>
        </Reveal>

        <Reveal delay={360} direction="up">
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/avatar"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xs bg-[#191817] px-6 text-xs font-medium tracking-wider uppercase text-[#FAF7F2] transition-all duration-300 hover:bg-[#22384F] hover:-translate-y-0.5"
            >
              Tạo Avatar 3D
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="#de-an"
              className="inline-flex h-11 items-center justify-center rounded-xs border border-[#D3CBC0] bg-[#FFFFFF] px-6 text-xs font-medium tracking-wider uppercase text-[#191817] transition-all duration-300 hover:bg-[#F4EFEA] hover:-translate-y-0.5"
            >
              Tìm hiểu Đề án
            </a>
            <a
              href="#doi-ngu"
              className="inline-flex h-11 items-center justify-center rounded-xs border border-[#D3CBC0] bg-[#FFFFFF] px-6 text-xs font-medium tracking-wider uppercase text-[#191817] transition-all duration-300 hover:bg-[#F4EFEA] hover:-translate-y-0.5"
            >
              Đội ngũ thực hiện
            </a>
          </div>
        </Reveal>

        {/* Key Highlights with Staggered Fade-in/Fade-out */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#E5DFD5]">
          {proposalSummary.impactStats.map((stat, i) => (
            <Reveal key={i} delay={420 + i * 100} direction="scale">
              <div className="text-center py-2">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#191817]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#57534E] mt-1 font-medium">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
