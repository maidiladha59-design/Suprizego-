"use client";

import { PLANS, formatRupiah, type Plan, type PlanId } from "@/lib/plans";

type PlanSectionProps = {
  plan: Plan;
  onSelect: (planId: PlanId) => void;
  onCheckout: () => void;
  checkoutBusy: boolean;
  checkoutError: string | null;
};

export function PlanSection({
  plan,
  onSelect,
  onCheckout,
  checkoutBusy,
  checkoutError,
}: PlanSectionProps) {
  return (
    <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
          8
        </span>
        <h2 className="font-display text-2xl uppercase leading-8">Pilih paket</h2>
      </div>
      <p className="mt-1 text-sm font-bold leading-5 text-ink">
        Paket menentukan batas isi dan fitur yang tampil di pratinjau.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {PLANS.map((option) => {
          const selected = option.id === plan.id;
          return (
            <button
              key={option.id}
              type="button"
              data-plan-option={option.id}
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
              className={`min-w-0 rounded-2xl border-4 border-ink p-4 text-left transition focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink ${
                selected
                  ? "-translate-y-1 bg-lime shadow-[6px_6px_0_0_#111]"
                  : "bg-paper hover:-translate-y-0.5"
              }`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="font-display text-xl uppercase leading-6">{option.name}</span>
                {selected ? (
                  <span className="rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[9px] font-bold uppercase leading-3">
                    Dipilih
                  </span>
                ) : null}
              </span>
              <span className="mt-3 flex flex-wrap items-baseline gap-2 font-display text-2xl leading-6">
                {option.priceBefore ? (
                  <s className="text-sm text-ink-soft">{formatRupiah(option.priceBefore)}</s>
                ) : null}
                {formatRupiah(option.price)}
              </span>
              <span className="mt-1 block text-[11px] font-bold uppercase leading-4 tracking-[0.04em]">
                {option.activeLabel}
              </span>
              <span className="mt-3 grid gap-1.5 text-[11px] font-bold leading-4">
                <span>{option.photoLimit} foto</span>
                <span>{option.gameLimit} permainan</span>
                <span>{option.voiceNote ? "Pesan suara tersedia" : "Tanpa pesan suara"}</span>
                <span>{option.spotify ? "Lagu Spotify segera hadir" : "Musik bawaan saja"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border-[3px] border-ink bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase leading-4 tracking-[0.04em]">Total bayar</p>
            <p className="mt-1 font-display text-2xl leading-7">{formatRupiah(plan.price)}</p>
          </div>
          <span className="rounded-full border-2 border-ink bg-white px-3 py-1 text-[11px] font-bold leading-4">
            {plan.activeLabel}
          </span>
        </div>
        <p className="mt-3 text-[11px] font-bold leading-4">
          Pembayaran diproses Midtrans. Harga dihitung ulang di server dan halaman aktif setelah pembayaran terverifikasi.
        </p>
        <p className="mt-2 text-[10px] font-bold leading-4">
          QRIS, GoPay, ShopeePay, DANA, dan VA bank tersedia sesuai konfigurasi akun Midtrans.
        </p>
        <button
          type="button"
          onClick={onCheckout}
          disabled={checkoutBusy}
          aria-busy={checkoutBusy}
          className="mt-4 flex h-14 w-full items-center justify-center rounded-xl border-4 border-ink bg-lime px-4 font-display text-base uppercase tracking-[0.01em] text-ink shadow-[5px_5px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-60 disabled:shadow-none"
        >
          {checkoutBusy ? "Menyiapkan pembayaran..." : "Bayar & kirim"}
        </button>
        {checkoutError ? (
          <p role="alert" className="mt-3 rounded-lg border-2 border-ink bg-tangerine px-3 py-2 text-xs font-bold leading-4 text-ink">
            {checkoutError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
