type Feature = {
  title: string;
  description: string;
  theme: string;
};

const FEATURES: readonly Feature[] = [
  {
    title: "Coba dulu",
    description:
      "Buka contoh halaman dan mainkan demonya. Gratis, tanpa perlu menyiapkan apa pun.",
    theme: "bg-lime",
  },
  {
    title: "Gerak halus",
    description:
      "Sampul berganti ke cerita dengan transisi lembut, bukan lompatan mendadak.",
    theme: "bg-paper",
  },
  {
    title: "Musik & foto",
    description:
      "Putar lagu pilihan, susun foto kenangan, lalu tulis surat di halaman yang sama.",
    theme: "bg-candy",
  },
  {
    title: "Satu tautan",
    description:
      "Penerima cukup membuka link dari WhatsApp atau DM. Tanpa akun, tanpa unduh aplikasi.",
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
          className="font-display text-[2.15rem] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-ink sm:text-5xl"
        >
          Bukan tautan biasa.
        </h2>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="h-full">
              <article
                className={`flex h-full flex-col rounded-[1.25rem] border-4 border-ink p-5 shadow-[6px_6px_0_#111] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[9px_9px_0_#111] ${feature.theme}`}
              >
                <h3 className="font-display text-[1.35rem] font-extrabold uppercase leading-none tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-ink/80">
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
