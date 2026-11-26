type Feature = {
  title: string;
  description: string;
  theme: string;
};

const FEATURES: readonly Feature[] = [
  {
    title: "Coba dulu",
    description:
      "Mainkan contoh halaman gratis, tanpa perlu menyiapkan apa pun.",
    theme: "bg-lime",
  },
  {
    title: "Gerak halus",
    description:
      "Sampul berganti ke cerita dengan transisi yang lembut.",
    theme: "bg-paper",
  },
  {
    title: "Musik & foto",
    description:
      "Pilih lagu, susun foto kenangan, dan tulis surat.",
    theme: "bg-candy",
  },
  {
    title: "Satu tautan",
    description:
      "Penerima buka link dari WhatsApp atau DM tanpa akun.",
    theme: "bg-tangerine",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="fitur"
      aria-labelledby="fitur-title"
      className="border-b-4 border-ink bg-paper"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <h2
          id="fitur-title"
          className="font-display text-4xl uppercase leading-10 text-ink sm:text-5xl sm:leading-none"
        >
          Bukan sekadar link.
        </h2>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="h-full">
              <article
                className={`flex h-full flex-col rounded-[1.25rem] border-4 border-ink p-5 shadow-[6px_6px_0_#111] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[9px_9px_0_#111] ${feature.theme}`}
              >
                <h3 className="font-display text-2xl font-extrabold uppercase leading-7 text-ink">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm font-bold leading-5 text-ink">
                  {feature.description}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
