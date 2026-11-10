"use client";

import React, { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { proposalSummary } from "@/data/proposalData";

const sampleVintageItems = [
  {
    id: "item-1",
    name: "1994 Levi's Type III Denim Jacket",
    shop: "The Vintage Vault Sài Gòn",
    price: "850.000 ₫",
    chest: 102,
    shoulder: 46,
    length: 68,
    condition: "Độ mới 95%",
    tag: "Độc bản 1 chiếc",
    category: "Áo khoác",
  },
  {
    id: "item-2",
    name: "1988 Vintage Wool Blazer",
    shop: "Retro Hanoi Thrift",
    price: "920.000 ₫",
    chest: 106,
    shoulder: 47,
    length: 73,
    condition: "Độ mới 92%",
    tag: "Độc bản 1 chiếc",
    category: "Áo Blazer",
  },
  {
    id: "item-3",
    name: "90s Heavyweight Flannel Shirt",
    shop: "Oldies But Goldies",
    price: "450.000 ₫",
    chest: 110,
    shoulder: 49,
    length: 76,
    condition: "Độ mới 90%",
    tag: "Độc bản 1 chiếc",
    category: "Sơ mi Vintage",
  },
];

export default function InteractiveDemoSection() {
  const [selectedItem, setSelectedItem] = useState(sampleVintageItems[0]);
  const [userChest, setUserChest] = useState(96);
  const [userHeight, setUserHeight] = useState(172);

  const diff = selectedItem.chest - userChest;
  const isFit = diff >= 4 && diff <= 12;
  const fitScore = isFit ? 96 : diff < 4 ? 65 : 82;

  return (
    <section id="demo-tryon" className="w-full bg-[#f8f9fa] py-24 border-b border-[#e5e7eb]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center rounded-full bg-[#ffffff] px-3.5 py-1 text-xs font-semibold text-[#111111] border border-[#e5e7eb] shadow-xs">
            Phần 2: Công Nghệ & Trải Nghiệm Sản Phẩm
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-1px] text-[#111111]">
            Quy trình Thử đồ ảo 3D & So khớp số đo Centimet
          </h2>
          <p className="text-base text-[#4b5563]">
            Cách MIDORA kết nối vóc dáng của bạn với các món đồ độc bản để mang đến sự tự tin tuyệt đối.
          </p>
        </div>

        {/* 4 Steps Grid (from Proposal.docx) */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {proposalSummary.howItWorks.map((step) => (
            <div
              key={step.step}
              className="flex flex-col justify-between rounded-xl bg-[#ffffff] p-6 border border-[#e5e7eb] shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold tracking-tighter text-[#111111]">
                    {step.step}
                  </span>
                  <span className="rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-medium text-[#374151]">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#111111]">
                  {step.title}
                </h3>
                <p className="text-xs font-medium text-[#6b7280]">
                  {step.subtitle}
                </p>
                <p className="text-xs text-[#4b5563] leading-relaxed pt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Interactive Studio Showcase */}
        <div className="mt-16 rounded-2xl border border-[#e5e7eb] bg-[#ffffff] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#e5e7eb]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Phòng thử đồ trực tuyến MIDORA
              </span>
              <h3 className="text-xl font-semibold tracking-tight text-[#111111] mt-0.5">
                Chọn món đồ vintage để thử trực tiếp lên Avatar mẫu
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280]">Số đo ngực cơ thể bạn:</span>
              <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-1">
                <input
                  type="number"
                  value={userChest}
                  onChange={(e) => setUserChest(Number(e.target.value))}
                  className="w-12 bg-transparent text-sm font-semibold text-[#111111] focus:outline-hidden"
                />
                <span className="text-xs text-[#6b7280]">cm</span>
              </div>
            </div>
          </div>

          {/* Garment Selector & Live Comparison */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left list of items (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                Danh sách đồ Vintage độc bản trong kho:
              </p>
              {sampleVintageItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                    selectedItem.id === item.id
                      ? "border-[#111111] bg-[#f5f5f5] shadow-xs"
                      : "border-[#e5e7eb] bg-[#ffffff] hover:border-[#d1d5db]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#6b7280]">{item.shop}</p>
                      <h4 className="text-sm font-semibold text-[#111111] mt-0.5">{item.name}</h4>
                    </div>
                    <span className="text-sm font-bold text-[#111111]">{item.price}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#4b5563] pt-2 border-t border-[#e5e7eb]">
                    <span>Ngực: {item.chest}cm • Vai: {item.shoulder}cm</span>
                    <span className="text-[11px] font-semibold text-[#10b981]">{item.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right comparison detail (7 cols) */}
            <div className="lg:col-span-7 rounded-xl bg-[#f8f9fa] p-5 sm:p-6 border border-[#e5e7eb] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-1 text-xs font-semibold text-[#ffffff]">
                    <Sparkles className="h-3 w-3 text-[#34d399]" />
                    Kết quả so khớp tự động
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold tracking-tight text-[#111111]">
                      {fitScore}%
                    </span>
                    <span className="text-xs text-[#6b7280] block">Điểm phù hợp vóc dáng</span>
                  </div>
                </div>

                {/* Sizing Breakdown Table */}
                <div className="rounded-lg bg-[#ffffff] border border-[#e5e7eb] overflow-hidden">
                  <div className="grid grid-cols-4 bg-[#f5f5f5] px-3 py-2 text-[11px] font-semibold text-[#374151] border-b border-[#e5e7eb]">
                    <span>Vùng đo</span>
                    <span>Số đo áo</span>
                    <span>Cơ thể bạn</span>
                    <span>Độ chênh lệch</span>
                  </div>
                  <div className="divide-y divide-[#e5e7eb] text-xs">
                    <div className="grid grid-cols-4 px-3 py-2.5 items-center">
                      <span className="font-medium text-[#111111]">Vòng ngực</span>
                      <span>{selectedItem.chest} cm</span>
                      <span>{userChest} cm</span>
                      <span className="font-semibold text-[#059669]">
                        +{selectedItem.chest - userChest} cm (Vừa vặn)
                      </span>
                    </div>
                    <div className="grid grid-cols-4 px-3 py-2.5 items-center">
                      <span className="font-medium text-[#111111]">Rộng vai</span>
                      <span>{selectedItem.shoulder} cm</span>
                      <span>44 cm</span>
                      <span className="font-semibold text-[#059669]">+2 cm (Form chuẩn)</span>
                    </div>
                    <div className="grid grid-cols-4 px-3 py-2.5 items-center">
                      <span className="font-medium text-[#111111]">Chiều dài áo</span>
                      <span>{selectedItem.length} cm</span>
                      <span>172 cm (Cao)</span>
                      <span className="text-[#6b7280]">Ngang thắt lưng</span>
                    </div>
                  </div>
                </div>

                {/* Recommendation note */}
                <div className="rounded-lg bg-[#eff6ff] p-3 text-xs text-[#1e40af] border border-[#bfdbfe]/50 flex items-start gap-2">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-[#2563eb]" />
                  <span>
                    <strong>Khuyến nghị từ MIDORA Engine:</strong> Mẫu <strong>{selectedItem.name}</strong> có độ cử động (ease allowance) là +{diff}cm ở vòng ngực. Form áo sẽ rơi nhẹ nhàng, rất phù hợp với phong cách vintage cổ điển.
                  </span>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="pt-4 mt-4 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#6b7280]">
                <span>* Dữ liệu mô phỏng theo số đo thực tế đo đạc từ sản phẩm thật</span>
                <span className="font-medium text-[#111111]">Hệ thống bảo vệ độc bản 1-SKU</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
