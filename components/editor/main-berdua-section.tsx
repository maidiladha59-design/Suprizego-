"use client";

import {
  GAME_META,
  GAME_TYPES,
  MAX_CHOICE_LENGTH,
  MAX_CHOICES,
  MAX_GAME_PHOTOS,
  MAX_PROMPT_LENGTH,
  MAX_QUESTION_LENGTH,
  MAX_QUESTIONS,
  MAX_STATEMENT_LENGTH,
  MIN_CHOICES,
  MIN_PHOTOS_FOR_GAME,
  createChoice,
  createGame,
  createQuizQuestion,
  isPlayableGame,
  type Game,
  type GameType,
  type PlanGame,
  type QuizGame,
  type TruthGame,
} from "@/lib/games";
import { PLANS, type Plan } from "@/lib/plans";

type SectionPhoto = {
  id: string;
  url: string | null;
  caption: string;
};

type MainBerduaSectionProps = {
  games: Game[];
  plan: Plan;
  photos: SectionPhoto[];
  onChange: (games: Game[]) => void;
};

const inputClass =
  "h-11 min-w-0 flex-1 rounded-full border-[3px] border-ink bg-white px-3.5 text-sm font-normal leading-5 text-ink placeholder:text-ink-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink";

const removeButtonClass =
  "grid size-10 shrink-0 place-items-center rounded-lg border-[3px] border-ink bg-tangerine font-display text-lg leading-none text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:translate-y-0";

const addQuestionClass =
  "mt-3 inline-flex h-[42px] items-center rounded-xl border-[3px] border-ink bg-lime px-4 font-display text-[0.8rem] uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0";

