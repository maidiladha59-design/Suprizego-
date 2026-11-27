"use client";

import type { ReactNode } from "react";

export const MAX_LETTER_LENGTH = 1500;

export function LetterSection({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
          7
        </span>
        <h2 className="font-display text-2xl uppercase leading-8">Surat penutup</h2>
      </div>

      <label className="mt-5 block">
        <span className="sr-only">Surat penutup</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_LETTER_LENGTH))}
          maxLength={MAX_LETTER_LENGTH}
          rows={6}
          aria-describedby="surat-penutup-hitung"
          placeholder="Kalau ada hal yang belum sempat kamu bilang, tulis di sini. Nggak harus panjang."
          className="min-h-40 w-full rounded-[14px] border-4 border-ink bg-white px-4 py-3 text-base font-normal leading-6 text-ink placeholder:text-ink-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </label>

      <p
        id="surat-penutup-hitung"
        className="mt-2 text-right text-[11px] font-bold leading-4 tabular-nums text-ink-soft"
      >
        {value.length}/{MAX_LETTER_LENGTH}
      </p>

      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
