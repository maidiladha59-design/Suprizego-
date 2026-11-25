import Link from "next/link";
import { PLANS, formatRupiah } from "@/lib/plans";

const CARD_BASE =
  "relative flex flex-col rounded-card border-4 border-ink p-6 text-ink shadow-hard-lg transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#111] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-hard-lg";

export function PricingSection() {
  return (
    <section
      id="harga"
      className="scroll-mt-24 border-y-4 border-ink bg-lime bg-[repeating-linear-gradient(45deg,rgba(17,17,17,0.07)_0px,rgba(17,17,17,0.07)_14px,transparent_14px,transparent_28px)]"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.22em]">✦ Harga</p>
        <h2 className="mt-3 font-display text-4xl uppercase leading-[1.11] sm:text-5xl sm:leading-none">
          Pilih sesuai umur kejutannya.
        </h2>
        <p className="mt-3 text-base leading-6">
          Sekali bayar, tanpa langganan. Paket lebih panjang membuka lebih banyak — dari Main
          Berdua ekstra sampai halaman yang aktif selamanya.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`${CARD_BASE} ${
                plan.highlight
                  ? "bg-white lg:-translate-y-4 lg:hover:-translate-y-5 lg:motion-reduce:hover:-translate-y-4"
                  : "bg-cream"
              }`}
            >
              {plan.badge ? (
                <span className="sticker absolute -top-4 right-4 z-10 rotate-[-4deg] bg-lime px-3.5 py-2 text-sm text-ink">
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="font-display text-[1.875rem] uppercase leading-[1.2]">{plan.name}</h3>
              <p className="mt-1 text-sm font-bold leading-[1.45]">{plan.tagline}</p>

              <p className="mt-4 flex flex-wrap items-baseline gap-x-2 font-display text-4xl leading-[1.1]">
                {plan.priceBefore ? (
                  <s className="text-xl opacity-50">{formatRupiah(plan.priceBefore)}</s>
                ) : null}
                <span>{formatRupiah(plan.price)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex w-fit items-center rounded-full border-[3px] border-ink px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] ${
                    plan.highlight ? "bg-lime" : "bg-white"
                  }`}
                >
                  {plan.activeLabel}
                </span>
                {plan.discount ? (
                  <span className="sticker rotate-2 bg-tangerine px-2 py-0.5 text-[10px] text-white">
                    {plan.discount}
                  </span>
                ) : null}
              </div>

              <ul className="mt-5 space-y-3.5 text-sm leading-[1.4]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span aria-hidden="true">✦</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link
                  href={`/buat?paket=${plan.id}`}
                  className={`nb-btn w-full px-6 py-[0.85rem] text-base text-ink shadow-[6px_6px_0_0_#111] ${
                    plan.highlight ? "bg-lime" : "bg-cream"
                  }`}
                >
                  Pilih {plan.name}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed">
          Harga dalam Rupiah. Pembayaran QRIS dan e-wallet segera tersedia.
        </p>
      </div>
    </section>
  );
}