export function MainBerduaSection({
  games,
  plan,
  photos,
  onChange,
}: MainBerduaSectionProps) {
  const readyPhotos = photos.filter(
    (photo): photo is SectionPhoto & { url: string } => Boolean(photo.url),
  );
  const photoCount = readyPhotos.length;
  const full = games.length >= plan.gameLimit;
  const overLimit = games.length > plan.gameLimit;
  const available = GAME_TYPES.filter(
    (type) => !games.some((game) => game.type === type),
  );
  const planLimits = PLANS.map((item) => `${item.name} ${item.gameLimit}`).join(" · ");

  function updateGame(id: string, updater: (game: Game) => Game) {
    onChange(games.map((game) => (game.id === id ? updater(game) : game)));
  }

  function updateQuiz(id: string, updater: (game: QuizGame) => QuizGame) {
    updateGame(id, (game) => (game.type === "kuis" ? updater(game) : game));
  }

  function updateTruth(id: string, updater: (game: TruthGame) => TruthGame) {
    updateGame(id, (game) => (game.type === "jujur" ? updater(game) : game));
  }

  function updatePlan(id: string, updater: (game: PlanGame) => PlanGame) {
    updateGame(id, (game) => (game.type === "rencana" ? updater(game) : game));
  }

  function addGame(type: GameType) {
    if (full || games.some((game) => game.type === type)) return;
    if (type === "susun" && photoCount < MIN_PHOTOS_FOR_GAME) return;
    onChange([...games, createGame(type)]);
  }

  function removeGame(id: string) {
    onChange(games.filter((game) => game.id !== id));
  }

  function removeQuestion(gameId: string, questionId: string) {
    updateQuiz(gameId, (game) =>
      game.questions.length <= 1
        ? game
        : { ...game, questions: game.questions.filter((item) => item.id !== questionId) },
    );
  }

  function addQuestion(gameId: string) {
    updateQuiz(gameId, (game) =>
      game.questions.length >= MAX_QUESTIONS
        ? game
        : { ...game, questions: [...game.questions, createQuizQuestion()] },
    );
  }

  return (
    <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
          5
        </span>
        <h2 className="font-display text-2xl uppercase leading-8">Main Berdua</h2>
      </div>
      <p className="mt-1 text-sm font-bold leading-5">
        Nggak wajib. Bikin permainan receh buat kalian berdua — hasilnya muncul di
        halaman. {planLimits} permainan.
      </p>

      {overLimit && (
        <p
          role="alert"
          className="mt-4 rounded-xl border-[3px] border-ink bg-tangerine px-3 py-2 text-xs font-bold leading-4 text-ink"
        >
          Paket {plan.name} cuma muat {plan.gameLimit} permainan. Hapus{" "}
          {games.length - plan.gameLimit} dulu, ya.
        </p>
      )}

      {games.length > 0 && (
        <div className="mt-4 space-y-4">
          {games.map((game, index) => {
            const meta = GAME_META[game.type];
            const playable = isPlayableGame(game, photoCount);

            return (
              <article
                key={game.id}
                data-game-card
                className="rounded-2xl border-4 border-ink bg-paper p-4 shadow-[4px_4px_0_0_#111]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-base uppercase leading-5">
                      {index + 1}. {meta.label}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-bold leading-4 text-ink-soft">
                      {meta.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGame(game.id)}
                    className="h-9 shrink-0 rounded-lg border-[3px] border-ink bg-tangerine px-3 font-display text-[11px] uppercase text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    Hapus
                  </button>
                </div>

                {game.type === "kuis" && (
                  <>
                    <div className="mt-3 space-y-3">
                      {game.questions.map((question, questionIndex) => (
                        <fieldset
                          key={question.id}
                          className="rounded-xl border-[3px] border-ink bg-white px-3 pb-3 pt-1"
                        >
                          <legend className="ml-1 px-1 text-[10px] font-bold uppercase tracking-[0.04em]">
                            Soal {questionIndex + 1}
                          </legend>

                          <input
                            type="text"
                            value={question.text}
                            onChange={(event) =>
                              updateQuiz(game.id, (item) => ({
                                ...item,
                                questions: item.questions.map((entry) =>
                                  entry.id === question.id
                                    ? { ...entry, text: event.target.value }
                                    : entry,
                                ),
                              }))
                            }
                            maxLength={MAX_QUESTION_LENGTH}
                            placeholder="Makanan yang paling sering aku pesan?"
                            aria-label={`Pertanyaan soal ${questionIndex + 1}`}
                            className={`${inputClass} w-full`}
                          />

                          <p className="mt-2 text-[11px] font-bold leading-4">
                            Pilihan jawaban. Tandai yang benar.
                          </p>

                          <div className="mt-1.5 space-y-2">
                            {question.choices.map((choice, choiceIndex) => (
                              <div key={choice.id} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`benar-${question.id}`}
                                  checked={choice.correct}
                                  onChange={() =>
                                    updateQuiz(game.id, (item) => ({
                                      ...item,
                                      questions: item.questions.map((entry) =>
                                        entry.id === question.id
                                          ? {
                                              ...entry,
                                              choices: entry.choices.map((option) => ({
                                                ...option,
                                                correct: option.id === choice.id,
                                              })),
                                            }
                                          : entry,
                                      ),
                                    }))
                                  }
                                  aria-label={`Tandai pilihan ${choiceIndex + 1} sebagai jawaban benar`}
                                  className="size-4 shrink-0 accent-ink"
                                />
                                <input
                                  type="text"
                                  value={choice.text}
                                  onChange={(event) =>
                                    updateQuiz(game.id, (item) => ({
                                      ...item,
                                      questions: item.questions.map((entry) =>
                                        entry.id === question.id
                                          ? {
                                              ...entry,
                                              choices: entry.choices.map((option) =>
                                                option.id === choice.id
                                                  ? { ...option, text: event.target.value }
                                                  : option,
                                              ),
                                            }
                                          : entry,
                                      ),
                                    }))
                                  }
                                  maxLength={MAX_CHOICE_LENGTH}
                                  placeholder={`Pilihan ${choiceIndex + 1}`}
                                  aria-label={`Pilihan ${choiceIndex + 1} soal ${questionIndex + 1}`}
                                  className={inputClass}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuiz(game.id, (item) => {
                                      if (question.choices.length <= MIN_CHOICES) return item;
                                      const remaining = question.choices.filter(
                                        (option) => option.id !== choice.id,
                                      );
                                      if (!remaining.some((option) => option.correct)) {
                                        remaining[0] = { ...remaining[0]!, correct: true };
                                      }
                                      return {
                                        ...item,
                                        questions: item.questions.map((entry) =>
                                          entry.id === question.id
                                            ? { ...entry, choices: remaining }
                                            : entry,
                                        ),
                                      };
                                    })
                                  }
                                  disabled={question.choices.length <= MIN_CHOICES}
                                  aria-label={`Hapus pilihan ${choiceIndex + 1}`}
                                  className={removeButtonClass}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuiz(game.id, (item) => ({
                                  ...item,
                                  questions: item.questions.map((entry) =>
                                    entry.id === question.id
                                      ? {
                                          ...entry,
                                          choices:
                                            entry.choices.length >= MAX_CHOICES
                                              ? entry.choices
                                              : [...entry.choices, createChoice()],
                                        }
                                      : entry,
                                  ),
                                }))
                              }
                              disabled={question.choices.length >= MAX_CHOICES}
                              className="inline-flex items-center border-b-2 border-ink text-[11px] font-bold uppercase leading-4 tracking-[0.02em] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              + pilihan
                            </button>

                            {game.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(game.id, question.id)}
                                className="text-[10px] font-bold uppercase leading-4 underline underline-offset-2 text-ink-soft hover:text-ink"
                              >
                                Hapus soal
                              </button>
                            )}
                          </div>
                        </fieldset>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addQuestion(game.id)}
                      disabled={game.questions.length >= MAX_QUESTIONS}
                      className={addQuestionClass}
                    >
                      + Tambah soal
                    </button>
                  </>
                )}

                {game.type === "jujur" && (
                  <div className="mt-3 rounded-xl border-[3px] border-ink bg-white p-3">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.04em]">
                      Pertanyaan
                      <input
                        type="text"
                        value={game.prompt}
                        onChange={(event) =>
                          updateTruth(game.id, (item) => ({
                            ...item,
                            prompt: event.target.value,
                          }))
                        }
                        maxLength={MAX_PROMPT_LENGTH}
                        placeholder="Mana yang bohong?"
                        className={`${inputClass} mt-1 w-full`}
                      />
                    </label>

                    <p className="mt-2 text-[11px] font-bold leading-4">
                      Tiga pernyataan. Tandai satu yang bohong.
                    </p>

                    <div className="mt-1.5 space-y-2">
                      {game.statements.map((statement, statementIndex) => (
                        <div key={statementIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`bohong-${game.id}`}
                            checked={game.lieIndex === statementIndex}
                            onChange={() =>
                              updateTruth(game.id, (item) => ({
                                ...item,
                                lieIndex: statementIndex,
                              }))
                            }
                            aria-label={`Tandai pernyataan ${statementIndex + 1} sebagai bohong`}
                            className="size-4 shrink-0 accent-ink"
                          />
                          <input
                            type="text"
                            value={statement}
                            onChange={(event) =>
                              updateTruth(game.id, (item) => ({
                                ...item,
                                statements: item.statements.map((entry, entryIndex) =>
                                  entryIndex === statementIndex
                                    ? event.target.value
                                    : entry,
                                ),
                              }))
                            }
                            maxLength={MAX_STATEMENT_LENGTH}
                            placeholder={`Pernyataan ${statementIndex + 1}`}
                            aria-label={`Pernyataan ${statementIndex + 1}`}
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {game.type === "rencana" && (
                  <div className="mt-3 rounded-xl border-[3px] border-ink bg-white p-3">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.04em]">
                      Ajakan
                      <input
                        type="text"
                        value={game.prompt}
                        onChange={(event) =>
                          updatePlan(game.id, (item) => ({
                            ...item,
                            prompt: event.target.value,
                          }))
                        }
                        maxLength={MAX_PROMPT_LENGTH}
                        placeholder="Kalau kamu mau, kencan pertama kita:"
                        className={`${inputClass} mt-1 w-full`}
                      />
                    </label>

                    <p className="mt-2 text-[11px] font-bold leading-4">
                      Dia bakal pilih satu. Pilihan itu jadi tiket janji.
                    </p>

                    <div className="mt-1.5 space-y-2">
                      {game.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={choice}
                            onChange={(event) =>
                              updatePlan(game.id, (item) => ({
                                ...item,
                                choices: item.choices.map((entry, entryIndex) =>
                                  entryIndex === choiceIndex
                                    ? event.target.value
                                    : entry,
                                ),
                              }))
                            }
                            maxLength={MAX_CHOICE_LENGTH}
                            placeholder={`Rencana ${choiceIndex + 1}`}
                            aria-label={`Rencana ${choiceIndex + 1}`}
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updatePlan(game.id, (item) => ({
                                ...item,
                                choices:
                                  item.choices.length <= MIN_CHOICES
                                    ? item.choices
                                    : item.choices.filter(
                                        (_, entryIndex) => entryIndex !== choiceIndex,
                                      ),
                              }))
                            }
                            disabled={game.choices.length <= MIN_CHOICES}
                            aria-label={`Hapus rencana ${choiceIndex + 1}`}
                            className={removeButtonClass}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updatePlan(game.id, (item) => ({
                          ...item,
                          choices:
                            item.choices.length >= MAX_CHOICES
                              ? item.choices
                              : [...item.choices, ""],
                        }))
                      }
                      disabled={game.choices.length >= MAX_CHOICES}
                      className="mt-2 inline-flex items-center border-b-2 border-ink text-[11px] font-bold uppercase leading-4 tracking-[0.02em] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + pilihan
                    </button>
                  </div>
                )}

                {game.type === "susun" && (
                  <div className="mt-3 rounded-xl border-[3px] border-ink bg-white p-3">
                    {photoCount >= MIN_PHOTOS_FOR_GAME ? (
                      <>
                        <p className="text-[11px] font-bold leading-4">
                          Pakai {Math.min(photoCount, MAX_GAME_PHOTOS)} foto pertama dari
                          bagian Foto. Penerima bebas menyusun ulang.
                        </p>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {readyPhotos.slice(0, MAX_GAME_PHOTOS).map((photo, photoIndex) => (
                            <div
                              key={photo.id}
                              className="relative aspect-square overflow-hidden rounded-lg border-2 border-ink bg-paper"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal dari blob */}
                              <img
                                src={photo.url}
                                alt={photo.caption || `Foto ${photoIndex + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-md border-2 border-ink bg-paper font-display text-[10px] leading-none">
                                {photoIndex + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] font-bold leading-4">
                        Tambah minimal 2 foto di bagian Foto supaya permainan ini bisa
                        dimainkan.
                      </p>
                    )}
                  </div>
                )}

                {!playable && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-ink/20 px-2 py-1 text-[10px] font-bold leading-4">
                    <span className="size-2 shrink-0 rounded-full bg-tangerine" />
                    Lengkapi isian di atas supaya bisa dimainkan.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!full && !overLimit && available.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase leading-4 tracking-[0.04em]">
            Tambah permainan
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {available.map((type) => {
              const needsPhotos =
                type === "susun" && photoCount < MIN_PHOTOS_FOR_GAME;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addGame(type)}
                  disabled={needsPhotos}
                  className={`rounded-xl border-[3px] border-dashed p-3 text-left transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    needsPhotos
                      ? "cursor-not-allowed border-dashed border-ink bg-sand text-ink-soft"
                      : "border-ink bg-lime text-ink hover:-translate-y-0.5"
                  }`}
                >
                  <span className="block font-display text-xs uppercase leading-4">
                    + {GAME_META[type].label}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-bold leading-4">
                    {needsPhotos
                      ? GAME_META.susun.addDescription
                      : GAME_META[type].addDescription}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {full && !overLimit && (
        <p className="mt-4 rounded-lg border-2 border-dashed border-ink/30 bg-paper px-3 py-2 text-[11px] font-bold leading-4">
          Batas paket {plan.name}: {plan.gameLimit} permainan. Hapus satu buat ganti.
        </p>
      )}
    </section>
  );
}
