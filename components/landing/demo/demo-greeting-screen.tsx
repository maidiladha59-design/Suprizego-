import { ArrowRightIcon } from "@/components/ui/icons";
import { DemoButton } from "./demo-controls";

export function DemoGreetingScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div data-demo-screen="greeting" className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center">
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 200 200"
        className="demo-float h-44 w-44"
      >
        <rect x="33" y="79" width="148" height="100" rx="12" fill="#111111" />
        <rect x="26" y="72" width="148" height="100" rx="12" fill="#FF6A3D" stroke="#111111" strokeWidth="6" />
        <g transform="rotate(-4 100 80)">
          <rect x="46" y="30" width="108" height="100" rx="8" fill="#FFFFFF" stroke="#111111" strokeWidth="6" />
          <path d="M62 54h58M62 72h76M62 90h44" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
        </g>
        <path d="M26 92 100 140l74-48v68a12 12 0 0 1-12 12H38a12 12 0 0 1-12-12Z" fill="#FFF4E0" stroke="#111111" strokeWidth="6" strokeLinejoin="round" />
        <path d="m28 168 50-42m94 42-50-42" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
        <path d="M100 128c-26-18-14-40 0-24 14-16 26 6 0 24Z" fill="#FF6A3D" stroke="#111111" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M166 38c-21-14-11-32 0-19 11-13 21 5 0 19Z" fill="#B6F22E" stroke="#111111" strokeWidth="5" strokeLinejoin="round" />
        <path d="M30 42c-14-10-8-22 0-13 8-9 14 3 0 13Z" fill="#FFFFFF" stroke="#111111" strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <div className="relative mt-4 w-full rounded-[20px] border-4 border-ink bg-paper p-5 text-center text-ink shadow-[5px_5px_0_0_#111]">
        <h2 className="font-display text-3xl leading-tight">Hai, Sekar!</h2>
        <p className="mt-2 font-bold">Bima punya sesuatu buat kamu.</p>
      </div>
      <DemoButton tone="ink" size="lg" onClick={onContinue} className="mt-6">
        Buka <ArrowRightIcon className="size-4" />
      </DemoButton>
    </div>
  );
}
