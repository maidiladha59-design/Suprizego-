import Link from "next/link";

function CtaMascot() {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      focusable="false"
      className="h-[161px] w-[161px] shrink-0"
    >
      <rect x="26" y="38" width="102" height="102" rx="26" fill="#111111" />
      <rect
        x="20"
        y="30"
        width="102"
        height="102"
        rx="26"
        fill="#B6F22E"
        stroke="#111111"
        strokeWidth="5"
      />
      <circle cx="57" cy="80" r="4.5" fill="#111111" />
      <circle cx="85" cy="80" r="4.5" fill="#111111" />
      <path
        d="M57 94c6 8 22 8 28 0"
        fill="none"
        stroke="#111111"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="90" r="5" fill="#FF8FB8" />
      <circle cx="98" cy="90" r="5" fill="#FF8FB8" />
      <g transform="translate(34 18) rotate(-14)">
        <path
          d="M0 10C-12 1-7-9 0-3 7-9 12 1 0 10Z"
          fill="#FF6A3D"
          stroke="#111111"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(137 58) rotate(12) scale(0.8)">
        <path
          d="M0 10C-12 1-7-9 0-3 7-9 12 1 0 10Z"
          fill="#FFF4E0"
          stroke="#111111"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4">
      <div className="flex flex-col items-center gap-6 rounded-card border-4 border-ink bg-pink bg-dots-candy p-10 text-center shadow-hard-lg sm:flex-row sm:text-left">
        <CtaMascot />
        <div>
          <h2 className="font-display text-3xl uppercase sm:text-4xl">
            Siap bikin kejutan?
          </h2>
          <p className="mt-2 font-bold">Coba dulu, bayar kalau sudah pas.</p>
          <Link
            href="/buat"
            className="nb-btn mt-5 bg-ink px-6 py-[0.85rem] text-base text-cream shadow-[6px_6px_0_0_#b6f22e]"
          >
            Bikin sekarang
          </Link>
        </div>
      </div>
    </section>
  );
}
