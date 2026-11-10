"use client";

import React from "react";
import { Mail, Phone, GraduationCap, IdCard, CheckCircle2 } from "lucide-react";
import { teamMembers, contestInfo } from "@/data/teamData";

export default function TeamSection() {
  return (
    <section id="doi-ngu" className="w-full bg-[#f8f9fa] py-24 border-b border-[#e5e7eb]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center rounded-full bg-[#ffffff] px-3.5 py-1 text-xs font-semibold text-[#111111] border border-[#e5e7eb] shadow-xs">
            Phần 4: Đội Ngũ Thực Hiện Đề Án
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-1px] text-[#111111]">
            Các Thành viên Đội thi MIDORA
          </h2>
          <p className="text-base text-[#4b5563]">
            Sự kết hợp liên ngành giữa chuyên môn Kinh doanh Quốc tế, Kỹ thuật Phần mềm và Thiết kế Trải nghiệm 
            đáp ứng hoàn hảo mục tiêu xây dựng nền tảng B2B2C cho thời trang vintage.
          </p>
        </div>

        {/* Team Members Grid (4 Members) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col justify-between rounded-xl bg-[#ffffff] p-6 border border-[#e5e7eb] shadow-xs hover:border-[#111111] transition-all duration-200"
            >
              <div>
                {/* Avatar & Role Tag */}
                <div className="flex items-start justify-between">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#111111]/10 bg-[#f5f5f5]">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[11px] font-semibold text-[#111111] border border-[#e5e7eb]">
                    {member.highlightTag}
                  </span>
                </div>

                {/* Member Info */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-base font-semibold text-[#111111] tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-[#2563eb]">
                    {member.role}
                  </p>
                </div>

                {/* Academic Metadata */}
                <div className="mt-3 space-y-1.5 text-xs text-[#6b7280] pt-3 border-t border-[#e5e7eb]">
                  <div className="flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5 text-[#111111]" />
                    <span>MSSV: <strong className="text-[#111111] font-semibold">{member.studentId}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-[#111111]" />
                    <span className="truncate">{member.major}</span>
                  </div>
                </div>

                {/* Bio Description */}
                <p className="mt-3 text-xs text-[#4b5563] leading-relaxed">
                  {member.bio}
                </p>
              </div>

              {/* Contact Footer */}
              <div className="mt-5 pt-4 border-t border-[#e5e7eb] space-y-1.5 text-xs">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-1.5 text-[#374151] hover:text-[#111111] truncate transition-colors"
                  title={member.email}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
                  <span className="truncate">{member.email}</span>
                </a>
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-1.5 text-[#374151] hover:text-[#111111] transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
                    <span>{member.phone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Team Commitment Card */}
        <div className="mt-12 rounded-xl bg-[#ffffff] p-6 border border-[#e5e7eb] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10b981]/10 text-[#059669]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">
                Cam kết hoàn thành đề án và triển khai thực nghiệm
              </p>
              <p className="text-xs text-[#6b7280]">
                Đội thi {contestInfo.projectCode} cam kết tuân thủ quy chế cuộc thi và sẵn sàng bước vào giai đoạn thử nghiệm (Pilot) với các đối tác.
              </p>
            </div>
          </div>
          <a
            href="mailto:contact.midora.team@gmail.com"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-[#111111] px-4 text-xs font-semibold text-[#ffffff] hover:bg-[#242424] transition-colors"
          >
            Liên hệ Ban Dự án
          </a>
        </div>
      </div>
    </section>
  );
}
