"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  MAX_GAME_PHOTOS,
  getPlanChoices,
  getPlayableGames,
  getQuizQuestions,
  getTruthStatements,
  type Game,
  type PlanGame,
  type QuizGame,
  type TruthGame,
} from "@/lib/games";

type MainBerduaPlayerProps = {
  games: Game[];
  photoUrls: string[];
  recipientName: string;
  senderName: string | null;
  onComplete?: () => void;
  embedded?: boolean;
  gameLimit?: number;
};

type GameViewProps = {
  gameNumber: number;
  totalGames: number;
  recipientName: string;
  senderName: string | null;
  isLast: boolean;
  onAdvance: () => void;
  onSkip: () => void;
  embedded?: boolean;
};

function senderLabel(senderName: string | null) {
  return senderName?.trim() || "pembuat halaman";
}

function recipientLabel(recipientName: string) {
  return recipientName.trim() || "Kamu";
}

export function MainBerduaPlayer({
  games,
  photoUrls,
  recipientName,
  senderName,
  onComplete,
  embedded = false,
  gameLimit,
}: MainBerduaPlayerProps) {
  const playable = useMemo(
    () => getPlayableGames(games, photoUrls.length, gameLimit),
    [games, photoUrls.length, gameLimit],
  );
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  if (playable.length === 0) return null;
  const activeIndex = Math.min(index, playable.length - 1);

  function advance() {
    if (activeIndex >= playable.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => Math.min(current + 1, playable.length - 1));
  }

  function continueReading() {
    if (onComplete) {
      onComplete();
      return;
    }
    document.getElementById("surat-untukmu")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (finished) {
    return (
      <div
        id="main-berdua"
        className={`relative overflow-hidden text-center text-ink ${
          embedded
            ? "px-1 py-5"
            : "rounded-[26px] border-4 border-ink bg-candy px-5 py-7 shadow-hard-lg"
        }`}
      >
        <Confetti />
        <span className="sticker inline-block bg-tangerine px-3 py-1 text-[10px] uppercase leading-4">
          Main Berdua · selesai
        </span>
        <h2 className="mt-4 font-display text-3xl uppercase leading-8">
          Permainan selesai!
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm font-bold leading-5">
          Skor dan pilihanmu siap dikirim ke pembuatnya. Lanjut baca, ya.
        </p>
        <button
          type="button"
          onClick={continueReading}
          className="mt-5 h-14 w-full rounded-xl border-[3px] border-ink bg-ink px-4 font-display text-sm uppercase text-cream shadow-[4px_4px_0_0_#B6F22E] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-lime active:translate-y-1 active:shadow-none"
        >
          {onComplete ? "Lanjut →" : "Lanjut baca ↓"}
        </button>
      </div>
    );
  }

  const game = playable[activeIndex];
  if (!game) return null;
  const shared: GameViewProps = {
    gameNumber: activeIndex + 1,
    totalGames: playable.length,
    recipientName,
    senderName,
    isLast: activeIndex === playable.length - 1,
    onAdvance: advance,
    onSkip: advance,
    embedded,
  };

  return (
    <div id="main-berdua">
      {game.type === "kuis" ? (
        <QuizGameView key={game.id} game={game} {...shared} />
      ) : game.type === "jujur" ? (
        <TruthGameView key={game.id} game={game} {...shared} />
      ) : game.type === "rencana" ? (
        <PlanGameView key={game.id} game={game} {...shared} />
      ) : (
        <PhotoGameView
          key={`${game.id}-${photoUrls.slice(0, MAX_GAME_PHOTOS).join("|")}`}
          game={game}
          photoUrls={photoUrls}
          {...shared}
        />
      )}
    </div>
  );
}

function GameShell({
  gameNumber,
  totalGames,
  title,
  subtitle,
  children,
  onSkip,
  showSkip = true,
  embedded = false,
}: {
  gameNumber: number;
  totalGames: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onSkip: () => void;
  showSkip?: boolean;
  embedded?: boolean;
}) {
  return (
    <div
      className={
        embedded
          ? "text-ink"
          : "rounded-[26px] border-4 border-ink bg-candy p-5 text-ink shadow-hard-lg sm:p-6"
      }
    >
      <div className="text-center">
        <span className="sticker inline-block bg-tangerine px-3 py-1 text-[10px] uppercase leading-4">
          Main Berdua · {gameNumber}/{totalGames}
        </span>
        <h2 className="mt-3 font-display text-2xl uppercase leading-7 sm:text-3xl sm:leading-8">
          {title}
        </h2>
        <p className="mt-1 text-[12px] font-bold leading-4">{subtitle}</p>
      </div>

      <div className="mt-4">{children}</div>

      {showSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="mx-auto mt-4 block border-b border-ink/70 text-[12px] font-bold leading-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          lewati permainan ini
        </button>
      ) : null}
    </div>
  );
}

