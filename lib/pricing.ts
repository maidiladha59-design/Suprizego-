export const PLAN_IDS = ["dasar", "plus", "abadi"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type PlanPricing = {
  name: string;
  price: number;
  priceBefore?: number;
  activeDays: number | null;
  activeLabel: string;
};

export const PRICING: Record<PlanId, PlanPricing> = {
  dasar: {
    name: "Dasar",
    price: 5000,
    activeDays: 3,
    activeLabel: "aktif 3 hari",
  },
  plus: {
    name: "Plus",
    price: 10000,
    activeDays: 14,
    activeLabel: "aktif 14 hari",
  },
  abadi: {
    name: "Abadi",
    price: 15000,
    priceBefore: 20000,
    activeDays: null,
    activeLabel: "aktif selamanya",
  },
};

export function getPricing(id: PlanId): PlanPricing {
  return PRICING[id];
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && PLAN_IDS.includes(value as PlanId);
}

export function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}
