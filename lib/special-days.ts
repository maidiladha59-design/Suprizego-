export const SPECIAL_DAY_IDS = [
  "hari-guru",
  "valentine",
  "imlek",
  "lebaran",
  "halloween",
  "natal",
  "tahun-baru",
  "hari-ayah",
  "hari-ibu",
  "hari-anak",
  "kartini",
  "hardiknas",
  "kemerdekaan",
  "batik",
  "sumpah-pemuda",
  "pahlawan",
  "persahabatan",
] as const;

export type SpecialDayId = (typeof SPECIAL_DAY_IDS)[number];
export type SpecialDayTheme = "ceria" | "hangat" | "tenang" | "gelap";

export type CalendarDate = {
  tahun: number;
  bulan: number;
  hari: number;
};

type FixedDateRule = {
  jenis: "tetap";
  bulan: number;
  hari: number;
};

type LunarDateRule = {
  jenis: "imlek" | "lebaran";
};

export type SpecialDayDateRule = FixedDateRule | LunarDateRule;

export type SpecialDayIconId =
  | "buku"
  | "hati"
  | "lentera"
  | "bulan"
  | "labu"
  | "pohon"
  | "pesta"
  | "kemeja"
  | "bunga"
  | "layangan"
  | "kembang"
  | "pensil"
  | "bendera"
  | "benang"
  | "gulungan"
  | "lilin"
  | "tangan";

export type SpecialDay = {
  id: SpecialDayId;
  nama: string;
  ikon: SpecialDayIconId;
  tanggal: SpecialDayDateRule;
  tema: SpecialDayTheme;
};

export const SPECIAL_DAYS: readonly SpecialDay[] = [
  {
    id: "hari-guru",
    nama: "Hari Guru",
    ikon: "buku",
    tanggal: { jenis: "tetap", bulan: 11, hari: 25 },
    tema: "ceria",
  },
  {
    id: "valentine",
    nama: "Valentine",
    ikon: "hati",
    tanggal: { jenis: "tetap", bulan: 2, hari: 14 },
    tema: "hangat",
  },
  {
    id: "imlek",
    nama: "Imlek",
    ikon: "lentera",
    tanggal: { jenis: "imlek" },
    tema: "ceria",
  },
  {
    id: "lebaran",
    nama: "Lebaran",
    ikon: "bulan",
    tanggal: { jenis: "lebaran" },
    tema: "hangat",
  },
  {
    id: "halloween",
    nama: "Halloween",
    ikon: "labu",
    tanggal: { jenis: "tetap", bulan: 10, hari: 31 },
    tema: "gelap",
  },
  {
    id: "natal",
    nama: "Natal",
    ikon: "pohon",
    tanggal: { jenis: "tetap", bulan: 12, hari: 25 },
    tema: "hangat",
  },
  {
    id: "tahun-baru",
    nama: "Tahun Baru",
    ikon: "pesta",
    tanggal: { jenis: "tetap", bulan: 1, hari: 1 },
    tema: "ceria",
  },
  {
    id: "hari-ayah",
    nama: "Hari Ayah",
    ikon: "kemeja",
    tanggal: { jenis: "tetap", bulan: 11, hari: 12 },
    tema: "tenang",
  },
  {
    id: "hari-ibu",
    nama: "Hari Ibu",
    ikon: "bunga",
    tanggal: { jenis: "tetap", bulan: 12, hari: 22 },
    tema: "hangat",
  },
  {
    id: "hari-anak",
    nama: "Hari Anak Nasional",
    ikon: "layangan",
    tanggal: { jenis: "tetap", bulan: 7, hari: 23 },
    tema: "ceria",
  },
  {
    id: "kartini",
    nama: "Hari Kartini",
    ikon: "kembang",
    tanggal: { jenis: "tetap", bulan: 4, hari: 21 },
    tema: "tenang",
  },
  {
    id: "hardiknas",
    nama: "Hari Pendidikan Nasional",
    ikon: "pensil",
    tanggal: { jenis: "tetap", bulan: 5, hari: 2 },
    tema: "ceria",
  },
  {
    id: "kemerdekaan",
    nama: "Hari Kemerdekaan",
    ikon: "bendera",
    tanggal: { jenis: "tetap", bulan: 8, hari: 17 },
    tema: "ceria",
  },
  {
    id: "batik",
    nama: "Hari Batik",
    ikon: "benang",
    tanggal: { jenis: "tetap", bulan: 10, hari: 2 },
    tema: "tenang",
  },
  {
    id: "sumpah-pemuda",
    nama: "Hari Sumpah Pemuda",
    ikon: "gulungan",
    tanggal: { jenis: "tetap", bulan: 10, hari: 28 },
    tema: "ceria",
  },
  {
    id: "pahlawan",
    nama: "Hari Pahlawan",
    ikon: "lilin",
    tanggal: { jenis: "tetap", bulan: 11, hari: 10 },
    tema: "tenang",
  },
  {
    id: "persahabatan",
    nama: "Hari Persahabatan",
    ikon: "tangan",
    tanggal: { jenis: "tetap", bulan: 7, hari: 30 },
    tema: "ceria",
  },
];

