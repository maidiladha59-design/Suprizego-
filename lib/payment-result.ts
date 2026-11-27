import "server-only";

import { getPricing } from "./pricing";
import { getSupabaseAdmin } from "./supabase/server";
import { isExpired } from "./surprise-pages";
import { isMomentId, type MomentId } from "./moments";

export type PaymentResult =
  | {
      status: "active";
      orderId: string;
      slug: string;
      pageUrl: string;
      planName: string;
      grossAmount: number;
      paidAt: string | null;
      activeUntil: string | null;
      moment: MomentId;
    }
  | {
      status: "pending" | "failed" | "expired" | "not-found";
      orderId: string;
      moment?: MomentId;
    };

export async function getPaymentResult(orderId: string): Promise<PaymentResult> {
  if (!/^[A-Za-z0-9-]{10,100}$/.test(orderId)) return { status: "not-found", orderId };
  const supabase = getSupabaseAdmin();
  if (!supabase) return { status: "not-found", orderId };

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!order) return { status: "not-found", orderId };

  const { data: page } = await supabase
    .from("pages")
    .select("slug, status, active_until, paid_at, data")
    .eq("id", order.page_id)
    .maybeSingle();
  const data = page?.data && typeof page.data === "object" && !Array.isArray(page.data)
    ? (page.data as Record<string, unknown>)
    : null;
  const moment = data && typeof data.moment === "string" && isMomentId(data.moment)
    ? data.moment
    : undefined;

  if (order.status === "deny" || order.status === "expire" || order.status === "cancel" || order.status === "failure") {
    return { status: "failed", orderId, moment };
  }
  if (order.status !== "settlement" && order.status !== "capture") {
    return { status: "pending", orderId, moment };
  }
  if (!page || page.status !== "active" || !page.paid_at) {
    return { status: "pending", orderId, moment };
  }
  if (isExpired(page.active_until)) return { status: "expired", orderId, moment };

  const pricing = getPricing(order.paket);
  return {
    status: "active",
    orderId,
    slug: page.slug,
    pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://suprizego.vercel.app"}/p/${page.slug}`,
    planName: pricing.name,
    grossAmount: pricing.price,
    paidAt: order.paid_at,
    activeUntil: page.active_until,
    moment: moment ?? "pengakuan",
  };
}
