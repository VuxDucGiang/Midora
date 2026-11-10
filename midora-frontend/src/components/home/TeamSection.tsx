"use client";

import React from "react";
import { Mail, Phone, GraduationCap, IdCard } from "lucide-react";
import Reveal from "@/components/Reveal";
import { teamMembers } from "@/data/teamData";

export default function TeamSection() {
  return (
    <section id="doi-ngu" className="w-full bg-[#FAF7F2] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#191817] leading-tight">
              Thành Viên Đội Thi MIDORA
            </h2>
            <p className="mt-2 text-sm text-[#57534E] font-light">
              Đội ngũ thực hiện đề án tham gia cuộc thi.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {teamMembers.map((member, idx) => (
            <Reveal key={member.id} delay={100 + idx * 120} direction="up" className="flex">
              <div className="editorial-card group w-full flex flex-col justify-between rounded-xs border border-[#E5DFD5] bg-[#FFFFFF] p-5 hover:border-[#191817] shadow-xs">
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-xs border border-[#E5DFD5] bg-[#EFE9E1]">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 right-2.5 rounded-xs bg-[#191817] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#FAF7F2]">
                      {member.highlightTag}
                    </span>
                  </div>

                  <div className="mt-4 space-y-0.5">
                    <h3 className="font-serif text-base font-bold text-[#191817]">
                      {member.name}
                    </h3>
                    <p className="font-mono text-xs text-[#A25B26] font-medium">
                      {member.role}
                    </p>
                  </div>

                  <div className="mt-3 space-y-1 pt-3 border-t border-[#E5DFD5] text-xs text-[#57534E]">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <IdCard className="h-3.5 w-3.5 text-[#191817]" />
                      <span>MSSV: <strong className="text-[#191817]">{member.studentId}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <GraduationCap className="h-3.5 w-3.5 text-[#191817]" />
                      <span className="truncate">{member.major}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5DFD5] space-y-1 text-xs">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1.5 text-[#57534E] hover:text-[#191817] truncate font-mono text-[11px]"
                    title={member.email}
                  >
                    <Mail className="h-3 w-3 shrink-0 text-[#8E8A85]" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-1.5 text-[#57534E] hover:text-[#191817] font-mono text-[11px]"
                    >
                      <Phone className="h-3 w-3 shrink-0 text-[#8E8A85]" />
                      <span>{member.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
