import { LockIcon } from "@/components/ui/icons";
import {
  formatSpecialDayDate,
  type SpecialDayId,
  type SpecialDayOccurrence,
} from "@/lib/special-days";

type SpecialDaySectionProps = {
  occurrences: SpecialDayOccurrence[];
  value: SpecialDayId | null;
  onChange: (id: SpecialDayId | null) => void;
};

export function SpecialDaySection({ occurrences, value, onChange }: SpecialDaySectionProps) {
  const activeDay = occurrences.find((item) => item.status === "musim") ?? null;

  return (
    <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
      <div>
        <h2 className="font-display text-2xl uppercase leading-8">Hari spesial</h2>
        <p className="mt-1 text-sm font-bold leading-5 text-ink/65">
          (opsional, tema ikut ke semua bagian halaman)
        </p>
      </div>

      <div
        role="group"
        aria-label="Pilih hari spesial"
        className="mt-5 flex flex-wrap gap-3"
      >
        <button
          type="button"
          aria-pressed={value === null}
          onClick={() => onChange(null)}
          className={`inline-flex min-h-11 items-center rounded-full border-[3px] px-4 py-2 font-mono text-xs font-bold leading-4 transition focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink ${
            value === null
              ? "border-ink bg-ink text-paper shadow-[3px_3px_0_#B6F22E]"
              : "border-ink bg-paper text-ink hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#111]"
          }`}
        >
          Biasa saja
        </button>

        {activeDay ? (
          <button
            type="button"
            aria-pressed={value === activeDay.day.id}
            onClick={() => onChange(activeDay.day.id)}
            className={`inline-flex min-h-11 flex-wrap items-center gap-2 rounded-full border-[3px] px-4 py-2 font-mono text-xs font-bold leading-4 transition focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink ${
              value === activeDay.day.id
                ? "-translate-y-0.5 border-4 border-ink bg-candy text-ink shadow-[4px_4px_0_#111]"
                : "border-ink bg-candy/70 text-ink hover:-translate-y-0.5 hover:bg-candy"
            }`}
          >
            <span aria-hidden="true">{activeDay.day.emoji}</span>
            <span>{activeDay.day.nama}</span>
            <span className="rounded-full border-2 border-ink bg-lime px-2 py-0.5 font-display text-[9px] uppercase leading-3 tracking-[0.04em]">
              lagi musim
            </span>
          </button>
        ) : null}

        {occurrences
          .filter((item) => item.day.id !== activeDay?.day.id)
          .map((item) => (
            <button
              key={item.day.id}
              type="button"
              disabled
              aria-label={`${item.day.nama} terkunci, dibuka ${formatSpecialDayDate(item.tanggalBuka)}`}
              className="inline-flex min-h-11 cursor-not-allowed flex-wrap items-center gap-2 rounded-full border-[3px] border-ink/30 bg-ink/[0.04] px-4 py-2 font-mono text-xs font-bold leading-4 text-ink/45"
            >
              <LockIcon className="size-3.5 shrink-0" />
              <span>{item.day.nama}</span>
              <span className="text-[10px] leading-4">buka {formatSpecialDayDate(item.tanggalBuka)}</span>
            </button>
          ))}
      </div>
    </section>
  );
}
