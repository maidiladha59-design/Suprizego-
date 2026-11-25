import { MOMENTS } from "@/lib/moments";

const LABELS = MOMENTS.map((moment) => moment.label);

function MarqueeGroup() {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
      {[...LABELS, ...LABELS].map((label, index) => (
        <div key={`${label}-${index}`} className="flex shrink-0 items-center gap-8 sm:gap-12">
          <span className="font-display text-[1.3rem] font-extrabold uppercase leading-none tracking-[0.01em] text-lime sm:text-[1.85rem]">
            {label}
          </span>
          <span className="text-[0.85em] leading-none text-lime">✦</span>
        </div>
      ))}
    </div>
  );
}

export function MarqueeBand() {
  return (
    <section className="overflow-hidden bg-ink py-4 text-lime">
      <h2 className="sr-only">
        Lima momen: {LABELS.join(", ")}
      </h2>
      <div className="animate-marquee flex w-max" aria-hidden="true">
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </section>
  );
}
