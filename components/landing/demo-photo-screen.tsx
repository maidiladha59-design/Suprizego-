"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { DemoPolaroidArt } from "./demo-polaroid-art";
import { DemoButton } from "./demo/demo-controls";

type Photo = {
  id: string;
  caption: string;
  scene: "beach" | "rain";
};

const PHOTOS: Photo[] = [
  { id: "pantai", caption: "Sore di pantai", scene: "beach" },
  { id: "halte", caption: "Hujan di halte", scene: "rain" },
];

export function DemoPhotoScreen({ onContinue }: { onContinue: () => void }) {
  const [offset, setOffset] = useState(0);
  const ordered = [...PHOTOS.slice(offset), ...PHOTOS.slice(0, offset)];

  function showNextPhoto() {
    setOffset((value) => (value + 1) % PHOTOS.length);
  }

  return (
    <div data-demo-screen="photo" className="demo-rise flex h-full flex-col px-4 pb-6 pt-[22px] text-center">
      <h2 className="mb-4 font-display text-2xl uppercase leading-8">Kenangan</h2>

      <div className="relative mx-auto aspect-[9/11] w-full max-w-[288px]">
        {ordered.map((photo, index) => {
          const isTop = index === 0;
          const transform = isTop
            ? "rotate(0deg) translateY(0)"
            : "translateY(6px) rotate(-5deg)";

          return (
            <figure
              key={photo.id}
              data-photo-id={photo.id}
              data-top-photo={isTop}
              className="demo-polaroid absolute inset-0 rounded-[10px] border-4 border-ink bg-white p-3 pb-4 shadow-[8px_8px_0_0_#111]"
              style={{ zIndex: 10 - index, transform }}
            >
              <div className="h-[280px] w-full overflow-hidden rounded-md border-2 border-ink">
                <DemoPolaroidArt scene={photo.scene} />
              </div>
              <figcaption className="mt-2 truncate text-sm font-bold leading-6 text-ink">
                {photo.caption}
              </figcaption>
              {isTop ? (
                <button
                  type="button"
                  onClick={showNextPhoto}
                  aria-label={`Geser foto: ${photo.caption}`}
                  className="absolute inset-0 rounded-[6px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
                />
              ) : null}
            </figure>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 max-[360px]:gap-2">
        <DemoButton onClick={showNextPhoto} className="max-[360px]:px-2 max-[360px]:text-xs">
          Foto lain
        </DemoButton>
        <DemoButton tone="ink" onClick={onContinue} className="max-[360px]:px-3 max-[360px]:text-xs">
          Lanjut <ArrowRightIcon className="size-4" />
        </DemoButton>
      </div>

      <p className="mt-3 text-xs font-bold leading-4 text-ink">ketuk foto untuk menggeser</p>
    </div>
  );
}
