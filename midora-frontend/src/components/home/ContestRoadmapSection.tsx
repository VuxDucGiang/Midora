"use client";

import React from "react";
import { proposalSummary } from "@/data/proposalData";

export default function ContestRoadmapSection() {
  return (
    <section id="lo-trinh" className="w-full bg-[#FFFFFF] py-20 sm:py-24 border-b border-[#E5DFD5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#191817] leading-tight">
            Định Hướng & Lộ Trình Phát Triển
          </h2>
          <p className="mt-2 text-sm text-[#57534E] font-light">
            Từng bước hoàn thiện sản phẩm thử nghiệm và mở rộng mạng lưới đối tác cửa hàng secondhand tại Việt Nam.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {proposalSummary.roadmap.map((m) => {
            const isCompleted = m.status === "completed";
            const isCurrent = m.status === "current";

            return (
              <div
                key={m.stage}
                className={`flex flex-col justify-between rounded-xs p-5 border ${
                  isCurrent
                    ? "border-[#191817] bg-[#1E2E40] text-[#FAF7F2]"
                    : "border-[#E5DFD5] bg-[#FAF7F2] text-[#191817]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-current/15">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isCurrent ? "text-[#34D399]" : "text-[#A25B26]"
                      }`}
                    >
                      {m.stage}
                    </span>
                    <span
                      className={`rounded-xs px-2 py-0.5 font-mono text-[10px] font-medium ${
                        isCompleted
                          ? "bg-[#2C523F]/15 text-[#2C523F]"
                          : isCurrent
                          ? "bg-[#FFFFFF]/20 text-[#FFFFFF]"
                          : "bg-[#E5DFD5] text-[#57534E]"
                      }`}
                    >
                      {isCompleted ? "Hoàn thành" : isCurrent ? "Hiện tại" : "Sắp tới"}
                    </span>
                  </div>

                  <h3
                    className={`font-serif text-base font-bold mt-3.5 leading-snug ${
                      isCurrent ? "text-[#FFFFFF]" : "text-[#191817]"
                    }`}
                  >
                    {m.title}
                  </h3>
                  <p
                    className={`text-xs mt-2 font-light leading-relaxed ${
                      isCurrent ? "text-[#D3CBC0]" : "text-[#57534E]"
                    }`}
                  >
                    {m.description}
                  </p>
                </div>

                <p
                  className={`mt-4 pt-3 border-t border-current/15 font-mono text-[11px] ${
                    isCurrent ? "text-[#A1A1AA]" : "text-[#8E8A85]"
                  }`}
                >
                  {m.timeframe}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
