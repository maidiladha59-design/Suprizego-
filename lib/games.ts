import { PLANS } from "./plans";

export const GAME_TYPES = ["kuis", "jujur", "susun", "rencana"] as const;
export type GameType = (typeof GAME_TYPES)[number];

export const MAX_QUESTIONS = 5;
export const MIN_CHOICES = 2;
export const MAX_CHOICES = 4;
export const MIN_PHOTOS_FOR_GAME = 2;
export const MAX_GAME_PHOTOS = 4;
export const MAX_QUESTION_LENGTH = 90;
export const MAX_CHOICE_LENGTH = 40;
export const MAX_STATEMENT_LENGTH = 90;
export const MAX_PROMPT_LENGTH = 100;
export const MAX_GAMES = Math.max(...PLANS.map((plan) => plan.gameLimit));

export type QuizChoice = {
  id: string;
  text: string;
  correct: boolean;
};

export type QuizQuestion = {
  id: string;
  text: string;
  choices: QuizChoice[];
};

export type QuizGame = {
  id: string;
  type: "kuis";
  questions: QuizQuestion[];
};

export type TruthGame = {
  id: string;
  type: "jujur";
  prompt: string;
  statements: string[];
  lieIndex: number;
};

export type PhotoGame = {
  id: string;
  type: "susun";
};

export type PlanGame = {
  id: string;
  type: "rencana";
  prompt: string;
  choices: string[];
};

export type Game = QuizGame | TruthGame | PhotoGame | PlanGame;

export const GAME_META: Record<
  GameType,
  { label: string; description: string; addDescription: string }
> = {
  kuis: {
    label: "Kuis Kenal Aku",
    description: "Kamu yang nulis pertanyaan soal dirimu. Dia yang nebak, skornya balik ke kamu.",
    addDescription: "Pertanyaan receh soal kamu, dia yang jawab.",
  },
  jujur: {
    label: "Dua Jujur Satu Bohong",
    description: "Tiga cerita tentang kalian. Satu cuma karangan, dia harus bisa ngebedain.",
    addDescription: "Dua fakta, satu karangan. Dia harus jeli.",
  },
  susun: {
    label: "Susun Foto",
    description: "Dia bakal main urut-urutan foto dari bagian Kenangan.",
    addDescription: "Tambah foto dulu di bagian Foto.",
  },
  rencana: {
    label: "Rencana Bareng",
    description: "Siapin beberapa pilihan rencana. Dia pilih satu, pilihan itu jadi tiket janji.",
    addDescription: "Dia pilih satu rencana, jadinya tiket janji.",
  },
};

function fallbackId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? fallbackId();
}

function readId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.slice(0, 64) : makeId();
}

function readText(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

export function createChoice(correct = false): QuizChoice {
  return { id: makeId(), text: "", correct };
}

export function createQuizQuestion(): QuizQuestion {
  return {
    id: makeId(),
    text: "",
    choices: [createChoice(true), createChoice(), createChoice()],
  };
}

export function createGame(type: GameType): Game {
  switch (type) {
    case "kuis":
      return { id: makeId(), type, questions: [createQuizQuestion()] };
    case "jujur":
      return {
        id: makeId(),
        type,
        prompt: "Mana yang bohong?",
        statements: ["", "", ""],
        lieIndex: 0,
      };
    case "susun":
      return { id: makeId(), type };
    case "rencana":
      return {
        id: makeId(),
        type,
        prompt: "",
        choices: ["", "", ""],
      };
  }
}

function normalizeChoice(value: unknown): QuizChoice | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  return {
    id: readId(source.id),
    text: readText(source.text, MAX_CHOICE_LENGTH),
    correct: source.correct === true,
  };
}

function normalizeQuestion(value: unknown): QuizQuestion | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const rawChoices = Array.isArray(source.choices)
    ? source.choices
        .map(normalizeChoice)
        .filter((choice): choice is QuizChoice => choice !== null)
        .slice(0, MAX_CHOICES)
    : [];

  const choices = rawChoices.length > 0 ? rawChoices : [createChoice(true)];
  while (choices.length < MIN_CHOICES) choices.push(createChoice());

  let seenCorrect = false;
  const fixed = choices.map((choice) => {
    if (!choice.correct) return choice;
    if (seenCorrect) return { ...choice, correct: false };
    seenCorrect = true;
    return choice;
  });
  if (!seenCorrect) fixed[0] = { ...fixed[0]!, correct: true };

  return {
    id: readId(source.id),
    text: readText(source.text, MAX_QUESTION_LENGTH),
    choices: fixed,
  };
}

