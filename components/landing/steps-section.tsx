type Step = {
  title: string;
  description: string;
};

const STEPS: readonly Step[] = [
  {
    title: "Pilih momen",
    description:
      "Pilih momen dan desainnya. Lihat contohnya dulu, lalu sesuaikan ceritamu.",
  },
  {
    title: "Isi ceritamu",
    description:
      "Tulis cerita, tambah foto, musik, dan surat. Sunting kapan saja sebelum dikirim.",
  },
  {
    title: "Bayar & kirim",
    description:
      "Bayar sekali, lalu bagikan satu link. Penerima membukanya tanpa akun.",
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
          className="font-display text-4xl uppercase leading-10 text-ink sm:text-5xl sm:leading-none"
        >
          3 langkah, selesai.
        </h2>

        <ol className="mt-8 grid gap-7 md:mt-12 md:grid-cols-3 md:gap-6 lg:gap-8">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className={index === 1 ? "md:translate-y-7" : undefined}
            >
              <article className="flex h-full flex-col rounded-[1.5rem] border-4 border-ink bg-white p-6 shadow-[8px_8px_0_#111] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[12px_12px_0_#111] sm:p-7 md:shadow-[10px_10px_0_#111]">
                <span className="grid size-14 place-items-center rounded-full border-4 border-ink bg-lime font-display text-2xl font-extrabold leading-none text-ink shadow-[3px_3px_0_#111] sm:size-16 sm:text-[1.75rem]">
                  {index + 1}
                </span>
                <h3 className="mt-7 font-display text-2xl font-extrabold uppercase leading-7 text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-bold leading-5 text-ink">
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
