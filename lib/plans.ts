export type PlanId = "dasar" | "plus" | "abadi";

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
  features: readonly string[];
  highlight: boolean;
  badge?: string;
  discount?: string;
};

export const PLANS: readonly Plan[] = [
  {
    id: "dasar",
    name: "Dasar",
    price: 5000,
    activeDays: 3,
    activeLabel: "aktif 3 hari",
    photoLimit: 8,
    gameLimit: 1,
    voiceNote: false,
    spotify: false,
    tagline: "Buat kejutan cepat",
    features: [
      "Semua desain",
      "Musik bawaan",
      "Main Berdua (1 permainan)",
      "Kartu QR",
      "Simpan jadi gambar",
      "Ucapan bareng (10 teman)",
      "Kapsul waktu (≤ 30 hari)",
      "Aktif 3 hari",
    ],
    highlight: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: 10000,
    activeDays: 14,
    activeLabel: "aktif 14 hari",
    photoLimit: 8,
    gameLimit: 2,
    voiceNote: true,
    spotify: true,
    tagline: "Pilihan fleksibel",
    features: [
      "Semua isi Dasar",
      "Main Berdua (2 permainan)",
      "Bisa diedit lagi",
      "Voice note ≤ 1 menit",
      "Lagu pilihan (Spotify)",
      "Link custom",
      "Ucapan bareng (50 teman)",
      "Kapsul waktu (≤ 90 hari)",
      "Aktif 14 hari",
    ],
    highlight: true,
    badge: "Pilihan fleksibel",
  },
  {
    id: "abadi",
    name: "Abadi",
    price: 15000,
    priceBefore: 20000,
    activeDays: null,
    activeLabel: "aktif selamanya",
    photoLimit: 8,
    gameLimit: 3,
    voiceNote: true,
    spotify: true,
    tagline: "Kenangan selamanya",
    features: [
      "Semua isi Plus",
      "Aktif selamanya",
      "Main Berdua (3 permainan)",
      "Tampil di Papan Abadi (opsional)",
      "Desain eksklusif bertanda khusus",
      "Ucapan bareng (100 teman)",
      "Kapsul waktu sampai 10 tahun",
    ],
    highlight: false,
    discount: "Hemat 25%",
  },
];

export const PLAN_IDS = ["dasar", "plus", "abadi"] as const;

export const PLAN_BY_ID: Record<PlanId, Plan> = {
  dasar: PLANS[0]!,
  plus: PLANS[1]!,
  abadi: PLANS[2]!,
};

export function getPlan(id: PlanId): Plan {
  return PLAN_BY_ID[id];
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && PLAN_IDS.includes(value as PlanId);
}

export function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}
