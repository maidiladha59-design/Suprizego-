"use client";

import { PHOTO_ACCEPT } from "@/lib/photo-rules";

export type EditorPhoto = {
  id: string;
  caption: string;
  url: string | null;
  blob: Blob | null;
  status: "loading" | "ready" | "error";
  name?: string;
  error?: string;
};

type PhotoSectionProps = {
  photos: EditorPhoto[];
  maxPhotos: number;
  notices: string[];
  onFiles: (files: FileList | null) => void;
  onCaption: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDismissNotices: () => void;
};

const captionClass =
  "mt-2 h-9 w-full rounded-lg border-2 border-ink bg-white px-2 text-xs font-normal leading-4 text-ink placeholder:text-ink/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink";

const arrowClass =
  "grid size-7 place-items-center rounded-md border-2 border-ink bg-white text-xs font-bold leading-none text-ink transition disabled:cursor-not-allowed disabled:opacity-30";

export function PhotoSection({
  photos,
  maxPhotos,
  notices,
  onFiles,
  onCaption,
  onRemove,
  onMove,
  onDismissNotices,
}: PhotoSectionProps) {
  const full = photos.length >= maxPhotos;

  return (
    <section
      data-photo-limit={maxPhotos}
      className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
          4
        </span>
        <h2 className="font-display text-2xl uppercase leading-8">Foto</h2>
      </div>
      <p className="mt-1 text-sm font-bold leading-5 text-ink/70">
        Maksimal {maxPhotos} foto, otomatis dikecilin. {photos.length}/{maxPhotos}
      </p>

      {notices.length > 0 && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border-4 border-ink bg-tangerine px-3 py-2 text-sm font-bold leading-5 text-ink"
        >
          <ul className="min-w-0 flex-1 space-y-1">
            {notices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onDismissNotices}
            aria-label="Tutup pesan"
            className="grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink bg-paper text-xs leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <figure
            key={photo.id}
            className={`rounded-xl border-4 border-ink bg-paper p-2 shadow-[4px_4px_0_0_#111] transition-transform hover:rotate-0 ${
              index % 2 === 0 ? "rotate-[-1.2deg]" : "rotate-[1.2deg]"
            }`}
          >
            <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg bg-white">
              {photo.status === "ready" && photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.caption || `Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : photo.status === "loading" ? (
                <div className="grid place-items-center gap-2 p-2 text-center">
                  <span className="size-8 animate-spin rounded-full border-4 border-ink/20 border-t-ink" />
                  <span className="text-[11px] font-bold leading-4 text-ink/70">
                    Ngolah foto...
                  </span>
                </div>
              ) : (
                <div className="grid place-items-center gap-1 p-2 text-center">
                  <span className="grid size-7 place-items-center rounded-full border-[3px] border-ink bg-candy font-display text-sm">
                    !
                  </span>
                  <span className="text-[11px] font-bold leading-4 text-ink/80">
                    {photo.error ?? "Foto gagal diolah."}
                  </span>
                </div>
              )}
            </div>

            {photo.status === "ready" ? (
              <input
                type="text"
                value={photo.caption}
                onChange={(event) => onCaption(photo.id, event.target.value)}
                maxLength={60}
                placeholder="Keterangan"
                aria-label={`Keterangan foto ${index + 1}`}
                className={captionClass}
              />
            ) : (
              <p className="mt-2 line-clamp-2 min-h-9 text-[11px] font-bold leading-4 text-ink/60">
                {photo.status === "loading" ? photo.name ?? "Foto" : ""}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onMove(photo.id, -1)}
                disabled={index === 0}
                aria-label={`Geser foto ${index + 1} ke kiri`}
                className={arrowClass}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => onMove(photo.id, 1)}
                disabled={index === photos.length - 1}
                aria-label={`Geser foto ${index + 1} ke kanan`}
                className={arrowClass}
              >
                →
              </button>
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                aria-label={`Hapus foto ${index + 1}`}
                className="ml-auto text-xs font-bold underline underline-offset-2 hover:no-underline"
              >
                hapus
              </button>
            </div>
          </figure>
        ))}

        {!full && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-4 border-dashed border-ink bg-lime/50 p-3 text-center text-sm font-bold transition hover:bg-lime focus-within:outline-3 focus-within:outline-offset-4 focus-within:outline-ink">
            + Tambah foto
            <input
              type="file"
              accept={PHOTO_ACCEPT}
              multiple
              className="sr-only"
              aria-label="Tambah foto"
              onChange={(event) => {
                onFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        )}

        {full && (
          <div className="grid aspect-square place-items-center rounded-xl border-4 border-dashed border-ink bg-paper p-3 text-center text-xs font-bold leading-5 text-ink/70">
            Penuh, {maxPhotos}/{maxPhotos}. Hapus satu buat ganti.
          </div>
        )}
      </div>

      {photos.length === 0 && (
        <p className="mt-3 text-xs font-bold leading-4 text-ink/60">
          Belum ada foto. Tambah kenangan pertamamu, ya.
        </p>
      )}
    </section>
  );
}
