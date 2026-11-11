"use client";

import React, { useMemo, useRef, useState } from "react";

interface RulerSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  majorInterval?: number;
  pixelsPerUnit?: number;
  onChange: (nextValue: number) => void;
}

function roundToStep(val: number, step: number): number {
  const inverse = 1 / step;
  return Math.round(val * inverse) / inverse;
}

export default function RulerSlider({
  value,
  min,
  max,
  step = 0.5,
  unit,
  majorInterval = 1,
  pixelsPerUnit = 62,
  onChange,
}: RulerSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startValue: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startValue: value,
    moved: false,
  });

  const [isDragging, setIsDragging] = useState(false);

  const subDivisions = majorInterval >= 5 ? 5 : 4;
  const tickStep = majorInterval / subDivisions;

  const visibleTicks = useMemo(() => {
    const halfVisibleUnits = 240 / pixelsPerUnit;
    const rawStart = Math.max(
      min - tickStep * 2,
      Math.floor((value - halfVisibleUnits) / tickStep) * tickStep
    );
    const rawEnd = Math.min(
      max + tickStep * 2,
      Math.ceil((value + halfVisibleUnits) / tickStep) * tickStep
    );

    const ticks: Array<{
      posVal: number;
      isMajor: boolean;
      isHalf: boolean;
      label?: string;
    }> = [];

    const count = Math.round((rawEnd - rawStart) / tickStep);
    for (let i = 0; i <= count; i++) {
      const tickVal = Number((rawStart + i * tickStep).toFixed(4));
      if (tickVal < min - 0.001 || tickVal > max + 0.001) continue;

      const modMajor = Math.abs(tickVal % majorInterval);
      const isMajor =
        modMajor < 0.001 || Math.abs(modMajor - majorInterval) < 0.001;
      const isHalf =
        !isMajor &&
        majorInterval === 1 &&
        Math.abs((tickVal * 2) % 2 - 1) < 0.15;

      ticks.push({
        posVal: tickVal,
        isMajor,
        isHalf,
        label: isMajor ? `${Math.round(tickVal)}` : undefined,
      });
    }
    return ticks;
  }, [value, min, max, tickStep, majorInterval, pixelsPerUnit]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startValue: value,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    if (Math.abs(dx) > 2) {
      dragStateRef.current.moved = true;
    }
    // Dragging pointer left slides ruler left -> increases reading underneath center needle
    const rawNext = dragStateRef.current.startValue - dx / pixelsPerUnit;
    const clamped = Math.max(min, Math.min(max, roundToStep(rawNext, step)));
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStateRef.current.active = false;
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(min, roundToStep(value - step, step)));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, roundToStep(value + step, step)));
    }
  };

  return (
    <div className="select-none">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unit}`}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative h-14 w-full overflow-hidden touch-none focus:outline-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
        }}
      >
        {/* Fixed Center Tobacco Indicator Needle */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 flex -translate-x-1/2 flex-col items-center">
          <div className="h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-[#A25B26]" />
          <div className="h-7 w-[2px] rounded-full bg-[#A25B26]" />
        </div>

        {/* Dynamic Ruler Ticks anchored around 50% center */}
        {visibleTicks.map((tick) => {
          const offsetPx = (tick.posVal - value) * pixelsPerUnit;
          return (
            <div
              key={tick.posVal}
              style={{
                transform: `translate3d(calc(-50% + ${offsetPx}px), 0, 0)`,
              }}
              className="pointer-events-none absolute left-1/2 top-1.5 flex flex-col items-center"
            >
              <div
                className={
                  tick.isMajor
                    ? "h-5 w-[1.5px] bg-[#191817]/45"
                    : tick.isHalf
                      ? "h-3.5 w-[1px] bg-[#57534E]/35"
                      : "h-2.5 w-[1px] bg-[#8E8A85]/45"
                }
              />
              {tick.label && (
                <span className="mt-1.5 font-mono text-[10px] font-medium text-[#57534E]">
                  {tick.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Subtle range bounds + micro drag hint */}
      <div className="mt-0.5 flex items-center justify-between px-1 font-mono text-[10px] text-[#8E8A85]">
        <span>
          {min} {unit}
        </span>
        <span className="text-[9px] tracking-wider uppercase">
          Kéo thước ngang để chỉnh
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
