import { EnvelopeArt } from "@/components/ui/envelope-art";

export function DemoCoverScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div data-demo-screen="cover" className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center">
      <span className="sticker -rotate-3 bg-tangerine px-3 py-1.5 text-xs text-ink">
        Ada titipan buat…
      </span>
      <p className="mt-4 break-words font-display text-5xl uppercase leading-none tracking-[-0.03em]">
        Sekar
      </p>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Ketuk amplop untuk membuka"
        className="group mx-auto mt-10 block w-full max-w-[288px] rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        <span className="demo-float block transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-[0.98]">
          <EnvelopeArt />
        </span>
      </button>
      <p className="mt-6 text-base font-bold">(ketuk amplopnya)</p>
    </div>
  );
}
