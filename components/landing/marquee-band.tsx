import { SparkleIcon } from "@/components/ui/icons";
import { MOMENTS } from "@/lib/moments";

const LABELS = MOMENTS.map((moment) => moment.label);

function MarqueeGroup() {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
      {[...LABELS, ...LABELS].map((label, index) => (
        <div key={`${label}-${index}`} className="flex shrink-0 items-center gap-8 sm:gap-12">
          <span className="font-display text-[1.5rem] font-extrabold uppercase leading-7 tracking-[0.01em] text-lime sm:text-[1.85rem]">
            {label}
          </span>
          <SparkleIcon className="size-4 text-lime" />
        </div>
      ))}
    </div>
  );
}

export function MarqueeBand() {
  return (
    <section className="overflow-hidden border-b-4 border-ink bg-ink py-3 text-lime">
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
