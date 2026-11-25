import Link from "next/link";
import { SparkleIcon } from "@/components/ui/icons";

export function SurpriseExpired() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-plum-deep px-6 py-16 text-center text-cream">
      <div
        aria-hidden="true"
        className="bg-dots-dark pointer-events-none absolute inset-0 opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-rose/15 blur-3xl"
      />

      <div className="relative max-w-md">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <SparkleIcon className="size-5 text-cream/35" />
        </span>
        <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-cream/40">
          Kejutan ini telah berakhir
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
          Halaman sudah tidak aktif.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-cream/55">
          Halaman kejutan hanya bisa dibuka selama masa aktif paket yang dipilih pengirim.
          Hubungi pengirim bila kamu masih ingin membukanya.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex rounded-full bg-cream px-6 py-3.5 text-sm font-semibold text-plum-deep transition-colors hover:bg-white"
        >
          Kunjungi SuprizeGo
        </Link>
      </div>
    </main>
  );
}
