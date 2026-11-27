import { PRICING, type PlanId } from "./pricing";

export type { PlanId } from "./pricing";
export { PLAN_IDS, formatRupiah, isPlanId } from "./pricing";

export type PlanFeature = {
  label: string;
  availability: "ready" | "soon";
};

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  priceBefore?: number;
  activeDays: number | null;
  activeLabel: string;
  photoLimit: number;
  gameLimit: number;
  voiceNote: boolean;
  spotify: boolean;
  tagline: string;
  features: readonly PlanFeature[];
  highlight: boolean;
  badge?: string;
  discount?: string;
};

export const PLANS: readonly Plan[] = [
  {
    id: "dasar",
    ...PRICING.dasar,
    photoLimit: 8,
    gameLimit: 1,
    voiceNote: false,
    spotify: false,
    tagline: "Buat kejutan cepat",
    features: [
      { label: "Semua desain", availability: "ready" },
      { label: "Musik bawaan", availability: "ready" },
      { label: "Main Berdua (1 permainan)", availability: "ready" },
      { label: "Simpan jadi gambar", availability: "ready" },
      { label: "Kartu QR", availability: "ready" },
      { label: "Ucapan bareng (10 teman)", availability: "soon" },
      { label: "Kapsul waktu (≤ 30 hari)", availability: "soon" },
      { label: "Aktif 3 hari", availability: "ready" },
    ],
    highlight: false,
  },
  {
    id: "plus",
    ...PRICING.plus,
    photoLimit: 8,
    gameLimit: 2,
    voiceNote: true,
    spotify: true,
    tagline: "Pilihan fleksibel",
    features: [
      { label: "Semua isi Dasar", availability: "ready" },
      { label: "Main Berdua (2 permainan)", availability: "ready" },
      { label: "Voice note ≤ 1 menit", availability: "ready" },
      { label: "Lagu pilihan (Spotify)", availability: "soon" },
      { label: "Bisa diedit lagi", availability: "soon" },
      { label: "Link custom", availability: "soon" },
      { label: "Ucapan bareng (50 teman)", availability: "soon" },
      { label: "Kapsul waktu (≤ 90 hari)", availability: "soon" },
      { label: "Aktif 14 hari", availability: "ready" },
    ],
    highlight: true,
    badge: "Pilihan fleksibel",
  },
  {
    id: "abadi",
    ...PRICING.abadi,
    photoLimit: 8,
    gameLimit: 3,
    voiceNote: true,
    spotify: true,
    tagline: "Kenangan selamanya",
    features: [
      { label: "Semua isi Plus", availability: "ready" },
      { label: "Aktif selamanya", availability: "ready" },
      { label: "Main Berdua (3 permainan)", availability: "ready" },
      { label: "Tampil di Papan Abadi (opsional)", availability: "soon" },
      { label: "Desain eksklusif bertanda khusus", availability: "soon" },
      { label: "Ucapan bareng (100 teman)", availability: "soon" },
      { label: "Kapsul waktu sampai 10 tahun", availability: "soon" },
    ],
    highlight: false,
    discount: "Hemat 25%",
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = {
  dasar: PLANS[0]!,
  plus: PLANS[1]!,
  abadi: PLANS[2]!,
};

export function getPlan(id: PlanId): Plan {
  return PLAN_BY_ID[id];
}
