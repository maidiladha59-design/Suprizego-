import type { Metadata } from "next";
import QRCode from "qrcode";
import { PaymentResultView } from "@/components/editor/payment-result-view";
import { getPaymentResult } from "@/lib/payment-result";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status kejutan",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

type PageProps = {
  searchParams: Promise<{ order?: string | string[] }>;
};

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const value = (await searchParams).order;
  const orderId = (Array.isArray(value) ? value[0] : value) ?? "";
  const result = await getPaymentResult(orderId);
  let qrDataUrl: string | null = null;

  if (result.status === "active") {
    try {
      qrDataUrl = await QRCode.toDataURL(result.pageUrl, {
        width: 480,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#111111", light: "#FFFFFF" },
      });
    } catch {
      qrDataUrl = null;
    }
  }

  return <PaymentResultView result={result} qrDataUrl={qrDataUrl} />;
}
