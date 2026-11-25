import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { FAQ_ITEMS } from "@/lib/faq";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-cream">
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.22em]">✦ FAQ</p>
        <h2 className="mt-3 font-display text-4xl uppercase leading-[1.11] sm:text-5xl sm:leading-none">
          Pertanyaan yang sering muncul.
        </h2>
        <p className="mt-3 text-base leading-6">
          Hal-hal yang biasanya ditanyakan sebelum kejutan pertama dikirim.
        </p>
        <Link
          href="/contoh/anniversary"
          className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-bold underline decoration-2 underline-offset-4 transition-colors hover:bg-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Lihat contoh halaman
          <ArrowRightIcon className="size-4" />
        </Link>

        <div className="mt-8 space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="rounded-card border-4 border-ink bg-white p-5 shadow-[5px_5px_0_0_#111] transition-shadow duration-150 hover:shadow-[7px_7px_0_0_#111] motion-reduce:transition-none"
            >
              <summary className="cursor-pointer list-none font-display text-lg text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
                {item.question}
              </summary>
              <p className="mt-3 text-sm font-bold leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
