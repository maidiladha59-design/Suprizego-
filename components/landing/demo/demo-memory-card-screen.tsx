"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { saveDemoMemoryImage } from "@/lib/demo-memory-image";
import { DemoButton } from "./demo-controls";

const INK = "#111111";
const PAPER = "#FFF4E0";
const LIME = "#B6F22E";
const PINK = "#FF8FB8";
const CORAL = "#FF6A3D";
const WHITE = "#FFFFFF";

export function DemoMemoryCardScreen({
  date,
  score,
}: {
  date: string;
  score: number | null;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const cardId = useId();
  const titleId = `${cardId}-title`;
  const descriptionId = `${cardId}-description`;
  const cardDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase();

  function reportStatus(message: string) {
    setStatus(message);
  }

  function isShareCancellation(error: unknown) {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    );
  }

  async function shareDemo() {
    const url = window.location.href;
    reportStatus("");

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Kartu Kenangan Bima & Sekar",
          text: "Coba demo SuprizeGo dan bikin kartu kenangan buat orang favoritmu.",
          url,
        });
        reportStatus("Demo dibagikan.");
        return;
      } catch (error: unknown) {
        if (isShareCancellation(error)) return;
      }
    }

    if (typeof navigator.clipboard?.writeText === "function") {
      try {
        await navigator.clipboard.writeText(url);
        reportStatus("Tautan demo disalin.");
        return;
      } catch {
        // Izin clipboard bisa ditolak; tampilkan status gagal di bawah.
      }
    }

    reportStatus("Tautan belum bisa disalin di browser ini.");
  }

  async function saveImage() {
    if (isSaving) return;

    setIsSaving(true);
    reportStatus("");

    try {
      await saveDemoMemoryImage(svgRef);
      reportStatus("Gambar kenangan tersimpan.");
    } catch {
      reportStatus("Gambar belum bisa disimpan di browser ini.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      data-demo-screen="memory"
      className="demo-rise flex min-h-0 flex-1 flex-col items-center px-4 pb-10 pt-2 text-center"
    >
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-current opacity-80">
        Kartu kenangan kalian
      </h2>

      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 640"
        width={360}
        height={640}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        className="block h-auto w-full max-w-[296px]"
        fill="none"
        stroke={INK}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <title id={titleId}>Kartu kenangan Bima dan Sekar</title>
        <desc id={descriptionId}>
          Dua polaroid Bima dan Sekar di langit senja dan warung bakso. Sekar
          menjawab MAU. {date ? `Rencana mereka: ${date}.` : "Rencana belum dipilih."}
          {score !== null ? ` Skor kuis mereka ${score} dari 2.` : ""}
        </desc>

        <g transform="scale(0.5625 0.592592)">
        <rect x="22" y="24" width="596" height="1040" rx="34" fill={INK} stroke="none" />
        <rect x="14" y="12" width="596" height="1040" rx="34" fill={PINK} strokeWidth="6" />

        <rect x="48" y="54" width="120" height="44" rx="22" fill={CORAL} strokeWidth="4" />
        <text
          x="108"
          y="83"
          fill={INK}
          stroke="none"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="18"
          fontWeight="900"
          letterSpacing="2"
          textAnchor="middle"
        >
          BERDUA
        </text>
        <rect x="438" y="58" width="154" height="34" rx="6" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="7 5" />
        <text
          x="515"
          y="81"
          suppressHydrationWarning
          fill={INK}
          stroke="none"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
        >
          {cardDate}
        </text>
        <path d="m564 118 5 12 13 5-13 5-5 13-5-13-13-5 13-5Z" fill={LIME} strokeWidth="4" />
        <path d="M72 126c-14-9-19-15-19-23 0-9 11-12 19-3 8-9 19-6 19 3 0 8-5 14-19 23Z" fill={PAPER} strokeWidth="3" />

        <g transform="rotate(-5 173 290)">
          <rect x="58" y="150" width="250" height="288" rx="8" fill={INK} stroke="none" />
          <rect x="48" y="140" width="250" height="288" rx="8" fill={WHITE} strokeWidth="6" />
          <rect x="126" y="126" width="94" height="24" rx="3" fill={CORAL} strokeWidth="3" transform="rotate(-4 173 138)" />
          <rect x="61" y="153" width="224" height="192" rx="3" fill={CORAL} strokeWidth="4" />
          <circle cx="207" cy="204" r="43" fill={PAPER} strokeWidth="4" />
          <path d="M78 199h28M92 187v24" stroke={PAPER} strokeWidth="5" />
          <path d="M61 273c37-31 69-24 108 2s74 29 116-4v74H61Z" fill={PINK} strokeWidth="4" />
          <path d="M61 311c39-25 73-14 111 4s80 21 113-2v32H61Z" fill={LIME} strokeWidth="4" />
          <path d="m86 230 6 5 8-2M239 236l6 5 8-2" strokeWidth="3" />
          <g fill={INK} stroke="none">
            <circle cx="132" cy="246" r="16" />
            <path d="M116 243c1-18 29-20 32-2l-8-5-8 2-8-2Z" />
            <rect x="126" y="260" width="12" height="12" />
            <path d="M111 265q21-12 42 0l10 66h-62Z" />
            <circle cx="203" cy="232" r="8" />
            <circle cx="194" cy="248" r="15" />
            <path d="M179 248c-2-19 29-23 31-3l-8-7-7 2-8-2Z" />
            <rect x="189" y="262" width="11" height="10" />
            <path d="M176 266q18-11 36 0l10 65h-56Z" />
          </g>
          <path d="M149 274c17-17 31-14 43-4" strokeWidth="9" />
          <path d="M180 253c4 3 8 3 12 0" stroke={PINK} strokeWidth="3" />
          <text x="173" y="379" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="900" textAnchor="middle">
            Sore yang kita tunggu
          </text>
          <text x="173" y="406" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="700" letterSpacing="1.5" textAnchor="middle">
            BIMA &amp; SEKAR
          </text>
        </g>

        <g transform="rotate(4 466 290)">
          <rect x="350" y="150" width="250" height="288" rx="8" fill={INK} stroke="none" />
          <rect x="340" y="140" width="250" height="288" rx="8" fill={WHITE} strokeWidth="6" />
          <rect x="418" y="126" width="94" height="24" rx="3" fill={LIME} strokeWidth="3" transform="rotate(4 465 138)" />
          <rect x="353" y="153" width="224" height="192" rx="3" fill={PAPER} strokeWidth="4" />
          <path d="M353 247c34-54 69-54 112 0s78 54 112 0v98H353Z" fill={PINK} strokeWidth="4" />
          <g fill={INK} stroke="none">
            <circle cx="390" cy="211" r="14" />
            <path d="M376 209c0-17 28-18 28 0l-7-4-7 2-7-2Z" />
            <path d="M373 228h34l12 59h-58Z" />
            <circle cx="545" cy="195" r="7" />
            <circle cx="536" cy="210" r="14" />
            <path d="M522 209c-1-18 28-19 29-1l-8-6-7 2-7-2Z" />
            <path d="M519 228h34l14 59h-62Z" />
          </g>
          <rect x="353" y="281" width="224" height="64" fill={LIME} strokeWidth="4" />
          <path d="M440 250c-9-9 9-13 0-22M465 250c-9-9 9-13 0-22M490 250c-9-9 9-13 0-22" stroke={CORAL} strokeWidth="4" />
          <path d="m510 234 45 40M517 231l44 38" strokeWidth="4" />
          <path d="M393 271c5 43 37 67 72 67s67-24 72-67Z" fill={CORAL} strokeWidth="5" />
          <ellipse cx="465" cy="271" rx="72" ry="19" fill={PAPER} strokeWidth="5" />
          <ellipse cx="465" cy="270" rx="60" ry="12" fill={CORAL} stroke="none" />
          <path d="M416 269c9-8 15 7 24 0s15 7 24 0 15 7 24 0 15 7 24 0" stroke={PAPER} strokeWidth="3" />
          <g fill={INK} stroke="none">
            <circle cx="439" cy="267" r="8" />
            <circle cx="465" cy="272" r="8" />
            <circle cx="491" cy="267" r="8" />
          </g>
          <path d="m425 261 6-4 6 4-6 4ZM480 261l6-4 6 4-6 4Z" fill={LIME} strokeWidth="2" />
          <text x="465" y="379" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="900" textAnchor="middle">
            Bakso langganan
          </text>
          <text x="465" y="406" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="700" letterSpacing="1" textAnchor="middle">
            ALASAN BUAT KETEMU LAGI
          </text>
        </g>

        <path d="M320 438 306 424a10 10 0 0 1 14-11 10 10 0 0 1 14 11Z" fill={CORAL} strokeWidth="4" transform="rotate(-12 320 430)" />

        <text x="48" y="490" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="900" letterSpacing="3">
          UNTUK
        </text>
        <text x="48" y="545" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="48" fontWeight="900" letterSpacing="1">
          SEKAR
        </text>
        <g transform="translate(524 472) rotate(8)">
          <rect x="0" y="18" width="68" height="46" rx="6" fill={PAPER} strokeWidth="4" />
          <path d="m2 20 32 23 32-23M2 62l22-20m42 20L44 42" strokeWidth="4" />
          <path d="M34 41c-8-5-4-12 0-7 4-5 8 2 0 7Z" fill={CORAL} strokeWidth="2" />
        </g>

        <rect x="50" y="590" width="556" height="190" rx="16" fill={INK} stroke="none" transform="rotate(1 320 677)" />
        <rect x="42" y="582" width="556" height="190" rx="16" fill={PAPER} strokeWidth="4" transform="rotate(1 320 677)" />
        <rect x="48" y="590" width="142" height="36" rx="18" fill={LIME} strokeWidth="4" />
        <text x="119" y="614" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="900" letterSpacing="2" textAnchor="middle">
          SURATNYA
        </text>
        <text x="48" y="660" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="700">
          Terima kasih sudah nemenin hari biasa
        </text>
        <text x="48" y="688" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="700">
          jadi cerita favorit Bima. Masih mau
        </text>
        <text x="48" y="716" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="700">
          buat lanjut bareng?
        </text>
        <text x="592" y="752" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="900" textAnchor="end">
          — BIMA
        </text>

        <path d="m61 797 5 12 13 5-13 5-5 13-5-13-13-5 13-5ZM402 795l4 10 11 4-11 4-4 11-4-11-11-4 11-4Z" fill={LIME} strokeWidth="3" />
        <rect x="80" y="780" width="320" height="48" rx="24" fill={LIME} strokeWidth="4" />
        <text x="240" y="811" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="900" letterSpacing="1" textAnchor="middle">
          JAWABANNYA: MAU
        </text>

        {score !== null ? (
          <g>
            <rect x="48" y="852" width="200" height="44" rx="12" fill={WHITE} strokeWidth="2" strokeDasharray="7 5" />
            <text x="148" y="880" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="900" textAnchor="middle">
              KUIS: {score}/2 BENAR
            </text>
          </g>
        ) : null}
        {date ? (
          <g>
            <rect x={score !== null ? 264 : 48} y="852" width={score !== null ? 328 : 544} height="44" rx="12" fill={WHITE} strokeWidth="2" strokeDasharray="7 5" />
            <text x={score !== null ? 428 : 320} y="880" fill={INK} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="900" textAnchor="middle">
              JANJI: {date.toUpperCase()}
            </text>
          </g>
        ) : null}

        <rect x="14" y="974" width="596" height="78" fill={INK} stroke="none" />
        <text x="48" y="1022" fill={PAPER} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" letterSpacing="1">
          SUPRIZEGO
        </text>
        <text x="576" y="1020" fill={PAPER} stroke="none" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="700" textAnchor="end">
          cerita kecil, dibuat bareng.
        </text>
        </g>
      </svg>

      <div className="mt-6 flex flex-col items-center gap-4">
        <DemoButton
          type="button"
          tone="ink"
          size="lg"
          className="w-full max-w-[296px]"
          onClick={() => void shareDemo()}
        >
          Bagikan demo
        </DemoButton>

        <DemoButton
          type="button"
          tone="cream"
          className="w-full max-w-[296px]"
          onClick={() => void saveImage()}
          disabled={isSaving}
          aria-busy={isSaving}
        >
          Simpan jadi gambar
        </DemoButton>

        <Link
          href="/buat"
          className="inline-flex h-[59px] w-full max-w-[296px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-4 border-ink bg-lime px-3 font-display text-base uppercase leading-none tracking-[0.01em] text-ink shadow-[6px_6px_0_0_#111] transition-[translate,box-shadow,background] duration-[120ms] hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Bikin juga buat dia <span aria-hidden="true">→</span>
        </Link>

        {status ? (
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="text-center text-[11px] font-bold leading-4 text-current"
          >
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
