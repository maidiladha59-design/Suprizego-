"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { ArrowRightIcon, CheckIcon, DownloadIcon, SparkleIcon } from "@/components/ui/icons";
import { formatRupiah } from "@/lib/pricing";
import type { PaymentResult } from "@/lib/payment-result";

const actionClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border-[3px] border-ink px-4 font-display text-sm uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink active:translate-x-1 active:translate-y-1 active:shadow-none";

function formatDate(value: string | null) {
  if (!value) return "Selamanya";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function PaymentResultView({
  result,
  qrDataUrl,
}: {
  result: PaymentResult;
  qrDataUrl: string | null;
}) {
  const router = useRouter();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (result.status !== "pending") return;
    const timer = window.setInterval(() => router.refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [result.status, router]);

  async function copyLink() {
    if (result.status !== "active") return;
    try {
      await navigator.clipboard.writeText(result.pageUrl);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  if (result.status === "active") {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `Ada kejutan buat kamu di SuprizeGo. Buka ya: ${result.pageUrl}`,
    )}`;
    return (
      <main className="min-h-svh bg-paper bg-dots-soft px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-2xl">
          <Brand size="lg" />
          <section className="mt-8 rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-8">
            <span className="grid size-12 place-items-center rounded-2xl border-[3px] border-ink bg-lime">
              <CheckIcon className="size-6" />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase leading-4 tracking-[0.12em]">
              Pembayaran terverifikasi
            </p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-10 sm:text-5xl sm:leading-12">
              Kejutanmu siap.
            </h1>
            <p className="mt-3 text-sm font-bold leading-6">
              Kirim tautan ini ke orang yang kamu buatkan kejutan.
            </p>

            <label htmlFor="tautan-kejutan" className="mt-6 block text-xs font-bold uppercase leading-4 tracking-[0.04em]">
              Tautan kejutan
            </label>
            <input
              id="tautan-kejutan"
              readOnly
              value={result.pageUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-2 h-12 w-full rounded-xl border-[3px] border-ink bg-paper px-3 text-xs font-bold leading-4 text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => void copyLink()} className={`${actionClass} bg-lime`}>
                {copyState === "copied" ? "Tautan disalin" : "Salin tautan"}
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} bg-paper`}>
                Bagikan WhatsApp <ArrowRightIcon className="size-4" />
              </a>
            </div>
            <p role="status" aria-live="polite" className="mt-3 min-h-4 text-xs font-bold leading-4">
              {copyState === "copied"
                ? "Tautan sudah ada di clipboard."
                : copyState === "error"
                  ? "Clipboard tidak tersedia. Salin tautan dari kolom di atas."
                  : ""}
            </p>

            {qrDataUrl ? (
              <figure className="mx-auto mt-7 w-full max-w-[280px] rounded-2xl border-4 border-ink bg-lime p-4 shadow-[6px_6px_0_0_#111]">
                <div className="rounded-xl border-2 border-ink bg-white p-2">
                  <Image
                    src={qrDataUrl}
                    alt="Kode QR tautan kejutan"
                    width={240}
                    height={240}
                    unoptimized
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 text-center font-display text-sm uppercase leading-5">
                  Pindai untuk membuka
                </figcaption>
                <a
                  href={qrDataUrl}
                  download="suprizego-qr.png"
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white text-[11px] font-bold uppercase leading-4"
                >
                  <DownloadIcon className="size-4" /> Unduh QR
                </a>
              </figure>
            ) : null}

            <dl className="mt-7 grid gap-3 rounded-xl border-[3px] border-ink bg-paper p-4 text-xs font-bold leading-5 sm:grid-cols-3">
              <div>
                <dt className="text-ink-soft">Paket</dt>
                <dd className="mt-1">{result.planName}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Total bayar</dt>
                <dd className="mt-1">{formatRupiah(result.grossAmount)}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Aktif sampai</dt>
                <dd className="mt-1">{formatDate(result.activeUntil)}</dd>
              </div>
            </dl>
            <p className="mt-3 break-all text-[10px] font-bold leading-4 text-ink-soft">
              Order {result.orderId}
            </p>
            <Link href={result.pageUrl} className={`${actionClass} mt-6 w-full bg-ink text-paper`}>
              Buka halaman kejutan <ArrowRightIcon className="size-4" />
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const pending = result.status === "pending";
  const title =
    pending
      ? "Pembayaran sedang diproses."
      : result.status === "expired"
        ? "Masa aktif halaman habis."
        : result.status === "not-found"
          ? "Status pembayaran tidak ditemukan."
          : "Pembayaran belum selesai.";
  const description = pending
    ? "Jangan tutup halaman ini. Status akan diperbarui otomatis setelah Midtrans mengirim konfirmasi."
    : result.status === "expired"
      ? "Pembayaran sudah diterima, tetapi masa aktif halaman ini sudah lewat."
      : result.status === "not-found"
        ? "Periksa kembali tautan dari pembayaranmu atau hubungi pengelola SuprizeGo."
        : "Halaman belum diaktifkan. Kamu dapat kembali ke editor dan mencoba pembayaran lagi.";

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-plum-deep px-6 py-16 text-center text-cream">
      <div aria-hidden="true" className="bg-dots-dark pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative w-full max-w-md">
        <Brand tone="cream" size="lg" className="justify-center" />
        <span className="mx-auto mt-10 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <SparkleIcon className="size-5 text-cream" />
        </span>
        <p className="mt-7 text-[11px] uppercase tracking-[0.24em] text-cream" role="status" aria-live="polite">
          {pending ? "Menunggu konfirmasi Midtrans" : "Status kejutan"}
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-10 sm:text-5xl sm:leading-12">{title}</h1>
        <p className="mt-4 text-sm font-bold leading-6 text-cream">{description}</p>
        <p className="mt-5 break-all text-[10px] font-bold leading-4 text-cream">Order {result.orderId}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          {result.status === "failed" && result.moment ? (
            <Link href={`/buat/${result.moment}`} className="inline-flex rounded-full bg-cream px-6 py-3.5 text-sm font-semibold text-plum-deep transition-colors hover:bg-white">
              Coba bayar lagi
            </Link>
          ) : null}
          <Link href="/" className="inline-flex rounded-full bg-cream px-6 py-3.5 text-sm font-semibold text-plum-deep transition-colors hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-cream">
            Kembali ke SuprizeGo
          </Link>
        </div>
      </div>
    </main>
  );
}
