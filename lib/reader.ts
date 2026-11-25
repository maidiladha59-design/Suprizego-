import { EDITOR_CONFIG, type EditorDesign } from "./editor";
import { getPlayableGames } from "./games";
import type { MomentId } from "./moments";
import type { SurprisePage } from "./types";

export const READER_STEP_IDS = [
  "envelope",
  "greeting",
  "story",
  "memories",
  "games",
  "letter",
  "question",
  "closing",
] as const;

export type ReaderStepId = (typeof READER_STEP_IDS)[number];

export type ReaderStep = {
  id: ReaderStepId;
  order: number;
};

const STEP_ORDER: Record<ReaderStepId, number> = {
  envelope: 1,
  greeting: 2,
  story: 3,
  memories: 4,
  games: 5,
  letter: 6,
  question: 7,
  closing: 8,
};

const DEFAULT_QUESTIONS: Record<MomentId, string> = {
  pengakuan: "Mau jadi pacarku?",
  "ulang-tahun": "Apa harapanmu tahun ini?",
  anniversary: "Masih mau bareng aku?",
  "minta-maaf": "Maafkan aku, ya?",
  wisuda: "Bangga nggak sama aku?",
};

function chunkText(text: string, maxLength: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function splitIntoBubbles(text: string | null | undefined, maxLength = 220) {
  if (!text?.trim()) return [];

  return text
    .split(/\n+/)
    .flatMap((paragraph) => paragraph.match(/[^.!?…]+(?:[.!?…]+[”’"']?|$)/g) ?? [paragraph])
    .flatMap((sentence) => {
      const trimmed = sentence.trim();
      return trimmed.length > maxLength ? chunkText(trimmed, maxLength) : [trimmed];
    })
    .filter(Boolean);
}

export function getReaderSteps(page: SurprisePage): ReaderStep[] {
  const available: Record<ReaderStepId, boolean> = {
    envelope: true,
    greeting: true,
    story: splitIntoBubbles(page.story).length > 0,
    memories: page.photoUrls.length > 0,
    games: getPlayableGames(page.games ?? [], page.photoUrls.length).length > 0,
    letter: Boolean(page.letter?.trim()),
    question: true,
    closing: true,
  };

  return READER_STEP_IDS.filter((id) => available[id]).map((id) => ({
    id,
    order: STEP_ORDER[id],
  }));
}

export function getReaderQuestion(page: SurprisePage) {
  return page.question?.trim() || DEFAULT_QUESTIONS[page.moment];
}

export function getReaderTheme(page: SurprisePage): EditorDesign {
  const designs = EDITOR_CONFIG[page.moment].designs;
  const selected = designs.find((design) => design.id === page.designId);
  return selected && selected.text === "#111111" ? selected : designs[0];
}

export function getReaderDateLabel(page: SurprisePage) {
  return page.dateLabel?.trim() || null;
}