function NextButton({
  onClick,
  children,
  dark = false,
}: {
  onClick: () => void;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-4 h-14 w-full rounded-xl border-[3px] border-ink px-4 font-display text-xs uppercase leading-4 tracking-[0.02em] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink active:translate-y-1 active:shadow-none ${
        dark
          ? "bg-ink text-cream shadow-[4px_4px_0_0_#B6F22E]"
          : "bg-lime text-ink shadow-[4px_4px_0_0_#111]"
      }`}
    >
      {children}
    </button>
  );
}

function QuizGameView({
  game,
  gameNumber,
  totalGames,
  senderName,
  isLast,
  onAdvance,
  onSkip,
}: GameViewProps & { game: QuizGame }) {
  const questions = getQuizQuestions(game);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const question = questions[questionIndex];
  if (!question) return null;

  const selected = question.choices.find((choice) => choice.id === selectedId);
  const correct = question.choices.find((choice) => choice.correct);
  const sender = senderLabel(senderName);

  function choose(choiceId: string, correctAnswer: boolean) {
    if (selectedId) return;
    setSelectedId(choiceId);
    if (correctAnswer) setScore((current) => current + 1);
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      setShowScore(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedId(null);
  }

  const rank =
    score === questions.length
      ? "KAMU KENAL BANGET!"
      : score / questions.length >= 0.5
        ? "LUMAYAN KENAL!"
        : "MASIH PERLU KENALAN!";

  return (
    <GameShell
      gameNumber={gameNumber}
      totalGames={totalGames}
      title="Kuis Kenal Aku"
      subtitle={
        showScore
          ? "Semua soal sudah dijawab."
          : `Seberapa kenal kamu sama ${sender}? · ${questionIndex + 1}/${questions.length}`
      }
      onSkip={onSkip}
      showSkip={!showScore}
    >
      {showScore ? (
        <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-paper p-5 text-center shadow-[4px_4px_0_0_#111]">
          <Confetti />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.08em] text-ink/60">
            Skor kamu
          </p>
          <p className="relative mt-2 font-display text-6xl leading-none">
            {score}/{questions.length}
          </p>
          <p className="relative mt-3 font-display text-xl uppercase leading-6">
            {rank}
          </p>
          <p className="relative mt-2 text-[12px] font-bold leading-5 text-ink/75">
            Skor ini bakal dikirim ke {sender}. Waktunya pamer.
          </p>
          <NextButton onClick={onAdvance} dark>
            {isLast ? "Lanjut →" : "Game berikutnya →"}
          </NextButton>
        </div>
      ) : (
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-4 shadow-[4px_4px_0_0_#111]">
          <p className="text-lg font-extrabold leading-6">{question.text}</p>

          <div className="mt-3 space-y-2">
            {question.choices.map((choice) => {
              let tone = "bg-white text-ink";
              let mark = "";
              if (selectedId) {
                if (choice.correct) {
                  tone = "bg-lime text-ink";
                  mark = " ✓";
                } else if (choice.id === selectedId) {
                  tone = "bg-tangerine text-ink";
                  mark = " ✕";
                } else {
                  tone = "bg-white text-ink opacity-50";
                }
              }

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => choose(choice.id, choice.correct)}
                  disabled={selectedId !== null}
                  className={`flex min-h-[54px] w-full items-center justify-between gap-3 rounded-xl border-[3px] border-ink px-4 text-left text-sm font-bold leading-5 transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink enabled:hover:-translate-y-0.5 disabled:cursor-default ${tone}`}
                >
                  <span>{choice.text}</span>
                  {mark ? <span className="shrink-0 font-display text-lg">{mark.trim()}</span> : null}
                </button>
              );
            })}
          </div>

          {selected && correct ? (
            <div className="mt-3 text-center">
              <p className="text-sm font-extrabold leading-5">
                {selected.correct
                  ? "Tepat! Kamu jago."
                  : `Belum tepat. Yang bener: “${correct.text}”.`}
              </p>
              <NextButton onClick={nextQuestion}>
                {questionIndex >= questions.length - 1
                  ? "Lihat skor →"
                  : "Soal berikutnya →"}
              </NextButton>
            </div>
          ) : null}
        </div>
      )}
    </GameShell>
  );
}

function TruthGameView({
  game,
  gameNumber,
  totalGames,
  isLast,
  onAdvance,
  onSkip,
}: GameViewProps & { game: TruthGame }) {
  const statements = getTruthStatements(game);
  const [selected, setSelected] = useState<number | null>(null);
  const lieIndex = Math.max(0, Math.min(2, game.lieIndex));
  const lie = statements[lieIndex] ?? "";

  return (
    <GameShell
      gameNumber={gameNumber}
      totalGames={totalGames}
      title="Dua Jujur Satu Bohong"
      subtitle="Dua asli, satu karangan. Mana yang bohong?"
      onSkip={onSkip}
      showSkip={selected === null}
    >
      <div className="rounded-2xl border-[3px] border-ink bg-paper p-4 shadow-[4px_4px_0_0_#111]">
        <p className="text-center text-sm font-extrabold leading-5">
          {game.prompt.trim() || "Mana yang bohong?"}
        </p>

        <div className="mt-3 space-y-2">
          {statements.map((statement, index) => {
            let tone = "bg-white text-ink";
            let mark = "";
            if (selected !== null) {
              if (index === lieIndex) {
                tone = "bg-lime text-ink";
                mark = "BOHONG";
              } else if (index === selected) {
                tone = "bg-tangerine text-ink";
                mark = "BUKAN INI";
              } else {
                tone = "bg-white text-ink opacity-50";
              }
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelected(index)}
                disabled={selected !== null}
                className={`flex min-h-[58px] w-full items-center justify-between gap-3 rounded-xl border-[3px] border-ink px-4 py-3 text-left text-sm font-bold leading-5 transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink enabled:hover:-translate-y-0.5 disabled:cursor-default ${tone}`}
              >
                <span>{statement}</span>
                {mark ? (
                  <span className="shrink-0 font-display text-[9px] uppercase">{mark}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {selected !== null ? (
          <div className="mt-3 text-center">
            <p className="text-sm font-extrabold leading-5">
              {selected === lieIndex
                ? "Jeli! Itu memang yang bohong."
                : `Hampir. Yang bohong: “${lie}”.`}
            </p>
            <NextButton onClick={onAdvance} dark>
              {isLast ? "Lanjut →" : "Game berikutnya →"}
            </NextButton>
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}

function PlanGameView({
  game,
  gameNumber,
  totalGames,
  recipientName,
  senderName,
  isLast,
  onAdvance,
  onSkip,
}: GameViewProps & { game: PlanGame }) {
  const choices = getPlanChoices(game);
  const [selected, setSelected] = useState<string | null>(null);
  const sender = senderLabel(senderName);
  const recipient = recipientLabel(recipientName);

  return (
    <GameShell
      gameNumber={gameNumber}
      totalGames={totalGames}
      title="Rencana Bareng"
      subtitle={`Pilih satu. Pilihanmu jadi tiket janji dari ${sender}.`}
      onSkip={onSkip}
      showSkip={selected === null}
    >
      {selected === null ? (
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-4 shadow-[4px_4px_0_0_#111]">
          <p className="text-center text-sm font-extrabold leading-5">
            {game.prompt.trim() || "Kalau kamu mau, kencan pertama kita:"}
          </p>

          <div className="mt-3 space-y-2">
            {choices.map((choice, index) => {
              const tones = ["bg-lime", "bg-tangerine", "bg-lime", "bg-sun"];
              return (
                <button
                  key={`${choice}-${index}`}
                  type="button"
                  onClick={() => setSelected(choice)}
                  className={`flex min-h-[60px] w-full items-center justify-center rounded-xl border-[3px] border-ink px-4 text-center font-display text-sm uppercase leading-5 text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-1 active:shadow-none ${tones[index % tones.length]}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-4 text-center shadow-[4px_4px_0_0_#111]">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60">
            Tiket janji · satu kali pakai
          </p>
          <div className="my-3 border-y-2 border-dashed border-ink/30 py-4">
            <p className="font-display text-2xl uppercase leading-7">{selected}</p>
            <p className="mt-2 text-sm font-bold">{recipient} + {sender}</p>
          </div>
          <p className="text-[11px] font-bold leading-4 text-ink/70">
            Nggak bisa dibatalkan, tapi bebas dijadwalkan.
          </p>
          <p className="mt-1 text-[11px] font-bold leading-4 text-ink/70">
            {sender} bakal dapat kabar pilihanmu. Tinggal ditaguh.
          </p>
          <NextButton onClick={onAdvance} dark>
            {isLast ? "Lanjut →" : "Game berikutnya →"}
          </NextButton>
        </div>
      )}
    </GameShell>
  );
}

