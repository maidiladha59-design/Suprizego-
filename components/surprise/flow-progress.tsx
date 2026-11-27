import { MusicIcon } from "@/components/ui/icons";

export function FlowProgress({ progress }: { progress: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Langkah ${progress} dari 8`}
      data-flow-progress={progress}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`size-3 rounded-full border-2 border-current transition-colors ${
            index < progress ? "bg-current" : "bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

export function FlowMusicButton({
  musicOn,
  onToggle,
  label = "musik",
}: {
  musicOn: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={musicOn}
      aria-label={`${musicOn ? "Matikan" : "Nyalakan"} ${label}`}
      className="inline-flex h-[31px] shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border-[3px] border-ink bg-paper px-2.5 font-display text-[11px] uppercase leading-[1.5] text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <MusicIcon className="size-3.5" />
      {musicOn ? "Nyala" : "Mati"}
    </button>
  );
}
