export const DEMO_THEMES = ["pink", "night"] as const;

export type DemoTheme = (typeof DEMO_THEMES)[number];

export const DEMO_THEME_LABELS: Record<DemoTheme, string> = {
  pink: "Permen pink",
  night: "Chat malam",
};

export type DemoActivityKind = "open" | "yes";

export type DemoActivity = {
  id: number;
  kind: DemoActivityKind;
  text: string;
};

export const DEMO_NEGATIVE_LABELS = [
  "Nggak",
  "Yakin?",
  "Coba lagi",
  "Ih kabur",
  "Awas!",
  "Nggak bisa",
  "Menyerah?",
] as const;

export function getNegativeLabel(attempts: number) {
  return DEMO_NEGATIVE_LABELS[attempts % DEMO_NEGATIVE_LABELS.length] ?? "Nggak";
}

export function getAvoidPosition(width: number) {
  const max = Math.max(0, width - 150);
  const random = Math.random();

  if (max >= 120 && random < 0.6) {
    return {
      x: 120 + Math.random() * (max - 120),
      y: 90 * Math.random(),
    };
  }

  return {
    x: Math.random() * max,
    y: 70 + 20 * Math.random(),
  };
}
