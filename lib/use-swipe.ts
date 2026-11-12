"use client";

import { useCallback, useRef } from "react";

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

/**
 * Two-finger swipe on a laptop touchpad (a sideways wheel scroll) goes to the
 * next / previous photo, one photo per gesture, instead of letting the browser
 * read it as "go back a page". Vertical scrolling is left alone. Returns a ref
 * for the element.
 */
export function useWheelSwipe(onNext: () => void, onPrev: () => void, enabled = true) {
  const cb = useRef({ onNext, onPrev, enabled });
  cb.current = { onNext, onPrev, enabled };
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((el: HTMLElement | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!el) return;
    let sum = 0;
    let locked = false;
    let timer = 0;
    const onWheel = (e: WheelEvent) => {
      if (!cb.current.enabled || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      // The gesture (and the touchpad's momentum after it) ends after a short pause.
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        sum = 0;
        locked = false;
      }, 220);
      if (locked) return;
      sum += e.deltaX;
      if (Math.abs(sum) > 60) {
        locked = true;
        if (sum > 0) cb.current.onNext();
        else cb.current.onPrev();
        sum = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    cleanup.current = () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(timer);
    };
  }, []);
}
