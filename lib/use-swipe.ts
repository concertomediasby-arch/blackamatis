"use client";

import { useRef } from "react";

/**
 * Swipe left / right on an element (touch, pen or mouse drag) to go to the
 * next / previous photo. Vertical scrolling keeps working (use `touch-action:
 * pan-y` on the element). A swipe never also counts as a tap on a button inside.
 */
export function useSwipe(onNext: () => void, onPrev: () => void, enabled = true) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (!enabled) return;
      start.current = { x: e.clientX, y: e.clientY };
      swiped.current = false;
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
        swiped.current = true;
        if (dx < 0) onNext();
        else onPrev();
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (swiped.current) {
        swiped.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
    // Stop the browser's own image drag, so a mouse drag reaches pointerup.
    onDragStart: (e: React.DragEvent) => {
      if (enabled) e.preventDefault();
    },
    style: enabled ? ({ touchAction: "pan-y" } as React.CSSProperties) : undefined,
  };
}
