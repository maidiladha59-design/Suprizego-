export const DEMO_THEMES = ["pink", "night"] as const;

export type DemoTheme = (typeof DEMO_THEMES)[number];

export const DEMO_THEME_LABELS: Record<DemoTheme, string> = {
  pink: "Permen pink",
  night: "Chat malam",
};

export type DemoStage =
  | "cover"
  | "greeting"
  | "story"
  | "memories"
  | "quiz"
  | "quiz-score"
  | "date"
  | "date-ticket"
  | "question"
  | "answer"
  | "letter"
  | "memory";

export const DEMO_PROGRESS: Record<DemoStage, number> = {
  cover: 1,
  greeting: 2,
  story: 3,
  memories: 4,
  quiz: 5,
  "quiz-score": 5,
  date: 5,
  "date-ticket": 5,
  question: 6,
  answer: 6,
  letter: 7,
  memory: 8,
};

export type DemoActivityKind = "open" | "quiz" | "date" | "yes";

export type DemoActivity = {
  id: number;
  kind: DemoActivityKind;
  text: string;
};

export const DEMO_STORY = [
  "Sekar, Bima simpan beberapa potongan hari yang nggak dia lupa.",
  "Mulai dari sore saat langit jingga dan kalian pulang tanpa buru-buru.",
  "Ada juga bakso langganan yang selalu jadi alasan ketemu lagi.",
  "Sebelum ditutup, Bima punya satu pertanyaan kecil buat kamu.",
] as const;

export type DemoQuizQuestion = {
  question: string;
  choices: readonly [string, string, string];
  correctIndex: number;
  explanation: string;
};

export const DEMO_QUIZ: readonly DemoQuizQuestion[] = [
  {
    question: "Minuman yang selalu Bima pesan?",
    choices: ["Es teh", "Kopi susu", "Matcha"],
    correctIndex: 0,
    explanation: "Betul. Es teh manis selalu jadi temuan ngobrol mereka.",
  },
  {
    question: "Kalau punya waktu kosong, mereka paling suka…",
    choices: ["Nonton film", "Jalan sore", "Main gim"],
    correctIndex: 1,
    explanation: "Iya. Jalan sore tanpa tujuan selalu jadi favorit mereka.",
  },
] as const;

export const DEMO_DATES = ["Makan bakso", "Nonton matahari", "Ngerandum di kafe"] as const;

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
