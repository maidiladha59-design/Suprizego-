import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeGames } from "./games";
import { isMomentId } from "./moments";
import type { SurprisePage } from "./types";
import { MEDIA_BUCKET, getSupabaseAdmin } from "./supabase/server";
import type { Database } from "./supabase/database.types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SLUG_PATTERN = /^[A-Za-z0-9]{10,64}$/;

async function signPath(
  supabase: SupabaseClient<Database>,
  path: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return null;
  }

  return data.signedUrl;
}

export const getSurprisePage = cache(async (slug: string): Promise<SurprisePage | null> => {
  if (!SLUG_PATTERN.test(slug)) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("surprise_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data || !isMomentId(data.moment)) {
    return null;
  }

  const photoUrls = await Promise.all(data.photo_paths.map((path) => signPath(supabase, path)));
  const musicUrl = data.music_path ? await signPath(supabase, data.music_path) : null;

  return {
    slug: data.slug,
    moment: data.moment,
    recipientName: data.recipient_name,
    senderName: data.sender_name,
    story: data.story,
    letter: data.letter,
    photoUrls: photoUrls.filter((url): url is string => url !== null),
    games: normalizeGames(data.games),
    musicUrl,
    activeUntil: data.active_until,
    isExample: false,
  };
});

export function isExpired(activeUntil: string | null): boolean {
  if (!activeUntil) {
    return false;
  }

  const expiry = Date.parse(activeUntil);
  return Number.isNaN(expiry) ? true : expiry <= Date.now();
}
