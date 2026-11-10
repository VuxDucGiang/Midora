"use client";

import React from "react";
import { EyeOff, Ruler, HelpCircle, Users, Store, Leaf } from "lucide-react";
import { proposalSummary } from "@/data/proposalData";

export default function ProposalSection() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "EyeOff":
        return <EyeOff className="h-6 w-6 text-[#111111]" />;
      case "Ruler":
        return <Ruler className="h-6 w-6 text-[#111111]" />;
      case "HelpCircle":
        return <HelpCircle className="h-6 w-6 text-[#111111]" />;
      default:
        return <Ruler className="h-6 w-6 text-[#111111]" />;
    }
  };

  return (
    <section id="de-an" className="w-full bg-[#ffffff] py-24 border-b border-[#e5e7eb]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center rounded-full bg-[#f8f9fa] px-3 py-1 text-xs font-semibold text-[#6b7280] border border-[#e5e7eb]">
            Phần 1: Thực Trạng & Đề Án MIDORA
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-1px] text-[#111111]">
            Vấn đề chúng tôi muốn giải quyết trong thời trang Secondhand
          </h2>
          <p className="text-base text-[#4b5563] leading-relaxed">
            Mua sắm quần áo secondhand trực tuyến mang đến cơ hội sở hữu những món đồ độc đáo với chi phí hợp lý. 
            Tuy nhiên, người mua thường xuyên đối mặt với sự thiếu chắc chắn dẫn đến rào cản ra quyết định.
          </p>
        </div>

        {/* 3 Pain Points (Feature Cards on #f5f5f5 surface-card with 12px border radius) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {proposalSummary.painPoints.map((pain) => (
            <div
              key={pain.id}
              className="flex flex-col justify-between rounded-xl bg-[#f5f5f5] p-8 border border-[#e5e7eb] transition-all duration-200 hover:border-[#d1d5db]"
            >
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#ffffff] border border-[#e5e7eb] shadow-xs">
                  {getIcon(pain.iconName)}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-[#111111]">
                  {pain.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#4b5563]">
                  {pain.description}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#e5e7eb]/80 text-xs font-medium text-[#6b7280]">
                Rào cản mua sắm đồ vintage trực tuyến
              </div>
            </div>
          ))}
        </div>

        {/* B2B2C Value Pillars */}
        <div className="mt-20 pt-16 border-t border-[#e5e7eb]">
          <div className="max-w-2xl space-y-2 mb-10">
            <h3 className="text-2xl font-semibold tracking-tight text-[#111111]">
              Giá trị Đề án MIDORA mang lại cho hệ sinh thái B2B2C
            </h3>
            <p className="text-sm text-[#4b5563]">
              Tạo lập liên kết giá trị vững chắc giữa người mua, chủ cửa hàng và cộng đồng xã hội.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pillar 1: B2C */}
            <div className="rounded-xl bg-[#ffffff] p-7 border border-[#e5e7eb] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-2.5 py-1 text-xs font-semibold text-[#15803d]">
                  <Users className="h-3.5 w-3.5" />
                  Người mua (B2C)
                </span>
                <span className="text-xs text-[#6b7280] font-medium">18–30 tuổi</span>
              </div>
              <h4 className="text-base font-semibold text-[#111111]">
                Tự tin sở hữu món đồ độc bản
              </h4>
              <ul className="space-y-2.5 text-xs text-[#4b5563]">
                {proposalSummary.valuePillars[0].points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#111111] shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pillar 2: B2B */}
            <div className="rounded-xl bg-[#ffffff] p-7 border border-[#e5e7eb] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#1d4ed8]">
                  <Store className="h-3.5 w-3.5" />
                  Đối tác Cửa hàng (B2B)
                </span>
                <span className="text-xs text-[#6b7280] font-medium">Vintage & Thrift Shops</span>
              </div>
              <h4 className="text-base font-semibold text-[#111111]">
                Gia tăng chuyển đổi & Giảm tỷ lệ trả hàng
              </h4>
              <ul className="space-y-2.5 text-xs text-[#4b5563]">
                {proposalSummary.valuePillars[1].points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#111111] shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pillar 3: Sustainability */}
            <div className="rounded-xl bg-[#ffffff] p-7 border border-[#e5e7eb] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fefce8] px-2.5 py-1 text-xs font-semibold text-[#a16207]">
                  <Leaf className="h-3.5 w-3.5" />
                  Thời trang Bền vững
                </span>
                <span className="text-xs text-[#6b7280] font-medium">Circular Fashion</span>
              </div>
              <h4 className="text-base font-semibold text-[#111111]">
                Thúc đẩy tái sử dụng & Kéo dài vòng đời
              </h4>
              <ul className="space-y-2.5 text-xs text-[#4b5563]">
                {proposalSummary.valuePillars[2].points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#111111] shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
