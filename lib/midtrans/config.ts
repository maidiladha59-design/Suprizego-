import "server-only";

import { getPricing, type PlanId } from "@/lib/pricing";

export type MidtransConfig = {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
  apiUrl: string;
  snapUrl: string;
  siteUrl: string;
};

type SnapTransactionInput = {
  orderId: string;
  planId: PlanId;
  recipientName: string;
};

export function getMidtransConfig(): MidtransConfig | null {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim();
  if (!serverKey || !clientKey) return null;

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION?.trim().toLowerCase() === "true";
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://suprizego.vercel.app";
  let siteUrl: string;
  try {
    const parsed = new URL(rawSiteUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    siteUrl = parsed.origin;
  } catch {
    return null;
  }

  return {
    serverKey,
    clientKey,
    isProduction,
    apiUrl: isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2",
    snapUrl: isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js",
    siteUrl,
  };
}

export async function createSnapTransaction(
  config: MidtransConfig,
  input: SnapTransactionInput,
): Promise<string> {
  const pricing = getPricing(input.planId);
  const response = await fetch(`${config.apiUrl}/charge`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${config.serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: pricing.price,
      },
      item_details: [
        {
          id: input.planId,
          name: `Paket ${pricing.name}`,
          price: pricing.price,
          quantity: 1,
        },
      ],
      customer_details: {
        first_name: input.recipientName.slice(0, 50),
      },
      enabled_payments: [
        "qris",
        "gopay",
        "shopeepay",
        "dana",
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "echannel",
      ],
      credit_card: { secure: true },
      callbacks: {
        finish: `${config.siteUrl}/selesai?order=${encodeURIComponent(input.orderId)}`,
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Midtrans menolak permintaan Snap (${response.status}).`);
  }

  const result: unknown = await response.json();
  if (!result || typeof result !== "object") throw new Error("Respons Snap tidak valid.");
  const token = (result as Record<string, unknown>).token;
  if (typeof token !== "string" || !token) throw new Error("Token Snap tidak tersedia.");
  return token;
}
