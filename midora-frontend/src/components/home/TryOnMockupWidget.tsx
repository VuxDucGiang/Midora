"use client";

import React, { useState } from "react";
import { Sparkles, RotateCw, CheckCircle2, ChevronRight, Sliders, ShieldCheck } from "lucide-react";

export default function TryOnMockupWidget() {
  // Body measurements state
  const [gender, setGender] = useState<"nam" | "nu">("nam");
  const [height, setHeight] = useState<number>(172);
  const [weight, setWeight] = useState<number>(64);
  const [chest, setChest] = useState<number>(94);
  const [waist, setWaist] = useState<number>(76);
  const [viewAngle, setViewAngle] = useState<"front" | "side" | "back">("front");

  // Fixed Vintage garment measurements (Levi's 1994 Jacket - 1 SKU)
  const garment = {
    title: "1994 Levi's Type III Denim Jacket",
    condition: "Độ mới 95% (Vintage USA)",
    price: "850.000 ₫",
    sku: "VNT-94-001",
    chestWidth: 102, // Ngực áo
    shoulderWidth: 46, // Vai áo
    length: 68, // Dài áo
    sleeve: 62, // Dài tay
  };

  // Sizing Engine calculation
  const chestDiff = garment.chestWidth - chest;
  const isChestFit = chestDiff >= 4 && chestDiff <= 12;
  const isChestTight = chestDiff < 4;
  const isChestLoose = chestDiff > 12;

  // Calculate dynamic Fit Score
  let score = 96;
  if (isChestTight) score -= 25;
  else if (isChestLoose) score -= (chestDiff - 12) * 2;
  score = Math.max(45, Math.min(99, score));

  return (
    <div className="w-full rounded-2xl border border-[#e5e7eb] bg-[#ffffff] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {/* Widget Header: Simulated Product UI Fragment */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
            Interactive 3D Fit Engine
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[11px] font-medium text-[#374151]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#10b981]" />
          Độc bản 1-SKU
        </div>
      </div>

      {/* Main interactive area: 2 columns */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Left: Avatar & Garment Simulation View (5 cols) */}
        <div className="sm:col-span-5 flex flex-col justify-between rounded-xl bg-[#f8f9fa] p-3 border border-[#e5e7eb]">
          <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
            <span className="font-medium text-[#111111]">{garment.sku}</span>
            <span className="inline-flex items-center gap-1">
              <RotateCw className="h-3 w-3 text-[#111111]" /> 360°
            </span>
          </div>

          {/* Simulated 3D Avatar Try-On Figure */}
          <div className="relative my-3 flex flex-col items-center justify-center py-6">
            {/* Visual Heatmap representation */}
            <div className="relative flex flex-col items-center">
              {/* Head */}
              <div className="h-9 w-9 rounded-full bg-[#e5e7eb] border border-[#d1d5db]" />
              {/* Torso with Garment */}
              <div className="relative mt-1 h-24 w-20 rounded-md bg-[#1e293b] text-white flex flex-col items-center justify-center p-1 shadow-sm border border-[#334155]">
                <span className="text-[9px] font-semibold tracking-tighter uppercase text-slate-300">
                  Denim 90s
                </span>
                {/* Heatmap overlay dots */}
                <div className="absolute top-2 flex justify-between w-full px-2">
                  <span className="h-2 w-2 rounded-full bg-[#10b981] title='Vai vừa vặn'" />
                  <span className="h-2 w-2 rounded-full bg-[#10b981] title='Vai vừa vặn'" />
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      isChestFit
                        ? "bg-[#10b981]/20 text-[#34d399]"
                        : isChestTight
                        ? "bg-[#ef4444]/20 text-[#ef4444]"
                        : "bg-[#f59e0b]/20 text-[#f59e0b]"
                    }`}
                  >
                    {isChestFit ? "Fit chuẩn" : isChestTight ? "Hơi ôm" : "Oversized"}
                  </span>
                </div>
              </div>
              {/* Legs */}
              <div className="flex gap-1.5 mt-1">
                <div className="h-16 w-3 rounded-b-md bg-[#64748b]" />
                <div className="h-16 w-3 rounded-b-md bg-[#64748b]" />
              </div>
            </div>

            {/* Angle toggle pills */}
            <div className="mt-4 flex rounded-full bg-[#ffffff] p-0.5 border border-[#e5e7eb] text-[10px]">
              {(["front", "side", "back"] as const).map((angle) => (
                <button
                  key={angle}
                  onClick={() => setViewAngle(angle)}
                  className={`px-2 py-0.5 rounded-full capitalize transition-colors ${
                    viewAngle === angle
                      ? "bg-[#111111] text-[#ffffff] font-medium"
                      : "text-[#6b7280] hover:text-[#111111]"
                  }`}
                >
                  {angle === "front" ? "Trước" : angle === "side" ? "Nghiêng" : "Sau"}
                </button>
              ))}
            </div>
          </div>

          {/* Garment details */}
          <div className="rounded-lg bg-[#ffffff] p-2.5 border border-[#e5e7eb] text-xs">
            <p className="font-semibold text-[#111111] truncate">{garment.title}</p>
            <div className="mt-1 flex items-center justify-between text-[#6b7280]">
              <span>{garment.condition}</span>
              <span className="font-semibold text-[#111111]">{garment.price}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Body Adjustment & Sizing Table (7 cols) */}
        <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
          {/* Fit Score Banner */}
          <div className="flex items-center justify-between rounded-xl bg-[#f5f5f5] p-3 border border-[#e5e7eb]">
            <div>
              <p className="text-[11px] font-medium text-[#6b7280]">Độ phù hợp vóc dáng (Fit Score)</p>
              <p className="text-xl font-bold tracking-tight text-[#111111] flex items-center gap-1.5">
                {score}% Tương thích
                <Sparkles className="h-4 w-4 text-[#10b981]" />
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  score >= 85
                    ? "bg-[#10b981]/10 text-[#059669]"
                    : score >= 70
                    ? "bg-[#f59e0b]/10 text-[#d97706]"
                    : "bg-[#ef4444]/10 text-[#dc2626]"
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                {score >= 85 ? "Rất vừa vặn" : score >= 70 ? "Hơi rộng nhẹ" : "Không khuyến nghị"}
              </span>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-medium text-[#111111]">
                <Sliders className="h-3 w-3 text-[#6b7280]" /> Điều chỉnh số đo vóc dáng:
              </span>
              <div className="flex rounded-md bg-[#f5f5f5] p-0.5 border border-[#e5e7eb] text-[10px]">
                <button
                  onClick={() => setGender("nam")}
                  className={`px-2 py-0.5 rounded ${
                    gender === "nam" ? "bg-[#ffffff] text-[#111111] font-semibold shadow-xs" : "text-[#6b7280]"
                  }`}
                >
                  Nam
                </button>
                <button
                  onClick={() => setGender("nu")}
                  className={`px-2 py-0.5 rounded ${
                    gender === "nu" ? "bg-[#ffffff] text-[#111111] font-semibold shadow-xs" : "text-[#6b7280]"
                  }`}
                >
                  Nữ
                </button>
              </div>
            </div>

            {/* Slider 1: Vòng ngực */}
            <div className="rounded-lg bg-[#ffffff] p-2 border border-[#e5e7eb] text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[#374151]">Vòng ngực cơ thể:</span>
                <span className="font-semibold text-[#111111]">{chest} cm</span>
              </div>
              <input
                type="range"
                min="80"
                max="115"
                value={chest}
                onChange={(e) => setChest(Number(e.target.value))}
                className="w-full accent-[#111111] h-1.5 bg-[#e5e7eb] rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Chiều cao */}
            <div className="rounded-lg bg-[#ffffff] p-2 border border-[#e5e7eb] text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[#374151]">Chiều cao:</span>
                <span className="font-semibold text-[#111111]">{height} cm ({weight} kg)</span>
              </div>
              <input
                type="range"
                min="150"
                max="190"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-[#111111] h-1.5 bg-[#e5e7eb] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Sizing Comparison Breakdown */}
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-2.5 text-xs">
            <p className="font-semibold text-[#111111] text-[11px] mb-1.5">
              So khớp kích thước Centimet thực tế:
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="rounded-md bg-[#ffffff] p-1.5 border border-[#e5e7eb]">
                <span className="text-[#6b7280] block">Vòng ngực áo</span>
                <span className="font-semibold text-[#111111]">{garment.chestWidth} cm</span>
                <span className="text-[#059669] block font-medium">+{chestDiff} cm</span>
              </div>
              <div className="rounded-md bg-[#ffffff] p-1.5 border border-[#e5e7eb]">
                <span className="text-[#6b7280] block">Rộng vai áo</span>
                <span className="font-semibold text-[#111111]">{garment.shoulderWidth} cm</span>
                <span className="text-[#059669] block font-medium">+2 cm</span>
              </div>
              <div className="rounded-md bg-[#ffffff] p-1.5 border border-[#e5e7eb]">
                <span className="text-[#6b7280] block">Dài áo</span>
                <span className="font-semibold text-[#111111]">{garment.length} cm</span>
                <span className="text-[#6b7280] block">Chuẩn form</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <a
            href="#demo-tryon"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#111111] text-xs font-semibold text-[#ffffff] hover:bg-[#242424] transition-colors"
          >
            Thử đồ ảo với sản phẩm này
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
