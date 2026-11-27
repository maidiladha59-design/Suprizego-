"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { CHROME_COPY } from "@/lib/i18n";
import { MOMENTS } from "@/lib/moments";
import { CONTACT_EMAIL } from "@/lib/contact";

export function SiteFooter() {
  const { lang, setLang } = useLanguage();
  const copy = CHROME_COPY[lang];

  return (
    <footer className="mt-24 border-t-4 border-ink bg-ink text-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex">
            <Brand tone="cream" size="lg" />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-5 text-cream">{copy.tagline}</p>
        </div>

        <nav aria-label={copy.momentsNavLabel}>
          <h2 className="font-display text-lg uppercase text-lime">{copy.momentsHeading}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {MOMENTS.map((moment) => (
              <li key={moment.id}>
                <Link
                  href={`/contoh/${moment.id}`}
                  className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
                >
                  {copy.momentLabels[moment.id]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#hari-spesial"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.specialDays}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={copy.brandNavLabel}>
          <h2 className="font-display text-lg uppercase text-lime">{copy.brandHeading}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/buat"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.buildPage}
              </Link>
            </li>
            <li>
              <Link
                href="/#harga"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.pricing}
              </Link>
            </li>
            <li>
              <Link
                href="/#cara-kerja"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.howItWorks}
              </Link>
            </li>
            <li>
              <Link
                href="/#fitur"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.features}
              </Link>
            </li>
            <li>
              <Link
                href="/#faq"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.faq}
              </Link>
            </li>
            <li>
              <Link
                href="/#hari-spesial"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.specialDays}
              </Link>
            </li>
            <li>
              <Link
                href="/#momen"
                className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
              >
                {copy.momentsHeading}
              </Link>
            </li>
            {CONTACT_EMAIL ? (
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition-colors hover:text-lime focus-visible:text-lime focus-visible:outline-none"
                >
                  {copy.contact}
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

      <div className="border-t-2 border-cream/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col-reverse items-center gap-3 px-4 py-4 md:flex-row md:justify-between">
          <p className="text-xs text-cream">{copy.copyright}</p>

          <div
            role="group"
            aria-label={copy.languageLabel}
            className="inline-flex overflow-hidden rounded-lg border-2 border-cream"
          >
            <button
              type="button"
              onClick={() => setLang("id")}
              aria-pressed={lang === "id"}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                lang === "id" ? "bg-cream text-ink" : "text-cream hover:text-lime"
              }`}
            >
              Bahasa Indonesia
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                lang === "en" ? "bg-cream text-ink" : "text-cream hover:text-lime"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
