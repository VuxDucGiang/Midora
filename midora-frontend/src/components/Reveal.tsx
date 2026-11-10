"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  once?: boolean;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const hiddenTransform = {
    up: "translate3d(0, 28px, 0) scale(0.985)",
    down: "translate3d(0, -28px, 0) scale(0.985)",
    left: "translate3d(-32px, 0, 0) scale(0.985)",
    right: "translate3d(32px, 0, 0) scale(0.985)",
    scale: "translate3d(0, 12px, 0) scale(0.94)",
  }[direction];

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0, 0, 0) scale(1)" : hiddenTransform,
        filter: isVisible ? "blur(0px)" : "blur(6px)",
        transitionProperty: "opacity, transform, filter",
        transitionDuration: "850ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
        willChange: "opacity, transform, filter",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