const TANGGAL_IMLEK: Readonly<Record<number, Pick<CalendarDate, "bulan" | "hari">>> = {
  2025: { bulan: 1, hari: 29 },
  2026: { bulan: 2, hari: 17 },
  2027: { bulan: 2, hari: 6 },
  2028: { bulan: 1, hari: 26 },
  2029: { bulan: 2, hari: 13 },
  2030: { bulan: 2, hari: 3 },
};

const TANGGAL_LEBARAN: Readonly<Record<number, Pick<CalendarDate, "bulan" | "hari">>> = {
  2025: { bulan: 3, hari: 31 },
  2026: { bulan: 3, hari: 20 },
  2027: { bulan: 3, hari: 10 },
  2028: { bulan: 2, hari: 28 },
  2029: { bulan: 2, hari: 16 },
  2030: { bulan: 2, hari: 5 },
};

export const HARI_BUKA_SEBELUM = 21;
export const HARI_BUKA_SESUDAH = 3;

const DAY_MS = 86_400_000;

export type SpecialDayStatus = "musim" | "terkunci";

export type SpecialDayOccurrence = {
  day: SpecialDay;
  status: SpecialDayStatus;
  tanggalHariH: CalendarDate;
  tanggalBuka: CalendarDate;
  tanggalTutup: CalendarDate;
  daysUntil: number;
  daysUntilOpen: number;
};

function tanggalUtc(date: CalendarDate): number {
  return Date.UTC(date.tahun, date.bulan - 1, date.hari);
}

function dariUtc(timestamp: number): CalendarDate {
  const date = new Date(timestamp);
  return {
    tahun: date.getUTCFullYear(),
    bulan: date.getUTCMonth() + 1,
    hari: date.getUTCDate(),
  };
}

function tambahHari(date: CalendarDate, amount: number): CalendarDate {
  return dariUtc(tanggalUtc(date) + amount * DAY_MS);
}

function selisihHari(target: CalendarDate, from: CalendarDate): number {
  return Math.round((tanggalUtc(target) - tanggalUtc(from)) / DAY_MS);
}

function tanggalHariIni(now: Date): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  const tahun = Number(value("year"));
  const bulan = Number(value("month"));
  const hari = Number(value("day"));

  if (!Number.isInteger(tahun) || !Number.isInteger(bulan) || !Number.isInteger(hari)) {
    throw new Error("Tanggal hari ini tidak bisa dihitung.");
  }

  return { tahun, bulan, hari };
}

function resolveTanggal(rule: SpecialDayDateRule, year: number): CalendarDate {
  if (rule.jenis === "tetap") {
    return { tahun: year, bulan: rule.bulan, hari: rule.hari };
  }

  const table = rule.jenis === "imlek" ? TANGGAL_IMLEK : TANGGAL_LEBARAN;
  const date = table[year];

  if (!date) {
    throw new Error(`Tanggal ${rule.jenis} ${year} belum dikonfigurasi. Perbarui tabel tahunan.`);
  }

  return { tahun: year, bulan: date.bulan, hari: date.hari };
}

function createOccurrence(day: SpecialDay, year: number, today: CalendarDate): SpecialDayOccurrence {
  const tanggalHariH = resolveTanggal(day.tanggal, year);
  const tanggalBuka = tambahHari(tanggalHariH, -HARI_BUKA_SEBELUM);
  const tanggalTutup = tambahHari(tanggalHariH, HARI_BUKA_SESUDAH);
  const daysUntilOpen = selisihHari(tanggalBuka, today);

  return {
    day,
    status: daysUntilOpen <= 0 && selisihHari(tanggalTutup, today) >= 0 ? "musim" : "terkunci",
    tanggalHariH,
    tanggalBuka,
    tanggalTutup,
    daysUntil: selisihHari(tanggalHariH, today),
    daysUntilOpen,
  };
}

export function isSpecialDayId(value: unknown): value is SpecialDayId {
  return typeof value === "string" && SPECIAL_DAY_IDS.some((id) => id === value);
}

export function getSpecialDay(id: SpecialDayId): SpecialDay {
  const day = SPECIAL_DAYS.find((item) => item.id === id);
  if (!day) {
    throw new Error(`Hari spesial tidak dikenal: ${id}`);
  }
  return day;
}

export function getSpecialDayOccurrences(now: Date = new Date()): SpecialDayOccurrence[] {
  const today = tanggalHariIni(now);

  return SPECIAL_DAYS.map((day) => {
    const currentYear = createOccurrence(day, today.tahun, today);
    if (selisihHari(currentYear.tanggalTutup, today) >= 0) {
      return currentYear;
    }
    return createOccurrence(day, today.tahun + 1, today);
  });
}

export function getSpecialDayStatus(id: SpecialDayId, now: Date = new Date()): SpecialDayOccurrence {
  const occurrence = getSpecialDayOccurrences(now).find((item) => item.day.id === id);
  if (!occurrence) {
    throw new Error(`Hari spesial tidak dikenal: ${id}`);
  }
  return occurrence;
}

export function getActiveSpecialDay(now: Date = new Date()): SpecialDayOccurrence | null {
  return getSpecialDayOccurrences(now).find((item) => item.status === "musim") ?? null;
}

export function formatSpecialDayDate(date: CalendarDate): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(tanggalUtc(date)))
    .replace(/\./g, "");
}
