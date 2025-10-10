"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function ResponsiveScale({
  baseWidth,
  baseHeight,
  children,
  maxScale = 1,
  className = "",
}: {
  baseWidth: number;
  baseHeight: number;
  children: React.ReactNode;
  maxScale?: number;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const useIsoEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

  useIsoEffect(() => {
    if (!outerRef.current) return;

    const el = outerRef.current;

    const compute = () => {
      const available = el.clientWidth;
      const s = Math.min(maxScale, available / baseWidth);
      setScale(s > 0 ? s : 1);
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseWidth, maxScale]);

  return (
    <div
      ref={outerRef}
      className={`w-full ${className}`}
      style={{ height: baseHeight * scale }}
    >
      <div className="flex justify-center">
        <div
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
          className="will-change-transform transform-gpu"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
