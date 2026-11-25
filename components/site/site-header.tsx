"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { CHROME_COPY } from "@/lib/i18n";

export function SiteHeader() {
  const { lang } = useLanguage();
  const copy = CHROME_COPY[lang];

  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink bg-paper/95 backdrop-blur-[8px]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-gutter py-3">
        <Brand />
        <Link
          href="/buat"
          className="inline-flex min-h-11 items-center justify-center rounded-btn border-[3px] border-ink bg-lime px-4 py-2 font-display text-[0.85rem] uppercase leading-[1.5] tracking-[0.01em] text-ink shadow-hard-md transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#111] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          {copy.cta}
        </Link>
      </div>
    </header>
  );
}
