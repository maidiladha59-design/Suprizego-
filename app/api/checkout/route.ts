import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { CheckoutPayload } from "@/lib/checkout";
import {
  CheckoutError,
  MAX_CHECKOUT_BYTES,
  parseCheckoutPayload,
  validateCheckoutFiles,
} from "@/lib/checkout-validation";
import { createSnapTransaction, getMidtransConfig } from "@/lib/midtrans/config";
import { getPricing } from "@/lib/pricing";
import { MEDIA_BUCKET, getSupabaseAdmin } from "@/lib/supabase/server";
import type { StoredSurpriseData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const config = getMidtransConfig();
  const supabase = getSupabaseAdmin();
  if (!config || !supabase) {
    return errorResponse(
      "Pembayaran belum dikonfigurasi. Hubungi pengelola SuprizeGo.",
      503,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_CHECKOUT_BYTES) {
    return errorResponse("Ukuran unggahan terlalu besar.", 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Data checkout tidak dapat dibaca.", 400);
  }

  const rawPayload = form.get("payload");
  if (typeof rawPayload !== "string" || rawPayload.length > 50_000) {
    return errorResponse("Data halaman tidak valid.", 400);
  }

  const rawPhotos = form.getAll("photos");
  const rawVoice = form.get("voice");
  if (rawPhotos.some((item) => !(item instanceof File))) {
    return errorResponse("Berkas foto tidak valid.", 400);
  }
  if (rawVoice !== null && !(rawVoice instanceof File)) {
    return errorResponse("Berkas pesan suara tidak valid.", 400);
  }

  let payload: CheckoutPayload;
  let files: Awaited<ReturnType<typeof validateCheckoutFiles>>;
  try {
    payload = parseCheckoutPayload(JSON.parse(rawPayload) as unknown);
    files = await validateCheckoutFiles(
      rawPhotos as File[],
      rawVoice as File | null,
      payload,
    );
  } catch (error) {
    if (error instanceof SyntaxError) return errorResponse("Data halaman tidak valid.", 400);
    if (error instanceof CheckoutError) return errorResponse(error.message, 400);
    return errorResponse("Data halaman tidak dapat divalidasi.", 400);
  }

  const photos = rawPhotos as File[];
  const pageId = randomUUID();
  const slug = randomBytes(20).toString("hex");
  const orderId = `SG-${Date.now()}-${randomBytes(8).toString("hex").toUpperCase()}`;
  const uploadedPaths: string[] = [];
  let pageCreated = false;

  try {
    const photoPaths = await Promise.all(
      photos.map(async (file, index) => {
        const format = files.photos[index];
        if (!format) throw new CheckoutError("Metadata foto tidak lengkap.");
        const path = `${pageId}/photos/${index}-${randomBytes(6).toString("hex")}.${format.extension}`;
        const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, await file.arrayBuffer(), {
          contentType: format.contentType,
          upsert: false,
        });
        if (error) throw new Error("Media photo upload failed");
        uploadedPaths.push(path);
        return path;
      }),
    );

    let voicePath: string | null = null;
    if (rawVoice instanceof File && files.voice) {
      voicePath = `${pageId}/voice/${randomBytes(8).toString("hex")}.${files.voice.extension}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(
        voicePath,
        await rawVoice.arrayBuffer(),
        { contentType: files.voice.contentType, upsert: false },
      );
      if (error) throw new Error("Media voice upload failed");
      uploadedPaths.push(voicePath);
    }

    const data: StoredSurpriseData = {
      moment: payload.moment,
      recipientName: payload.recipientName,
      senderName: payload.senderName,
      story: payload.story.filter(Boolean).join("\n\n") || null,
      letter: payload.letter,
      photoPaths,
      photoCaptions: payload.photoCaptions,
      games: payload.games,
      musicUrl: null,
      musicMood: payload.musicMood,
      spotifyUrl: payload.spotifyUrl,
      question: payload.question,
      dateLabel: payload.dateLabel,
      designId: payload.designId,
      specialDay: payload.specialDay,
      voicePath,
      voiceDuration: payload.voiceDuration,
    };

    const { error: pageError } = await supabase.from("pages").insert({
      id: pageId,
      slug,
      data,
      paket: payload.planId,
      status: "pending",
    });
    if (pageError) throw new Error("Page insert failed");
    pageCreated = true;

    const pricing = getPricing(payload.planId);
    const { error: orderError } = await supabase.from("orders").insert({
      page_id: pageId,
      order_id: orderId,
      paket: payload.planId,
      gross_amount: pricing.price,
      status: "pending",
    });
    if (orderError) throw new Error("Order insert failed");

    const snapToken = await createSnapTransaction(config, {
      orderId,
      planId: payload.planId,
      recipientName: payload.recipientName,
    });
    const { error: tokenError } = await supabase
      .from("orders")
      .update({ snap_token: snapToken })
      .eq("order_id", orderId);
    if (tokenError) throw new Error("Snap token update failed");

    return NextResponse.json(
      {
        clientKey: config.clientKey,
        snapUrl: config.snapUrl,
        snapToken,
        orderId,
        slug,
        grossAmount: pricing.price,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Checkout gagal diproses.", error instanceof Error ? error.message : "unknown");
    await supabase.from("orders").delete().eq("order_id", orderId);
    if (pageCreated) await supabase.from("pages").delete().eq("id", pageId);
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(MEDIA_BUCKET).remove(uploadedPaths);
    }
    return errorResponse("Pembayaran belum dapat disiapkan. Coba lagi sebentar lagi.", 502);
  }
}
