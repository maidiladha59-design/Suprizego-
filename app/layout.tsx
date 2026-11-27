import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/i18n/language-provider";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const siteDescription =
  "SuprizeGo membuat halaman kejutan personal untuk pengakuan, ulang tahun, anniversary, minta maaf, dan wisuda. Cerita, foto, musik, dan surat dalam satu link.";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://suprizego.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SuprizeGo — Satu link untuk kejutan yang tak terlupakan",
    template: "%s · SuprizeGo",
  },
  description: siteDescription,
  applicationName: "SuprizeGo",
  openGraph: {
    title: "SuprizeGo — Satu link untuk kejutan yang tak terlupakan",
    description: siteDescription,
    type: "website",
    locale: "id_ID",
    siteName: "SuprizeGo",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuprizeGo — Satu link untuk kejutan yang tak terlupakan",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#b6f22e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${archivoBlack.variable} ${spaceMono.variable}`}>
      <body className="font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
