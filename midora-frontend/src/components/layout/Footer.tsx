import React from "react";
import { Sparkles, Mail, CodeXml, ExternalLink } from "lucide-react";
import { contestInfo } from "@/data/teamData";

export default function Footer() {
  return (
    <footer className="w-full bg-[#101010] text-[#a1a1aa] pt-16 pb-12 border-t border-[#242424]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#242424]">
          {/* Brand & Contest Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-2xl tracking-[-1px] text-[#ffffff]">
                MIDORA
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1a1a1a] px-2.5 py-0.5 text-xs font-medium text-[#ffffff] border border-[#2e2e2e]">
                <Sparkles className="h-3 w-3 text-[#34d399]" />
                {contestInfo.projectCode}
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-[#a1a1aa]">
              SEE IT. TRY IT. LOVE IT. – Nền tảng thử đồ ảo cá nhân hóa dành cho thị trường thời trang secondhand và vintage với avatar 3D theo số đo cơ thể thực tế.
            </p>
            <div className="pt-2 text-xs text-[#71717a] space-y-1">
              <p className="font-medium text-[#e4e4e7]">{contestInfo.name}</p>
              <p>{contestInfo.track} • {contestInfo.submissionDeadline}</p>
            </div>
          </div>

          {/* Col 1: Về Đề Án */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffffff]">
              Đề Án MIDORA
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#de-an" className="hover:text-[#ffffff] transition-colors">
                  Vấn đề thị trường
                </a>
              </li>
              <li>
                <a href="#giai-phap" className="hover:text-[#ffffff] transition-colors">
                  Giải pháp 3D Try-On
                </a>
              </li>
              <li>
                <a href="#demo-tryon" className="hover:text-[#ffffff] transition-colors">
                  Trải nghiệm thử đồ mẫu
                </a>
              </li>
              <li>
                <a href="#de-an" className="hover:text-[#ffffff] transition-colors">
                  Thời trang bền vững
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Đội ngũ & Cuộc thi */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffffff]">
              Đội Thi & Tiến Độ
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#doi-ngu" className="hover:text-[#ffffff] transition-colors">
                  Thành viên Đội thi
                </a>
              </li>
              <li>
                <a href="#lo-trinh" className="hover:text-[#ffffff] transition-colors">
                  Lộ trình 4 giai đoạn
                </a>
              </li>
              <li>
                <a href="#lo-trinh" className="hover:text-[#ffffff] transition-colors">
                  Kế hoạch thử nghiệm B2B
                </a>
              </li>
              <li>
                <a href="#tai-lieu" className="hover:text-[#ffffff] transition-colors">
                  Tài liệu nộp BTC
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Công nghệ & Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffffff]">
              Kiến Trúc & Kết Nối
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
                Frontend: <span className="text-[#ffffff]">Next.js 15+ (App Router)</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
                Backend: <span className="text-[#ffffff]">Spring Boot 3 + MySQL</span>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:contact.midora.team@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs text-[#ffffff] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  contact.midora.team@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#ffffff]"
                >
                  <CodeXml className="h-3.5 w-3.5" />
                  Source Code Repository
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717a] gap-4">
          <p>© 2026 MIDORA Contest Team. Dự án tham gia {contestInfo.name}.</p>
          <p className="flex items-center gap-2">
            <span>Thiết kế theo chuẩn Modern SaaS Design System</span>
            <span>•</span>
            <span className="text-[#34d399]">Ready for Vercel</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
