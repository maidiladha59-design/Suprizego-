type Step = {
  title: string;
  description: string;
};

const STEPS: readonly Step[] = [
  {
    title: "Pilih momen & tulis cerita",
    description:
      "Mulai dari pengakuan, ulang tahun, atau momen lain. Tulis cerita dan pesan yang paling ingin kamu sampaikan.",
  },
  {
    title: "Tambahkan foto, musik, dan surat",
    description:
      "Susun galeri kenangan, pilih lagu yang tepat, lalu tulis surat yang akan dibaca penerima di akhir halaman.",
  },
  {
    title: "Kirim lewat satu link",
    description:
      "Salin link kejutanmu, lalu kirim lewat WhatsApp, DM, atau pesan apa pun. Penerima tinggal membukanya.",
  },
];

export function StepsSection() {
  return (
    <section
      id="cara-kerja"
      aria-labelledby="cara-kerja-title"
      className="scroll-mt-24 border-y-4 border-ink bg-candy bg-dots-candy"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <h2
          id="cara-kerja-title"
          className="font-display text-[2.15rem] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-ink sm:text-5xl"
        >
          Tiga langkah, satu kejutan.
        </h2>

        <ol className="mt-10 grid gap-7 md:mt-12 md:grid-cols-3 md:gap-6 lg:gap-8">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className={index === 1 ? "md:translate-y-7" : undefined}
            >
              <article className="flex h-full flex-col rounded-[1.5rem] border-4 border-ink bg-white p-6 shadow-[8px_8px_0_#111] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[12px_12px_0_#111] sm:p-7 md:shadow-[10px_10px_0_#111]">
                <span className="grid size-14 place-items-center rounded-full border-4 border-ink bg-lime font-display text-2xl font-extrabold leading-none text-ink shadow-[3px_3px_0_#111] sm:size-16 sm:text-[1.75rem]">
                  {index + 1}
                </span>
                <h3 className="mt-7 font-display text-[1.4rem] font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-ink sm:text-[1.5rem]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-ink/80">
                  {step.description}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
