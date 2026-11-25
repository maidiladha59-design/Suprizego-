"use client";

import { useEffect, useRef, useState } from "react";

export type PreviewPhoto = {
  id: string;
  url: string;
  caption: string;
};

const TILTS = [0, -5, 6];

const buttonClass =
  "h-[42px] whitespace-nowrap rounded-xl border-[3px] border-ink px-3 font-display text-[0.85rem] uppercase tracking-[0.01em] shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function PhotoReader({
  photos,
  onContinue,
}: {
  photos: PreviewPhoto[];
  onContinue: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const start = photos.length > 0 ? offset % photos.length : 0;
  const ordered = [...photos.slice(start), ...photos.slice(0, start)];
  const stack = ordered.slice(0, 3);

  function showNextPhoto() {
    if (photos.length < 2 || swiping) return;
    setSwiping(true);
    timer.current = window.setTimeout(() => {
      setOffset((value) => value + 1);
      setSwiping(false);
    }, 320);
  }

  return (
    <div className="w-full text-center">
      <p className="mb-4 font-display text-2xl leading-8">Kenangan</p>

      <div className="relative mx-auto aspect-[9/11] w-full max-w-[288px]">
        {stack.map((photo, index) => {
          const isTop = index === 0;
          const transform = isTop
            ? swiping
              ? "translateX(130%) rotate(18deg)"
              : "rotate(0deg)"
            : `rotate(${TILTS[index] ?? 0}deg) translateY(${6 * index}px)`;
          return (
            <figure
              key={photo.id}
              onClick={isTop && photos.length > 1 ? showNextPhoto : undefined}
              className={`absolute inset-0 border-4 border-ink bg-white p-3 pb-4 shadow-[8px_8px_0_0_#111] transition-all duration-300 ${
                isTop && photos.length > 1 ? "cursor-pointer" : ""
              }`}
              style={{
                zIndex: 10 - index,
                borderRadius: 10,
                transform,
                opacity: isTop && swiping ? 0 : 1,
              }}
            >
              <img
                src={photo.url}
                alt={photo.caption || "Foto kenangan"}
                draggable={false}
                className="h-[calc(100%-2.25rem)] w-full rounded-md border-2 border-ink object-cover"
              />
              <figcaption className="mt-2 truncate text-sm font-bold text-ink">
                {photo.caption || " "}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {photos.length > 1 && (
          <button type="button" onClick={showNextPhoto} className={`${buttonClass} bg-paper text-ink`}>
            Foto lain
          </button>
        )}
        <button type="button" onClick={onContinue} className={`${buttonClass} bg-ink text-paper`}>
          Lanjut →
        </button>
      </div>

      {photos.length > 1 && (
        <p className="mt-3 text-xs font-bold opacity-70">ketuk foto untuk menggeser</p>
      )}
    </div>
  );
}
