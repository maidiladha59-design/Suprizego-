import "server-only";

import { EDITOR_CONFIG } from "./editor";
import { isPlayableGame, normalizeGames } from "./games";
import { isMomentId } from "./moments";
import { getPlan, isPlanId } from "./plans";
import { getSpecialDayStatus, isSpecialDayId } from "./special-days";
import type { CheckoutPayload } from "./checkout";
import type { Plan } from "./plans";
import { MAX_AUDIO_BYTES, MAX_AUDIO_SECONDS, isSupportedAudio } from "./audio-rules";
import { MAX_PHOTO_BYTES, isSupportedPhoto } from "./photo-rules";
import { normalizeMusicMood } from "./music";

export const MAX_CHECKOUT_BYTES = 32 * 1024 * 1024;

export class CheckoutError extends Error {}

type ValidatedUpload = {
  contentType: string;
  extension: string;
};

export type ValidatedFiles = {
  photos: ValidatedUpload[];
  voice: ValidatedUpload | null;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CheckoutError("Isian halaman tidak valid.");
  }
  return value as Record<string, unknown>;
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function requiredText(value: unknown, max: number, label: string) {
  const text = cleanText(value);
  if (!text) throw new CheckoutError(`${label} wajib diisi.`);
  if (text.length > max) throw new CheckoutError(`${label} maksimal ${max} karakter.`);
  return text;
}

function optionalText(value: unknown, max: number, label: string) {
  const text = cleanText(value);
  if (text.length > max) throw new CheckoutError(`${label} maksimal ${max} karakter.`);
  return text || null;
}

function readDate(value: unknown) {
  const text = optionalText(value, 10, "Tanggal");
  if (!text) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new CheckoutError("Format tanggal tidak valid.");
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new CheckoutError("Tanggal tidak valid.");
  }
  return text;
}

function readSpotifyUrl(value: unknown, plan: Plan) {
  const text = optionalText(value, 200, "Tautan Spotify");
  if (!text) return null;
  if (!plan.spotify) throw new CheckoutError("Tautan Spotify tersedia untuk paket Plus dan Abadi.");

  let normalized: URL;
  try {
    const url = new URL(text);
    const validHost = url.hostname === "open.spotify.com" || url.hostname === "spotify.com";
    if (
      url.protocol !== "https:" ||
      !validHost ||
      !/^\/(?:intl-[a-z]{2}\/)?track\/[A-Za-z0-9]+/.test(url.pathname)
    ) {
      throw new Error("invalid-spotify-url");
    }
    normalized = url;
  } catch {
    throw new CheckoutError("Gunakan tautan lagu Spotify yang valid.");
  }
  return normalized.toString();
}

export function parseCheckoutPayload(value: unknown, now = new Date()): CheckoutPayload {
  const source = record(value);
  if (!isPlanId(source.planId)) throw new CheckoutError("Paket tidak valid.");
  if (!isMomentId(String(source.moment))) throw new CheckoutError("Momen tidak valid.");

  const moment = source.moment as CheckoutPayload["moment"];
  const planId = source.planId;
  const plan = getPlan(planId);
  const designId = requiredText(source.designId, 40, "Desain");
  if (!EDITOR_CONFIG[moment].designs.some((design) => design.id === designId)) {
    throw new CheckoutError("Desain tidak tersedia untuk momen ini.");
  }

  let specialDay: CheckoutPayload["specialDay"] = null;
  if (source.specialDay !== null && source.specialDay !== undefined && source.specialDay !== "") {
    if (!isSpecialDayId(source.specialDay)) throw new CheckoutError("Hari spesial tidak valid.");
    if (getSpecialDayStatus(source.specialDay, now).status !== "musim") {
      throw new CheckoutError("Musim Hari Spesial ini sudah ditutup. Pilih Biasa saja atau hari yang aktif.");
    }
    specialDay = source.specialDay;
  }

  if (!Array.isArray(source.story) || source.story.length < 3 || source.story.length > 5) {
    throw new CheckoutError("Cerita harus berisi 3 sampai 5 kartu.");
  }
  const story = source.story.map((item, index) =>
    optionalText(item, 180, `Kartu cerita ${index + 1}`) ?? "",
  );
  if (story.every((item) => !item)) throw new CheckoutError("Tulis minimal satu kartu cerita.");

  if (!Array.isArray(source.games) || source.games.length > plan.gameLimit) {
    throw new CheckoutError(`Paket ${plan.name} maksimal ${plan.gameLimit} permainan.`);
  }
  if (!Array.isArray(source.photoCaptions) || source.photoCaptions.length > plan.photoLimit) {
    throw new CheckoutError(`Paket ${plan.name} maksimal ${plan.photoLimit} foto.`);
  }

  const musicMood = normalizeMusicMood(source.musicMood);
  const photoCaptions = source.photoCaptions.map((item, index) =>
    optionalText(item, 60, `Keterangan foto ${index + 1}`) ?? "",
  );
  const games = normalizeGames(source.games, plan.gameLimit).filter((game) =>
    isPlayableGame(game, photoCaptions.length),
  );

  let voiceDuration: number | null = null;
  if (source.voiceDuration !== null && source.voiceDuration !== undefined) {
    if (
      typeof source.voiceDuration !== "number" ||
      !Number.isFinite(source.voiceDuration) ||
      source.voiceDuration < 0.5 ||
      source.voiceDuration > MAX_AUDIO_SECONDS + 0.5
    ) {
      throw new CheckoutError("Durasi pesan suara tidak valid.");
    }
    if (!plan.voiceNote) throw new CheckoutError("Pesan suara tersedia untuk paket Plus dan Abadi.");
    voiceDuration = Math.min(source.voiceDuration, MAX_AUDIO_SECONDS);
  }

  return {
    moment,
    recipientName: requiredText(source.recipientName, 40, "Nama penerima"),
    senderName: requiredText(source.senderName, 40, "Namamu"),
    dateLabel: readDate(source.dateLabel),
    question: optionalText(source.question, 80, "Pertanyaan besar"),
    story,
    designId,
    specialDay,
    planId,
    musicMood,
    spotifyUrl: readSpotifyUrl(source.spotifyUrl, plan),
    letter: optionalText(source.letter, 1500, "Surat penutup"),
    games,
    photoCaptions,
    voiceDuration,
  };
}

