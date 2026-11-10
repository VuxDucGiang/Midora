"use client";

import React from "react";
import Reveal from "@/components/Reveal";

const coreDifferentiators = [
  {
    tag: "Personalized Experience",
    title: "Cá nhân hóa theo vóc dáng",
    description: "Avatar 3D được tạo dựng trực tiếp từ các thông số cơ thể riêng của từng người mua.",
  },
  {
    tag: "One-of-a-kind Fashion",
    title: "Tôn vinh trang phục độc bản",
    description: "Giải quyết đặc thù mỗi sản phẩm secondhand chỉ có duy nhất một chiếc với form dáng riêng.",
  },
  {
    tag: "Real Measurements",
    title: "Số đo thực tế chính xác",
    description: "Kết hợp trải nghiệm mô phỏng trực quan với thông tin kích thước thực tế từng centimet.",
  },
  {
    tag: "Sustainable Fashion",
    title: "Thời trang tuần hoàn bền vững",
    description: "Khuyến khích tái sử dụng quần áo, kéo dài vòng đời sản phẩm và tiêu dùng có trách nhiệm.",
  },
];

export default function ContestRoadmapSection() {
  return (
    <section id="tam-nhin" className="w-full bg-[#FFFFFF] py-20 sm:py-24 border-b border-[#E5DFD5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Vision & Mission Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-14 border-b border-[#E5DFD5]">
          <Reveal className="lg:col-span-6 space-y-3" direction="left">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#191817] leading-tight">
              Tầm Nhìn & Sứ Mệnh Thời Trang Bền Vững
            </h2>
            <p className="text-sm text-[#57534E] font-light leading-relaxed">
              MIDORA hướng đến trở thành nền tảng hỗ trợ trải nghiệm mua sắm thời trang secondhand trực tuyến đáng tin cậy tại Việt Nam — nơi mỗi món đồ độc bản đều tìm được người mặc phù hợp.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-6" direction="right" delay={150}>
            <div className="editorial-card rounded-xs border border-[#E5DFD5] bg-[#FAF7F2] p-6 sm:p-7 space-y-3">
              <span className="font-mono text-xs text-[#2C523F] font-semibold uppercase tracking-wider">
                Hành trình MIDORA tại Cuộc thi
              </span>
              <p className="font-serif italic text-base sm:text-lg text-[#191817] leading-relaxed">
                &ldquo;Biến một vấn đề thực tế trong mua sắm thời trang trực tuyến thành giải pháp có giá trị cho cộng đồng và môi trường.&rdquo;
              </p>
              <p className="text-xs text-[#57534E] font-light leading-relaxed">
                Thông qua quá trình nghiên cứu, thử nghiệm và hoàn thiện mô hình B2B2C cùng các cửa hàng vintage, đội ngũ MIDORA mong muốn từng bước hiện thực hóa dự án và lan tỏa xu hướng tiêu dùng bền vững.
              </p>
            </div>
          </Reveal>
        </div>

        {/* 4 Core Differentiators from Proposal */}
        <div className="mt-12">
          <Reveal direction="up">
            <h3 className="font-serif text-xl font-bold text-[#191817] mb-6">
              Điểm khác biệt cốt lõi của MIDORA
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreDifferentiators.map((item, idx) => (
              <Reveal key={idx} delay={100 + idx * 120} direction="up" className="flex">
                <div className="editorial-card w-full flex flex-col justify-between rounded-xs border border-[#E5DFD5] bg-[#FAF7F2] p-5 hover:border-[#2C523F]">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#A25B26] font-semibold">
                      {item.tag}
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#191817] mt-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#57534E] mt-2 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
