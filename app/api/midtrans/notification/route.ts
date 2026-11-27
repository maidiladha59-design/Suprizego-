import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getMidtransConfig } from "@/lib/midtrans/config";
import { getPricing } from "@/lib/pricing";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Notification = {
  order_id?: unknown;
  status_code?: unknown;
  gross_amount?: unknown;
  signature_key?: unknown;
  transaction_status?: unknown;
  payment_type?: unknown;
  settlement_time?: unknown;
  transaction_time?: unknown;
  currency_code?: unknown;
};

function text(value: unknown, max = 100) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function signatureMatches(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function paymentTime(primary: string, fallback: string) {
  const withZone = (value: string) =>
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(" ", "T")}+07:00` : value;
  const preferred = Date.parse(withZone(primary));
  if (Number.isFinite(preferred)) return new Date(preferred).toISOString();
  const secondary = Date.parse(withZone(fallback));
  if (Number.isFinite(secondary)) return new Date(secondary).toISOString();
  return new Date().toISOString();
}

export async function POST(request: Request) {
  const config = getMidtransConfig();
  const supabase = getSupabaseAdmin();
  if (!config || !supabase) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 64_000) return NextResponse.json({ error: "too_large" }, { status: 413 });

  let body: Notification;
  try {
    body = (await request.json()) as Notification;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const orderId = text(body.order_id);
  const statusCode = text(body.status_code, 10);
  const grossAmount = text(body.gross_amount, 20);
  const receivedSignature = text(body.signature_key, 128);
  if (!orderId || !statusCode || !grossAmount || !receivedSignature) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const expectedSignature = createHash("sha512")
    .update(orderId + statusCode + grossAmount + config.serverKey)
    .digest("hex");
  if (!signatureMatches(receivedSignature, expectedSignature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 403 });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (orderError || !order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

  const pricing = getPricing(order.paket);
  const receivedAmount = Number(grossAmount);
  if (
    !Number.isFinite(receivedAmount) ||
    receivedAmount !== pricing.price ||
    order.gross_amount !== pricing.price
  ) {
    return NextResponse.json({ error: "amount_mismatch" }, { status: 400 });
  }
  if (body.currency_code && text(body.currency_code, 3) !== "IDR") {
    return NextResponse.json({ error: "currency_mismatch" }, { status: 400 });
  }

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, paket")
    .eq("id", order.page_id)
    .maybeSingle();
  if (pageError || !page || page.paket !== order.paket) {
    return NextResponse.json({ error: "page_mismatch" }, { status: 409 });
  }

  const status = text(body.transaction_status, 32);
  const paymentType = text(body.payment_type, 64);

  if (status === "settlement" || status === "capture") {
    const paidAt = paymentTime(
      text(body.settlement_time, 40),
      text(body.transaction_time, 40),
    );
    const { error } = await supabase.rpc("activate_midtrans_order", {
      p_order_id: orderId,
      p_payment_type: paymentType,
      p_paid_at: paidAt,
      p_active_days: pricing.activeDays,
    });
    if (error) {
      console.error("Aktivasi Midtrans gagal.", error.message);
      return NextResponse.json({ error: "activation_failed" }, { status: 500 });
    }
  } else if (status === "deny" || status === "expire" || status === "cancel" || status === "failure") {
    const { error } = await supabase.rpc("fail_midtrans_order", {
      p_order_id: orderId,
      p_status: status,
      p_payment_type: paymentType,
    });
    if (error) {
      console.error("Status gagal Midtrans gagal disimpan.", error.message);
      return NextResponse.json({ error: "failure_update_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