async function signature(file: File): Promise<Buffer> {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes).subarray(0, 16);
}

function startsWith(bytes: Buffer, text: string) {
  return bytes.subarray(0, text.length).toString("latin1") === text;
}

async function photoFormat(file: File): Promise<ValidatedUpload> {
  if (!isSupportedPhoto(file) || file.size === 0 || file.size > MAX_PHOTO_BYTES) {
    throw new CheckoutError("Foto harus berupa JPG, PNG, atau WebP dan maksimal 10 MB.");
  }
  const bytes = await signature(file);
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }
  if (startsWith(bytes, "\x89PNG\r\n\x1a\n")) {
    return { contentType: "image/png", extension: "png" };
  }
  if (startsWith(bytes, "RIFF") && bytes.subarray(8, 12).toString("latin1") === "WEBP") {
    return { contentType: "image/webp", extension: "webp" };
  }
  throw new CheckoutError("Isi file foto tidak dikenali. Unggah ulang JPG, PNG, atau WebP.");
}

async function audioFormat(file: File): Promise<ValidatedUpload> {
  if (!isSupportedAudio(file) || file.size === 0 || file.size > MAX_AUDIO_BYTES) {
    throw new CheckoutError("Pesan suara harus berupa MP3, M4A, WAV, OGG, atau WebM dan maksimal 5 MB.");
  }
  const bytes = await signature(file);
  if (startsWith(bytes, "ID3") || (bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0)) {
    return { contentType: "audio/mpeg", extension: "mp3" };
  }
  if (bytes.subarray(4, 8).toString("latin1") === "ftyp") {
    return { contentType: "audio/mp4", extension: "m4a" };
  }
  if (startsWith(bytes, "RIFF") && bytes.subarray(8, 12).toString("latin1") === "WAVE") {
    return { contentType: "audio/wav", extension: "wav" };
  }
  if (startsWith(bytes, "OggS")) return { contentType: "audio/ogg", extension: "ogg" };
  if (startsWith(bytes, "\x1aE\xdf\xa3")) return { contentType: "audio/webm", extension: "webm" };
  throw new CheckoutError("Isi file pesan suara tidak dikenali. Unggah ulang audio yang didukung.");
}

export async function validateCheckoutFiles(
  photos: File[],
  voice: File | null,
  payload: CheckoutPayload,
): Promise<ValidatedFiles> {
  const plan = getPlan(payload.planId);
  if (photos.length !== payload.photoCaptions.length) {
    throw new CheckoutError("Jumlah foto dan keterangan foto tidak cocok.");
  }
  if (photos.length > plan.photoLimit) {
    throw new CheckoutError(`Paket ${plan.name} maksimal ${plan.photoLimit} foto.`);
  }
  if (voice && !plan.voiceNote) {
    throw new CheckoutError("Pesan suara tersedia untuk paket Plus dan Abadi.");
  }
  if (voice && payload.voiceDuration === null) {
    throw new CheckoutError("Durasi pesan suara harus dikirim bersama file.");
  }
  if (!voice && payload.voiceDuration !== null) {
    throw new CheckoutError("File pesan suara tidak ditemukan.");
  }

  const totalBytes = [...photos, ...(voice ? [voice] : [])].reduce(
    (total, file) => total + file.size,
    0,
  );
  if (totalBytes > MAX_CHECKOUT_BYTES) throw new CheckoutError("Ukuran total unggahan terlalu besar.");

  return {
    photos: await Promise.all(photos.map(photoFormat)),
    voice: voice ? await audioFormat(voice) : null,
  };
}
