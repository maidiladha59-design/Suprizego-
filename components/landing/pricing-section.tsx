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
        <h2 className="font-display text-4xl uppercase leading-10 sm:text-5xl sm:leading-none">
          Harganya ringan.
        </h2>
        <p className="mt-3 text-base font-bold leading-6">
          Sekali bayar. Beda paket, beda lama aktif.
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
                <span className="sticker absolute -top-4 right-4 z-10 rotate-[-4deg] bg-candy px-3.5 py-2 text-sm text-ink">
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="font-display text-3xl uppercase leading-9">{plan.name}</h3>
              <p className="text-sm font-bold leading-5">{plan.tagline}</p>

              <p className="mt-4 flex flex-wrap items-baseline gap-x-2 font-display text-4xl leading-10">
                {plan.priceBefore ? (
                  <s className="text-xl opacity-50">{formatRupiah(plan.priceBefore)}</s>
                ) : null}
                <span>{formatRupiah(plan.price)}</span>
                {plan.discount ? (
                  <span
                    className="sticker rotate-2 bg-tangerine px-[11.2px] py-[4.7px] text-center text-[10px] leading-[15px] normal-case text-white"
                    style={{ display: "block" }}
                  >
                    {plan.discount}
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold normal-case leading-5">
                  {plan.activeLabel.toLowerCase()}
                </span>
              </div>

              <ul className="mt-5 flex-1 space-y-2 text-sm font-bold leading-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span aria-hidden="true">+</span>
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
      </div>
    </section>
  );
}
