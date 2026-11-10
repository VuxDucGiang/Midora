"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { proposalSummary } from "@/data/proposalData";

export default function InteractiveDemoSection() {
  return (
    <section id="demo-tryon" className="w-full bg-[#FAF7F2] py-20 sm:py-24 border-b border-[#E5DFD5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#191817] leading-tight">
              Cách MIDORA Hoạt Động
            </h2>
            <p className="mt-2 text-sm text-[#57534E] font-light">
              Quy trình 4 bước kết nối người mua với những món đồ thời trang độc bản phù hợp nhất.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {proposalSummary.howItWorks.map((step, idx) => (
            <Reveal key={step.step} delay={100 + idx * 120} direction="up" className="flex">
              <div className="editorial-card w-full rounded-xs border border-[#E5DFD5] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between hover:border-[#A25B26]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#A25B26]">
                    {step.step}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-[#191817]">
                    {step.subtitle}
                  </h3>
                  <p className="mt-2 text-xs text-[#57534E] leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5DFD5]/70">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8E8A85]">
                    {step.title}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
