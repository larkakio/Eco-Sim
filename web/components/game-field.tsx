"use client";

import { useCallback, useRef } from "react";
import type { Direction } from "@/lib/game/engine";

const SWIPE_MIN = 36;

type Props = {
  onSwipe: (d: Direction) => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export function GameField({ onSwipe, disabled, children }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const resolveSwipe = useCallback(
    (dx: number, dy: number) => {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax < SWIPE_MIN && ay < SWIPE_MIN) return;
      if (ax > ay) {
        onSwipe(dx > 0 ? "right" : "left");
      } else {
        onSwipe(dy > 0 ? "down" : "up");
      }
    },
    [onSwipe],
  );

  return (
    <div
      className="relative touch-none select-none rounded-2xl border border-cyan-500/35 bg-[#05030c]/90 p-2 shadow-[0_0_32px_rgba(0,240,255,0.12)]"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        if (disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (disabled || !start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        start.current = null;
        resolveSwipe(dx, dy);
      }}
      onPointerCancel={() => {
        start.current = null;
      }}
    >
      {children}
    </div>
  );
}
