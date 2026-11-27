"use client";

import { useEffect, useState } from "react";
import { ChatIcon, CloseIcon, MailIcon } from "@/components/ui/icons";

export function ReaderContact({ contactEmail }: { contactEmail: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Butuh bantuan? Buka panel kontak"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full border-4 border-ink bg-lime text-ink shadow-[5px_5px_0_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink sm:bottom-8 sm:right-8"
      >
        {open ? <CloseIcon className="size-6" /> : <ChatIcon className="size-7" />}
      </button>

      {open ? (
        <section
          role="dialog"
          aria-label="Panel bantuan SuprizeGo"
          className="animate-pop-in fixed bottom-24 right-5 z-50 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border-4 border-ink bg-paper p-4 text-ink shadow-[7px_7px_0_0_#111] sm:bottom-28 sm:right-8"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-candy">
              <MailIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg uppercase leading-6">Butuh bantuan?</h2>
              <p className="mt-1 text-xs font-bold leading-5">Dibalas lewat email, ya.</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5">
            Kirim pertanyaan soal halaman atau pesananmu. Tim SuprizeGo akan membaca lewat email.
          </p>
          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent("Bantuan SuprizeGo")}`}
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border-[3px] border-ink bg-lime px-3 font-display text-xs uppercase shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <MailIcon className="size-4" />
            Kirim email
          </a>
          <p className="mt-3 break-all text-center text-[10px] font-bold leading-4 text-ink">
            {contactEmail}
          </p>
        </section>
      ) : null}
    </>
  );
}
