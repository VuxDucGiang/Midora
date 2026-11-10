"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import Reveal from "@/components/Reveal";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="lien-he" className="w-full bg-[#FFFFFF] py-20 sm:py-24 border-t border-[#E5DFD5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-5 space-y-3" direction="left">
            <span className="font-mono text-xs uppercase tracking-wider text-[#A25B26] font-semibold">
              Kết nối & Đóng góp
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#191817] leading-tight">
              Gửi Lời Nhắn Tới MIDORA
            </h2>
            <p className="text-sm text-[#57534E] font-light leading-relaxed">
              Đội ngũ MIDORA luôn trân trọng mọi ý kiến phản hồi, góp ý từ Ban Giám khảo, chuyên gia và các đối tác cửa hàng thời trang secondhand.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-7" direction="right" delay={150}>
            <div className="editorial-card rounded-xs border border-[#E5DFD5] bg-[#FAF7F2] p-6 sm:p-8">
              {submitted ? (
                <div className="rounded-xs border border-[#BBF7D0] bg-[#F0FDF4] p-6 text-center space-y-2">
                  <CheckCircle2 className="h-7 w-7 text-[#2C523F] mx-auto" />
                  <h4 className="font-serif text-base font-bold text-[#191817]">
                    Cảm ơn bạn đã gửi lời nhắn!
                  </h4>
                  <p className="text-xs text-[#57534E] font-light">
                    Thông điệp của bạn đã được ghi nhận tới đội ngũ dự án MIDORA.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 inline-block font-mono text-[11px] text-[#2C523F] underline cursor-pointer"
                  >
                    Gửi lời nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên của bạn"
                      className="h-10 w-full rounded-xs border border-[#D3CBC0] bg-[#FFFFFF] px-3.5 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#191817] focus:outline-hidden transition-colors"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email liên hệ"
                      className="h-10 w-full rounded-xs border border-[#D3CBC0] bg-[#FFFFFF] px-3.5 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#191817] focus:outline-hidden transition-colors"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Lời nhắn hoặc góp ý dành cho dự án MIDORA..."
                    className="w-full rounded-xs border border-[#D3CBC0] bg-[#FFFFFF] p-3.5 text-xs text-[#191817] placeholder:text-[#8E8A85] focus:border-[#191817] focus:outline-hidden resize-none transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xs bg-[#191817] px-6 font-mono text-xs font-medium uppercase tracking-wider text-[#FAF7F2] transition-all duration-300 hover:bg-[#2C3E55] hover:-translate-y-0.5 cursor-pointer"
                    >
                      Gửi lời nhắn
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
