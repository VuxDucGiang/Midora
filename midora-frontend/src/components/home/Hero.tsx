"use client";

import React from "react";
import { ArrowRight, Sparkles, FileText, CheckCircle } from "lucide-react";
import TryOnMockupWidget from "./TryOnMockupWidget";
import { contestInfo } from "@/data/teamData";
import { proposalSummary } from "@/data/proposalData";

export default function Hero() {
  return (
    <section className="relative w-full bg-[#ffffff] pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#e5e7eb]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contest & Track Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f9fa] px-3.5 py-1 text-xs font-medium text-[#374151] border border-[#e5e7eb]">
              <Sparkles className="h-3.5 w-3.5 text-[#111111]" />
              <span className="font-semibold text-[#111111]">{contestInfo.season}</span>
              <span>•</span>
              <span>{contestInfo.name}</span>
            </div>

            {/* Display Headline (Cal Sans / Inter 600 with negative tracking) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold tracking-[-1.5px] text-[#111111] leading-[1.1]">
              SEE IT. TRY IT. LOVE IT. <br />
              <span className="text-[#374151] font-normal">
                Thời trang độc bản vừa vặn với vóc dáng của bạn.
              </span>
            </h1>

            {/* Sub-headline description extracted from Proposal */}
            <p className="text-base sm:text-lg leading-relaxed text-[#4b5563] max-w-2xl">
              {proposalSummary.shortDesc}
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#demo-tryon"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111111] px-6 text-sm font-semibold text-[#ffffff] shadow-xs transition-colors hover:bg-[#242424]"
              >
                Trải nghiệm Demo Thử đồ
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#de-an"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-5 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f8f9fa]"
              >
                <FileText className="h-4 w-4 text-[#6b7280]" />
                Xem Thuyết minh Đề án
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#6b7280]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10b981]" />
                <span>Số đo độc bản từng chiếc áo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10b981]" />
                <span>Avatar 3D cá nhân hóa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10b981]" />
                <span>Thúc đẩy thời trang bền vững</span>
              </div>
            </div>

            {/* Impact Metric Strip */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#e5e7eb]">
              {proposalSummary.impactStats.map((stat, i) => (
                <div key={i} className="rounded-lg bg-[#f5f5f5] p-3 border border-[#e5e7eb]/60">
                  <p className="text-lg font-bold text-[#111111] tracking-tight">{stat.value}</p>
                  <p className="text-xs font-semibold text-[#374151] mt-0.5">{stat.label}</p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-1">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 5 Cols - Product UI Mockup Fragment */}
          <div className="lg:col-span-5 flex justify-center">
            <TryOnMockupWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
