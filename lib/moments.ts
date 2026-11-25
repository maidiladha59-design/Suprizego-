export const MOMENT_IDS = [
  "pengakuan",
  "ulang-tahun",
  "anniversary",
  "minta-maaf",
  "wisuda",
] as const;

export type MomentId = (typeof MOMENT_IDS)[number];

export type Moment = {
  id: MomentId;
  label: string;
  tagline: string;
  badge: string;
  description: string;
  accent: string;
  accentInk: string;
};

export const MOMENTS: readonly Moment[] = [
  {
    id: "pengakuan",
    label: "Pengakuan",
    tagline: "Saat keberanian akhirnya datang.",
    badge: "surat rahasia",
    description:
      "Ungkap perasaan yang selama ini diam-diam. Satu halaman jujur, tanpa harus menatap langsung.",
    accent: "#f08a9b",
    accentInk: "#b03a52",
  },
  {
    id: "ulang-tahun",
    label: "Ulang Tahun",
    tagline: "Rayakan hari istimewanya.",
    badge: "lagu + doa",
    description:
      "Kumpulkan cerita, foto, dan doa dalam satu halaman ulang tahun yang personal.",
    accent: "#f2b05e",
    accentInk: "#9a651f",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    tagline: "Rayakan perjalanan kalian.",
    badge: "galeri kenangan",
    description:
      "Kenang momen kecil dan besar yang membuat hubungan ini tetap bertahan.",
    accent: "#e58fb8",
    accentInk: "#a4476f",
  },
  {
    id: "minta-maaf",
    label: "Minta Maaf",
    tagline: "Ucapkan maaf yang selama ini tertahan.",
    badge: "surat + janji",
    description:
      "Sampaikan penyesalan dengan tenang, lengkap dengan alasan dan janji untuk berubah.",
    accent: "#8fb8a8",
    accentInk: "#3f6b5b",
  },
  {
    id: "wisuda",
    label: "Wisuda",
    tagline: "Apresiasi perjuangannya.",
    badge: "cerita + foto",
    description:
      "Rayakan toga, kerja keras, dan semua malam panjang yang akhirnya terbayar.",
    accent: "#a3a1ec",
    accentInk: "#5452b3",
  },
];

export function isMomentId(value: string): value is MomentId {
  return MOMENT_IDS.some((id) => id === value);
}

export function getMoment(id: MomentId): Moment {
  const moment = MOMENTS.find((item) => item.id === id);
  if (!moment) {
    throw new Error(`Momen tidak dikenal: ${id}`);
  }
  return moment;
}
