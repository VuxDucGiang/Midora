"use client";

import React from "react";
import { FileText, Play, Download, ExternalLink, Sparkles, MessageCircle } from "lucide-react";
import { contestInfo } from "@/data/teamData";

export default function MediaPitchSection() {
  return (
    <section id="tai-lieu" className="w-full bg-[#ffffff] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center rounded-full bg-[#f8f9fa] px-3.5 py-1 text-xs font-semibold text-[#6b7280] border border-[#e5e7eb]">
            Phần 5: Truyền Thông & Tài Liệu Nộp BTC
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-1px] text-[#111111]">
            Đề án & Nội dung Truyền thông Dự án MIDORA
          </h2>
          <p className="text-base text-[#4b5563]">
            Toàn bộ tài liệu thuyết minh đề án, slide thuyết trình (Pitch Deck) và nội dung truyền thông của Đội thi gửi về Ban Tổ Chức.
          </p>
        </div>

        {/* Media & Docs Grid (2 Columns: Video & Pitch Deck) */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Pitching Video Showcase (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl bg-[#f5f5f5] p-6 sm:p-8 border border-[#e5e7eb]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffffff] px-3 py-1 text-xs font-semibold text-[#111111] border border-[#e5e7eb]">
                  <Play className="h-3 w-3 fill-current text-[#111111]" />
                  Video Giới thiệu Đề án (3 Phút)
                </span>
                <span className="text-xs text-[#6b7280] font-medium">Full HD 1080p</span>
              </div>

              <h3 className="text-xl font-semibold text-[#111111] tracking-tight">
                MIDORA – Xóa bỏ rào cản thử đồ cho thời trang Secondhand
              </h3>
              <p className="text-xs text-[#4b5563] leading-relaxed">
                Video tóm tắt hành trình từ nỗi đau thực tế của người mua đồ vintage đến giải pháp 3D Parametric Avatar và tiềm năng thị trường thời trang tuần hoàn tại Việt Nam.
              </p>
            </div>

            {/* Video Mockup Frame */}
            <div className="my-6 relative aspect-video w-full overflow-hidden rounded-xl bg-[#111111] border border-[#242424] flex flex-col items-center justify-center text-center p-6 group cursor-pointer">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffffff] text-[#111111] shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 fill-current ml-1" />
              </div>
              <p className="mt-4 text-xs font-semibold text-[#ffffff]">
                Bấm để xem Video Pitching Đội thi MIDORA
              </p>
              <p className="text-[11px] text-[#a1a1aa] mt-1">
                Kênh truyền thông chính thức cho Cuộc thi 2026
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#6b7280] pt-2 border-t border-[#e5e7eb]">
              <span>Thời lượng: 03:00 phút</span>
              <span className="font-medium text-[#111111]">Phụ đề: Tiếng Việt / English</span>
            </div>
          </div>

          {/* Right: Proposal Document & Pitch Deck Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Doc Card 1: Bản Thuyết Minh Đề Án */}
            <div className="rounded-xl bg-[#ffffff] p-6 border border-[#e5e7eb] shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#111111] border border-[#e5e7eb]">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-[11px] font-semibold text-[#15803d]">
                  Bản chính thức
                </span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-[#111111]">
                  Bản Thuyết Minh Đề Án Hoàn Chỉnh (DOCX/PDF)
                </h4>
                <p className="text-xs text-[#4b5563] mt-1 leading-relaxed">
                  Bao gồm: Nghiên cứu thị trường, Phân tích đối thủ, Mô hình kinh doanh B2B2C, Kiến trúc công nghệ và Kế hoạch tài chính 3 năm.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="#tai-lieu"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#111111] px-4 text-xs font-semibold text-[#ffffff] hover:bg-[#242424] transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Tải Bản Đề Án (PDF)
                </a>
                <span className="text-xs text-[#6b7280]">Dung lượng: ~2.4 MB</span>
              </div>
            </div>

            {/* Doc Card 2: Slide Pitch Deck */}
            <div className="rounded-xl bg-[#ffffff] p-6 border border-[#e5e7eb] shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#111111] border border-[#e5e7eb]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#1d4ed8]">
                  15 Slides
                </span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-[#111111]">
                  Slide Thuyết Trình Pitch Deck Cuộc Thi
                </h4>
                <p className="text-xs text-[#4b5563] mt-1 leading-relaxed">
                  Thiết kế theo cấu trúc chuẩn quốc tế: Problem, Solution, Product Demo, Market Size, Traction, Business Model & Team.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="#tai-lieu"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-4 text-xs font-semibold text-[#111111] hover:bg-[#f8f9fa] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Xem Slide Online
                </a>
                <span className="text-xs text-[#6b7280]">Canva / PDF Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-footer CTA Band (cta-band-light from /.agent/design.md) */}
        <div className="mt-16 rounded-xl bg-[#f5f5f5] p-8 sm:p-12 border border-[#e5e7eb] text-center space-y-4">
          <div className="inline-flex items-center rounded-full bg-[#ffffff] px-3 py-1 text-xs font-medium text-[#374151] border border-[#e5e7eb]">
            {contestInfo.name} • Mã dự án: {contestInfo.projectCode}
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.5px] text-[#111111] max-w-2xl mx-auto">
            Đồng hành cùng MIDORA trong hành trình thúc đẩy thời trang bền vững
          </h3>
          <p className="text-sm text-[#4b5563] max-w-xl mx-auto leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp từ Ban Giám khảo, các chuyên gia cố vấn và các đối tác cửa hàng vintage trên toàn quốc.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:vuxducgiang@gmail.com,manhmam2010@gmail.com"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111111] px-6 text-xs sm:text-sm font-semibold text-[#ffffff] hover:bg-[#242424] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Gửi tin nhắn cho Đội thi
            </a>
            <a
              href="#doi-ngu"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-5 text-xs sm:text-sm font-semibold text-[#111111] hover:bg-[#f8f9fa] transition-colors"
            >
              Danh sách Thành viên
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
