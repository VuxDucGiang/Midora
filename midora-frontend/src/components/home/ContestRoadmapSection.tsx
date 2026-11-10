"use client";

import React from "react";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { proposalSummary } from "@/data/proposalData";

export default function ContestRoadmapSection() {
  return (
    <section id="lo-trinh" className="w-full bg-[#ffffff] py-24 border-b border-[#e5e7eb]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center rounded-full bg-[#f8f9fa] px-3.5 py-1 text-xs font-semibold text-[#6b7280] border border-[#e5e7eb]">
            Phần 3: Kế Hoạch & Hành Trình Cuộc Thi
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-1px] text-[#111111]">
            Lộ trình phát triển đề án qua các vòng thi
          </h2>
          <p className="text-base text-[#4b5563]">
            Từ ý tưởng giải quyết nỗi đau thử đồ secondhand đến kế hoạch thương mại hóa nền tảng B2B2C tại Việt Nam.
          </p>
        </div>

        {/* Timeline Grid (4 Stages) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {proposalSummary.roadmap.map((m) => {
            const isCompleted = m.status === "completed";
            const isCurrent = m.status === "current";

            return (
              <div
                key={m.stage}
                className={`relative flex flex-col justify-between rounded-xl p-6 border transition-all ${
                  isCurrent
                    ? "bg-[#111111] text-[#ffffff] border-[#111111] shadow-md ring-2 ring-[#111111]/10"
                    : "bg-[#f5f5f5] text-[#111111] border-[#e5e7eb]"
                }`}
              >
                {/* Top Badge */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-current/15">
                    <span
                      className={`text-xs font-mono font-bold tracking-wider uppercase ${
                        isCurrent ? "text-[#34d399]" : "text-[#6b7280]"
                      }`}
                    >
                      {m.stage}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isCompleted
                          ? "bg-[#10b981]/15 text-[#10b981]"
                          : isCurrent
                          ? "bg-[#ffffff]/15 text-[#ffffff] border border-[#ffffff]/20 animate-pulse"
                          : "bg-[#e5e7eb] text-[#6b7280]"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Đã xong
                        </>
                      ) : isCurrent ? (
                        <>
                          <Sparkles className="h-3 w-3 text-[#34d399]" /> Đang thực hiện
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" /> Sắp tới
                        </>
                      )}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-semibold tracking-tight mt-4 ${
                      isCurrent ? "text-[#ffffff]" : "text-[#111111]"
                    }`}
                  >
                    {m.title}
                  </h3>
                  <p
                    className={`text-xs mt-1 font-medium ${
                      isCurrent ? "text-[#a1a1aa]" : "text-[#6b7280]"
                    }`}
                  >
                    {m.timeframe}
                  </p>

                  <p
                    className={`text-xs leading-relaxed mt-3 ${
                      isCurrent ? "text-[#d4d4d8]" : "text-[#4b5563]"
                    }`}
                  >
                    {m.description}
                  </p>
                </div>

                {/* Deliverables */}
                <div className="pt-4 mt-6 border-t border-current/15">
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                      isCurrent ? "text-[#a1a1aa]" : "text-[#6b7280]"
                    }`}
                  >
                    Đầu ra bàn giao:
                  </p>
                  <ul className="space-y-1.5 text-xs">
                    {m.deliverables.map((del, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isCurrent ? "bg-[#34d399]" : "bg-[#111111]"
                          }`}
                        />
                        <span className={isCurrent ? "text-[#ffffff]" : "text-[#374151]"}>
                          {del}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
