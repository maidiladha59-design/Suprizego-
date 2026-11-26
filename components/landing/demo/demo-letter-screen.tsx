import { ArrowRightIcon } from "@/components/ui/icons";
import { DemoButton } from "./demo-controls";

export function DemoLetterScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      data-demo-screen="letter"
      className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center text-current"
    >
      <div className="w-full max-w-[296px] -rotate-1 rounded-[20px] border-4 border-ink bg-paper p-6 text-left text-ink shadow-[5px_5px_0_0_#111]">
        <h2 className="font-display text-2xl uppercase leading-tight">Untuk Sekar,</h2>
        <p className="mt-3 whitespace-pre-wrap break-words text-base font-bold leading-relaxed">
          Sekar, terima kasih sudah jadi bagian paling seru di hari-hari Bima. Semoga
          kita masih punya banyak alasan buat ketawa, ngobrol, dan pulang bareng.
        </p>
        <div className="mt-5 flex justify-end">
          <p className="font-display text-xl">— Bima</p>
        </div>
      </div>
      <DemoButton tone="ink" size="lg" onClick={onContinue} className="mt-8 w-[154px]">
        Lanjut <ArrowRightIcon className="size-4" />
      </DemoButton>
    </div>
  );
}