function normalizeQuiz(value: Record<string, unknown>): QuizGame {
  const rawQuestions = Array.isArray(value.questions)
    ? value.questions
        .map(normalizeQuestion)
        .filter((question): question is QuizQuestion => question !== null)
        .slice(0, MAX_QUESTIONS)
    : [];

  return {
    id: readId(value.id),
    type: "kuis",
    questions: rawQuestions.length > 0 ? rawQuestions : [createQuizQuestion()],
  };
}

function normalizeTruth(value: Record<string, unknown>): TruthGame {
  const statements = Array.isArray(value.statements)
    ? value.statements
        .filter((item): item is string => typeof item === "string")
        .slice(0, 3)
        .map((item) => item.slice(0, MAX_STATEMENT_LENGTH))
    : [];
  while (statements.length < 3) statements.push("");

  const lie =
    typeof value.lieIndex === "number" && value.lieIndex >= 0 && value.lieIndex <= 2
      ? Math.trunc(value.lieIndex)
      : 0;

  return {
    id: readId(value.id),
    type: "jujur",
    prompt: readText(value.prompt, MAX_PROMPT_LENGTH) || "Mana yang bohong?",
    statements,
    lieIndex: lie,
  };
}

function normalizePlan(value: Record<string, unknown>): PlanGame {
  const choices = Array.isArray(value.choices)
    ? value.choices
        .filter((item): item is string => typeof item === "string")
        .slice(0, MAX_CHOICES)
        .map((item) => item.slice(0, MAX_CHOICE_LENGTH))
    : [];
  while (choices.length < MIN_CHOICES) choices.push("");

  return {
    id: readId(value.id),
    type: "rencana",
    prompt: readText(value.prompt, MAX_PROMPT_LENGTH),
    choices,
  };
}

export function normalizeGames(value: unknown, gameLimit = MAX_GAMES): Game[] {
  if (!Array.isArray(value)) return [];
  const maxGames = Math.max(0, Math.min(MAX_GAMES, Math.floor(gameLimit)));
  if (maxGames === 0) return [];

  const games: Game[] = [];
  const seen = new Set<GameType>();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const source = item as Record<string, unknown>;
    const type = source.type;

    if (type === "kuis" || type === "jujur" || type === "susun" || type === "rencana") {
      if (seen.has(type)) continue;
      seen.add(type);
      const game =
        type === "kuis"
          ? normalizeQuiz(source)
          : type === "jujur"
            ? normalizeTruth(source)
            : type === "susun"
              ? { id: readId(source.id), type: "susun" as const }
              : normalizePlan(source);
      games.push(game);
      if (games.length >= maxGames) break;
    }
  }

  return games;
}

export function getQuizQuestions(game: QuizGame): QuizQuestion[] {
  return game.questions
    .map((question) => {
      let seenCorrect = false;
      const choices = question.choices
        .filter((choice) => choice.text.trim().length > 0)
        .map((choice) => {
          if (!choice.correct) return choice;
          if (seenCorrect) return { ...choice, correct: false };
          seenCorrect = true;
          return choice;
        });
      return { ...question, choices };
    })
    .filter(
      (question) =>
        question.text.trim().length > 0 &&
        question.choices.length >= MIN_CHOICES &&
        question.choices.some((choice) => choice.correct),
    );
}

export function getTruthStatements(game: TruthGame): string[] {
  return game.statements.slice(0, 3).map((statement) => statement.trim());
}

export function getPlanChoices(game: PlanGame): string[] {
  return game.choices.map((choice) => choice.trim()).filter(Boolean);
}

export function isPlayableGame(game: Game, photoCount: number) {
  switch (game.type) {
    case "kuis":
      return getQuizQuestions(game).length > 0;
    case "jujur":
      return getTruthStatements(game).every(Boolean);
    case "susun":
      return photoCount >= MIN_PHOTOS_FOR_GAME;
    case "rencana":
      return getPlanChoices(game).length >= MIN_CHOICES;
  }
}

export function getPlayableGames(
  games: Game[],
  photoCount: number,
  gameLimit = MAX_GAMES,
): Game[] {
  const maxGames = Math.max(0, Math.min(MAX_GAMES, Math.floor(gameLimit)));
  return games
    .filter((game) => isPlayableGame(game, photoCount))
    .slice(0, maxGames);
}
