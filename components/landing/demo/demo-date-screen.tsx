import { ArrowRightIcon } from "@/components/ui/icons";
import { DEMO_DATES } from "@/lib/demo-flow";
import { DemoButton } from "./demo-controls";

export function DemoDateScreen({
  onSelect,
  onSkip,
}: {
  onSelect: (date: string) => void;
  onSkip: () => void;
}) {
  return (
    <div
      data-demo-screen="date"
      className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center text-current"
    >
      <div className="w-full max-w-[296px]">
        <p className="mb-4 text-center">
          <span className="sticker -rotate-2 bg-tangerine px-3 py-1 text-xs text-ink">
            Main berdua · 2/2
          </span>
        </p>
        <div className="demo-rise">
          <div className="mb-4 text-center">
            <h2 className="font-display text-3xl uppercase leading-none tracking-[-0.03em]">
              Rencana bareng
            </h2>
            <p className="mt-1 text-sm font-bold opacity-80">
              Pilih satu buat kalian lakukan bareng.
            </p>
          </div>

          <div className="rounded-2xl border-4 border-ink bg-paper p-5 text-ink shadow-[5px_5px_0_0_#111]">
            <p className="break-words text-center font-display text-2xl leading-tight">
              Kalau jawabanmu mau, rencana pertama kita:
            </p>
            <div className="mt-4 grid gap-3">
              {DEMO_DATES.map((date, index) => (
                <DemoButton
                  key={date}
                  tone={index === 1 ? "coral" : "lime"}
                  size="lg"
                  onClick={() => onSelect(date)}
                  className="h-auto min-h-[59px] w-full whitespace-normal break-words py-3"
                >
                  {date}
                </DemoButton>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold leading-4 underline decoration-current underline-offset-4 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          lewati permainan ini
        </button>
      </div>
    </div>
  );
}

export function DemoDateTicketScreen({
  date,
  onContinue,
}: {
  date: string;
  onContinue: () => void;
}) {
  return (
    <div
      data-demo-screen="date-ticket"
      className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center text-current"
    >
      <p className="mb-4 text-center">
        <span className="sticker -rotate-2 bg-tangerine px-3 py-1 text-xs text-ink">
          Main berdua · 2/2
        </span>
      </p>
      <div className="demo-pop w-full max-w-[296px] -rotate-2 rounded-2xl border-4 border-dashed border-ink bg-paper p-5 text-center text-ink shadow-[6px_6px_0_0_#111]">
        <p className="text-xs font-bold tracking-widest">Tiket janji · berlaku 1x</p>
        <p className="my-3 break-words font-display text-4xl uppercase leading-none tracking-[-0.03em]">
          {date}
        </p>
        <p className="text-sm font-bold">Sekar + Bima</p>
        <p className="mt-3 border-t-4 border-dashed border-ink pt-3 text-xs font-bold">
          Nggak bisa dibatalkan, cuma bisa dijadwalkan.
        </p>
      </div>
      <p className="mt-5 text-center font-bold">
        Bima langsung dikabari pilihanmu. Tinggal tagih.
      </p>
      <DemoButton tone="ink" size="lg" onClick={onContinue} className="demo-pop mt-6">
        Lanjut <ArrowRightIcon className="size-4" />
      </DemoButton>
    </div>
  );
}
