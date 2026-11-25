"use client";

import { useState } from "react";

type BrandMarkProps = {
  size?: "md" | "lg";
};

export function BrandMark({ size = "md" }: BrandMarkProps) {
  const [open, setOpen] = useState(false);
  const sizeClass = size === "lg" ? "size-12" : "size-9";

  return (
    <button
      type="button"
      className={`brand-mark block ${sizeClass} shrink-0 cursor-pointer rounded-[0.7rem] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink`}
      data-open={open}
      aria-label={open ? "Tutup maskot amplop SuprizeGo" : "Buka maskot amplop SuprizeGo"}
      aria-pressed={open}
      onClick={() => setOpen((current) => !current)}
      onBlur={() => setOpen(false)}
    >
      <svg viewBox="0 0 56 56" className="size-full overflow-visible" aria-hidden="true">
        <rect x="4" y="6" width="44" height="44" rx="11" fill="#111111" />
        <rect
          x="1.5"
          y="1.5"
          width="44"
          height="44"
          rx="11"
          fill="#B6F22E"
          stroke="#111111"
          strokeWidth="3"
        />
        <g className="brand-mark__mascot">
          <rect
            x="12"
            y="20"
            width="24"
            height="18"
            rx="3"
            fill="#FFF4E0"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <path
            className="brand-mark__flap"
            d="M12.5 20.5 24 25.5 35.5 20.5Z"
            fill="#FF8FB8"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="m12.8 22.2 9.1 6.2M35.2 22.2l-9.1 6.2"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g className="brand-mark__eye-blink">
            <circle className="brand-mark__eye" cx="20" cy="29" r="1.8" fill="#111111" />
          </g>
          <g className="brand-mark__eye-blink">
            <circle className="brand-mark__eye" cx="28" cy="29" r="1.8" fill="#111111" />
          </g>
          <path
            d="M21 33.2c1.6 2.1 4.4 2.1 6 0"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </button>
  );
}
