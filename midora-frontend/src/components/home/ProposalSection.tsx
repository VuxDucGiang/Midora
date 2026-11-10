"use client";

import React from "react";
import Reveal from "@/components/Reveal";

export default function ProposalSection() {
  return (
    <section id="de-an" className="w-full bg-[#FFFFFF] py-20 sm:py-24 border-b border-[#E5DFD5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#191817] leading-tight">
              Vấn đề & Giải pháp của MIDORA
            </h2>
            <p className="mt-2 text-sm text-[#57534E] font-light">
              Giải quyết bài toán đặc thù của thị trường thời trang secondhand và vintage độc bản.
            </p>
          </div>
        </Reveal>

        {/* Problem vs Solution */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: 3 Core Pain Points */}
          <Reveal className="lg:col-span-6 flex" direction="left" delay={100}>
            <div className="editorial-card w-full rounded-xs border border-[#E5DFD5] bg-[#FAF7F2] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#191817]">
                  Rào cản khi mua đồ secondhand online
                </h3>
                <div className="mt-5 space-y-4">
                  <div className="border-l-2 border-[#A25B26] pl-4">
                    <h4 className="text-sm font-semibold text-[#191817]">
                      Không thể mặc thử trực tiếp
                    </h4>
                    <p className="text-xs text-[#57534E] mt-0.5 font-light">
                      Khó hình dung form dáng trang phục khi mặc lên cơ thể bản thân.
                    </p>
                  </div>

                  <div className="border-l-2 border-[#A25B26] pl-4">
                    <h4 className="text-sm font-semibold text-[#191817]">
                      Mỗi sản phẩm chỉ có một chiếc và số đo riêng
                    </h4>
                    <p className="text-xs text-[#57534E] mt-0.5 font-light">
                      Đồ vintage không tuân theo bảng kích thước S/M/L chuẩn như đồ mới.
                    </p>
                  </div>

                  <div className="border-l-2 border-[#A25B26] pl-4">
                    <h4 className="text-sm font-semibold text-[#191817]">
                      Hình ảnh và bảng size chưa đủ tin cậy
                    </h4>
                    <p className="text-xs text-[#57534E] mt-0.5 font-light">
                      Thiếu cơ sở trực quan khiến người mua ngần ngại trước khi chốt đơn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: MIDORA Solution */}
          <Reveal className="lg:col-span-6 flex" direction="right" delay={220}>
            <div className="editorial-card w-full rounded-xs border border-[#22384F] bg-[#1E2E40] text-[#FAF7F2] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#FFFFFF]">
                  Giải pháp thử đồ ảo cá nhân hóa 3D
                </h3>
                <p className="text-xs sm:text-sm text-[#D3CBC0] font-light leading-relaxed">
                  MIDORA kết hợp mô hình Avatar 3D theo thông số cơ thể với kích thước thực tế từng centimet của sản phẩm, giúp người mua tự tin lựa chọn và giúp cửa hàng nâng cao hiệu quả kinh doanh.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="border border-[#334B65] bg-[#172433] p-3.5 rounded-xs transition-colors hover:border-[#34D399]/60">
                    <span className="block text-xs font-semibold text-[#FFFFFF]">Người mua (B2C)</span>
                    <span className="block text-[11px] text-[#A1A1AA] mt-1 font-light">
                      Thử đồ trực quan, chọn đúng kích cỡ
                    </span>
                  </div>
                  <div className="border border-[#334B65] bg-[#172433] p-3.5 rounded-xs transition-colors hover:border-[#34D399]/60">
                    <span className="block text-xs font-semibold text-[#FFFFFF]">Cửa hàng (B2B)</span>
                    <span className="block text-[11px] text-[#A1A1AA] mt-1 font-light">
                      Tăng tương tác, giảm hoàn trả hàng
                    </span>
                  </div>
                  <div className="border border-[#334B65] bg-[#172433] p-3.5 rounded-xs transition-colors hover:border-[#34D399]/60">
                    <span className="block text-xs font-semibold text-[#34D399]">Cộng đồng</span>
                    <span className="block text-[11px] text-[#A1A1AA] mt-1 font-light">
                      Kéo dài vòng đời thời trang bền vững
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
