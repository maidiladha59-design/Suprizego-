"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

type LogoInteractiveProps = {
  children: ReactNode;
  className: string;
  dimension: number;
};

export function LogoInteractive({ children, className, dimension }: LogoInteractiveProps) {
  const [surprised, setSurprised] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function showSurprise() {
    setSurprised(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSurprised(false);
      timer.current = null;
    }, 1100);
  }

  function handlePointerEnter(event: PointerEvent<HTMLSpanElement>) {
    if (event.pointerType === "mouse") setSurprised(true);
  }

  function handlePointerLeave(event: PointerEvent<HTMLSpanElement>) {
    if (event.pointerType === "mouse") setSurprised(false);
  }

  return (
    <span
      aria-hidden="true"
      className={`sg-logo sg-logo--animated ${surprised ? "sg-logo--surprised" : ""} inline-flex shrink-0 ${className}`}
      data-animated="true"
      data-logo="suprizego"
      onPointerCancel={() => setSurprised(false)}
      onPointerDown={showSurprise}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ width: dimension, height: dimension }}
    >
      {children}
    </span>
  );
}
