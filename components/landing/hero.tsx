import Link from "next/link";
import { getPlan } from "@/lib/plans";
import { HeroDemo } from "./hero-demo";

const startingPrice = `${(getPlan("dasar").price / 1000).toLocaleString("id-ID")} ribu`;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-4 border-ink bg-lime bg-stripes">
      <div className="mx-auto grid w-full max-w-6xl gap-x-12 gap-y-10 px-4 py-14 md:grid-cols-[1.08fr_1fr] md:py-20">
        <div className="animate-rise md:self-center">
          <span className="sticker -rotate-2 bg-candy px-3 py-2 text-[13px] sm:text-sm">
            Halaman kejutan interaktif
          </span>

          <h1 className="mt-5 font-display text-[2.75rem] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-ink sm:text-6xl lg:text-7xl">
            <span className="block">Tak perlu</span>
            <span className="block">pidato.</span>
            <span className="mt-2 inline-block rotate-[-1.5deg] rounded-2xl border-4 border-ink bg-paper px-3 pb-1 pt-0.5 shadow-[6px_6px_0_#111] sm:px-4">
              Cukup satu link.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base font-semibold leading-7 text-ink sm:text-lg sm:leading-8">
            Rangkai cerita, foto, musik, dan surat dalam satu halaman. Kirim lewat tautan —
            penerima cukup membuka, tanpa akun atau aplikasi.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 md:flex-row md:flex-wrap md:items-center">
            <Link
              href="/buat"
              className="nb-btn bg-ink px-6 py-[13.6px] text-lg leading-7 text-paper shadow-[6px_6px_0_#B6F22E] hover:shadow-[8px_8px_0_#B6F22E]"
            >
              Bikin Halaman
            </Link>
            <Link
              href="#momen"
              className="nb-btn bg-paper px-6 py-[13.6px] text-lg leading-7 text-ink shadow-[6px_6px_0_#111] hover:shadow-[8px_8px_0_#111]"
            >
              Lihat Momen
            </Link>
            <span
              className="sticker -rotate-3 bg-candy px-[11.2px] py-[3.2px] text-sm"
              style={{ display: "inline-block", fontWeight: 400, letterSpacing: "normal", lineHeight: "20px" }}
            >
              Mulai {startingPrice}
            </span>
          </div>
        </div>

        <HeroDemo />
      </div>
    </section>
  );
}