function shufflePhotos(urls: string[]) {
  const shuffled = [...urls];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index]!;
    const other = shuffled[random]!;
    shuffled[index] = other;
    shuffled[random] = current;
  }

  if (
    shuffled.length > 1 &&
    shuffled.every((url, index) => url === urls[index])
  ) {
    const first = shuffled.shift()!;
    shuffled.push(first);
  }

  return shuffled;
}

function PhotoGameView({
  photoUrls,
  gameNumber,
  totalGames,
  isLast,
  onAdvance,
  onSkip,
}: GameViewProps & { game: { id: string; type: "susun" }; photoUrls: string[] }) {
  const urls = photoUrls.slice(0, MAX_GAME_PHOTOS);
  const [order, setOrder] = useState(() => shufflePhotos(urls));
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  function choose(index: number) {
    if (done) return;
    if (selected === null || selected === index) {
      setSelected(selected === index ? null : index);
      return;
    }

    const next = [...order];
    const first = next[selected]!;
    const second = next[index]!;
    next[selected] = second;
    next[index] = first;
    setOrder(next);
    setSelected(null);
  }

  return (
    <GameShell
      gameNumber={gameNumber}
      totalGames={totalGames}
      title="Susun Foto"
      subtitle="Ketuk dua foto buat tukar. Pasang urutannya sesuai versimu."
      onSkip={onSkip}
      showSkip={!done}
    >
      {done ? (
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-5 text-center shadow-[4px_4px_0_0_#111]">
          <p className="font-display text-2xl uppercase leading-7">Urutan versimu siap.</p>
          <p className="mt-2 text-sm font-bold leading-5 text-ink/70">
            Nggak ada jawaban salah di sini. Yang penting versimu.
          </p>
          <NextButton onClick={onAdvance} dark>
            {isLast ? "Lanjut →" : "Game berikutnya →"}
          </NextButton>
        </div>
      ) : (
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-4 shadow-[4px_4px_0_0_#111]">
          <div className="grid grid-cols-2 gap-2">
            {order.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => choose(index)}
                aria-label={`Tukar foto ${index + 1}`}
                aria-pressed={selected === index}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl border-[3px] border-ink bg-white transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  selected === index
                    ? "-translate-y-0.5 shadow-[0_0_0_4px_#B6F22E]"
                    : "hover:-translate-y-0.5"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- URL bertanda tangan dari Supabase Storage */}
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-md border-2 border-ink bg-paper font-display text-[11px] leading-none">
                  {index + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setOrder(shufflePhotos(urls));
                setSelected(null);
              }}
              className="h-12 flex-1 rounded-xl border-[3px] border-ink bg-white px-3 font-display text-[11px] uppercase text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Acak lagi
            </button>
            <button
              type="button"
              onClick={() => setDone(true)}
              className="h-12 flex-1 rounded-xl border-[3px] border-ink bg-lime px-3 font-display text-[11px] uppercase text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Selesai →
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-[12%] top-[18%] size-2 rotate-12 rounded-full bg-tangerine" />
      <span className="absolute right-[14%] top-[12%] size-3 -rotate-12 rounded-sm bg-lime" />
      <span className="absolute bottom-[16%] left-[18%] size-2 -rotate-6 rounded-sm bg-candy" />
      <span className="absolute bottom-[20%] right-[12%] size-2 rotate-45 rounded-full bg-ink" />
      <span className="absolute left-[48%] top-[8%] h-3 w-1 -rotate-12 rounded-full bg-sun" />
    </div>
  );
}
