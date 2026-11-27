import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EDITOR_CONFIG } from "./editor";
import { normalizeGames } from "./games";
import { normalizeMusicMood } from "./music";
import { isMomentId } from "./moments";
import { getPlan } from "./plans";
import { isSpecialDayId } from "./special-days";
import type { SurprisePage } from "./types";
import { MEDIA_BUCKET, getSupabaseAdmin } from "./supabase/server";
import type { Database } from "./supabase/database.types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SLUG_PATTERN = /^[A-Za-z0-9]{10,64}$/;

export type SurprisePageState =
  | { status: "active"; page: SurprisePage }
  | { status: "inactive" | "expired" | "not-found" };

async function signPath(
  supabase: SupabaseClient<Database>,
  path: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return null;
  return data.signedUrl;
}

function dataRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readText(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function readNullableText(value: unknown, max: number) {
  const text = readText(value, max).trim();
  return text || null;
}

function validMediaPath(path: unknown, pageId: string): path is string {
  return (
    typeof path === "string" &&
    path.startsWith(`${pageId}/`) &&
    path.length < 300 &&
    !path.includes("..")
  );
}

export function isExpired(activeUntil: string | null): boolean {
  if (!activeUntil) return false;
  const expiry = Date.parse(activeUntil);
  return Number.isNaN(expiry) ? true : expiry <= Date.now();
}

export const getSurprisePageState = cache(async (slug: string): Promise<SurprisePageState> => {
  if (!SLUG_PATTERN.test(slug)) return { status: "not-found" };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { status: "not-found" };

  const { data: row, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !row) return { status: "not-found" };
  if (row.status === "expired") return { status: "expired" };
  if (row.status !== "active" || !row.paid_at) return { status: "inactive" };
  if (isExpired(row.active_until)) return { status: "expired" };

  const data = dataRecord(row.data);
  if (!data) return { status: "not-found" };
  const momentValue = data.moment;
  if (typeof momentValue !== "string" || !isMomentId(momentValue)) {
    return { status: "not-found" };
  }
  const moment = momentValue;
  const plan = getPlan(row.paket);
  const designId = readText(data.designId, 40);
  const designValid = EDITOR_CONFIG[moment].designs.some((design) => design.id === designId);
  const photoPaths = Array.isArray(data.photoPaths)
    ? data.photoPaths.filter((path) => validMediaPath(path, row.id))
    : [];
  const signedPhotos = await Promise.all(photoPaths.map((path) => signPath(supabase, path)));
  const photos = signedPhotos.flatMap((url, index) =>
    url ? [{ url, caption: readText(Array.isArray(data.photoCaptions) ? data.photoCaptions[index] : null, 60) }] : [],
  );
  const voicePath = validMediaPath(data.voicePath, row.id) ? data.voicePath : null;
  const voiceUrl = voicePath ? await signPath(supabase, voicePath) : null;

  return {
    status: "active",
    page: {
      slug: row.slug,
      moment,
      recipientName: readText(data.recipientName, 40) || "Kamu",
      senderName: readText(data.senderName, 40) || "Pembuat halaman",
      story: readNullableText(data.story, 4000),
      letter: readNullableText(data.letter, 1500),
      photoUrls: photos.map((photo) => photo.url),
      photoCaptions: photos.map((photo) => photo.caption),
      games: normalizeGames(data.games, plan.gameLimit),
      musicUrl: null,
      musicMood: normalizeMusicMood(data.musicMood),
      question: readNullableText(data.question, 80),
      dateLabel: readNullableText(data.dateLabel, 10),
      designId: designValid ? designId : EDITOR_CONFIG[moment].designs[0]!.id,
      specialDay: isSpecialDayId(data.specialDay) ? data.specialDay : null,
      voiceUrl,
      planId: row.paket,
      activeUntil: row.active_until,
      isExample: false,
    },
  };
});
