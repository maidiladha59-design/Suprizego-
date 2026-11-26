import { FAQ_ITEMS } from "@/lib/faq";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-cream">
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <h2 className="font-display text-4xl uppercase leading-10 sm:text-5xl sm:leading-none">
          Masih penasaran?
        </h2>

        <div className="mt-8 space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="rounded-card border-4 border-ink bg-white p-5 shadow-[5px_5px_0_0_#111] transition-shadow duration-150 hover:shadow-[7px_7px_0_0_#111] motion-reduce:transition-none"
            >
              <summary className="cursor-pointer list-none font-display text-lg leading-7 text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
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
