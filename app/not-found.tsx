import Link from "next/link";
import { Brand } from "@/components/brand";
import { ArrowRightIcon, SparkleIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-cream px-6 py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-blush/60 blur-3xl" />
        <div className="absolute -bottom-24 right-0 size-80 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative flex justify-center">
        <Brand />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          <SparkleIcon className="size-3 text-rose" />
          404 · Tautan tidak ditemukan
        </span>
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight tracking-tight text-ink sm:text-6xl">
          Kejutan ini tidak ada di sini.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Link mungkin salah ketik, sudah kedaluwarsa, atau belum pernah diterbitkan. Coba periksa
          kembali tautan yang kamu terima.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-plum"
          >
            Kembali ke beranda
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/#momen"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/50 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-white/80"
          >
            Lihat pilihan momen
          </Link>
        </div>
      </div>
    </main>
  );
}
