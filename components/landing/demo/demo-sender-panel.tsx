import type { DemoActivity, DemoActivityKind } from "@/lib/demo-flow";

const EMOJIS: Record<DemoActivityKind, string> = {
  open: "👀",
  quiz: "🎮",
  date: "🎮",
  yes: "💚",
};

export function DemoSenderPanel({ activities }: { activities: DemoActivity[] }) {
  return (
    <div className="w-full min-w-0 max-w-md rotate-[0.6deg] justify-self-start self-start rounded-[1.25rem] border-4 border-ink bg-white p-4 text-ink shadow-[8px_8px_0_#111] md:col-start-1 md:row-start-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-lg uppercase leading-tight">Yang masuk ke Bima</p>
        <span className="sticker shrink-0 bg-lime px-[11.2px] py-[3.2px] text-[10px] leading-[15px] text-ink shadow-[2px_2px_0_#111]">
          Pengirim
        </span>
      </div>

      <div aria-live="polite">
        {activities.length === 0 ? (
          <p className="mt-3 rounded-xl border-2 border-dashed border-ink/40 px-3 py-3 text-sm font-bold opacity-70">
            Mainkan halaman contohnya. Tiap hal yang Sekar lakukan langsung muncul di sini
            dan bisa kamu pantau.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="demo-rise flex items-start gap-2 rounded-xl border-[3px] border-ink bg-paper px-3 py-2 text-sm font-bold shadow-[3px_3px_0_#111]"
              >
                <span aria-hidden="true">{EMOJIS[activity.kind]}</span>
                <span className="min-w-0 break-words">{activity.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
