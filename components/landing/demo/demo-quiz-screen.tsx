"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon, CloseIcon } from "@/components/ui/icons";
import { DEMO_QUIZ } from "@/lib/demo-flow";
import { DemoButton } from "./demo-controls";

export function DemoQuizScreen({
  onComplete,
  onSkip,
}: {
  onComplete: (score: number) => void;
  onSkip: () => void;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const question = DEMO_QUIZ[questionIndex];

  if (!question) return null;

  const correctId = String(question.correctIndex);
  const correctChoice = question.choices[question.correctIndex];

  if (!correctChoice) return null;

  const answeredCorrectly = selectedId === correctId;
  const isLastQuestion = questionIndex >= DEMO_QUIZ.length - 1;

  function selectChoice(choiceId: string) {
    if (selectedId !== null) return;

    setSelectedId(choiceId);
    if (choiceId === correctId) {
      setScore((current) => current + 1);
    }
  }

  function advance() {
    if (isLastQuestion) {
      onComplete(score);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedId(null);
  }

  return (
    <div
      data-demo-screen="quiz"
      className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-5 text-center text-current"
    >
      <div className="w-full max-w-[296px]">
        <p className="mb-4 text-center">
          <span className="sticker -rotate-2 bg-tangerine px-3 py-1 text-xs text-ink">
            Main berdua · 1/2
          </span>
        </p>
        <div key={questionIndex} className="demo-rise">
          <div className="mb-4 text-center">
            <h2 className="font-display text-3xl uppercase leading-none tracking-[-0.03em]">
              Kuis kenal aku
            </h2>
            <p className="mt-1 text-sm font-bold opacity-80">
              Seberapa kenal kamu sama Bima? · {questionIndex + 1}/2
            </p>
          </div>

          <div className="rounded-2xl border-4 border-ink bg-paper p-5 text-left text-ink shadow-[5px_5px_0_0_#111]">
            <div role="group" aria-labelledby="demo-quiz-prompt">
              <p id="demo-quiz-prompt" className="break-words font-display text-2xl leading-tight">
                {question.question}
              </p>
              <div className="mt-4 space-y-3">
                {question.choices.map((choice, index) => {
                  const choiceId = String(index);
                  const showCorrect = selectedId !== null && choiceId === correctId;
                  const showWrong = selectedId === choiceId && choiceId !== correctId;
                  const background = showWrong
                    ? "bg-tangerine"
                    : showCorrect
                      ? "bg-lime"
                      : "bg-white";

                  return (
                    <button
                      key={choice}
                      type="button"
                      disabled={selectedId !== null}
                      onClick={() => selectChoice(choiceId)}
                      className={`flex h-[56px] w-full items-center justify-between gap-2 whitespace-normal break-words rounded-xl border-4 border-ink px-4 text-left font-sans text-base font-bold leading-6 text-ink transition duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default ${
                        showCorrect || showWrong ? "opacity-100" : "disabled:opacity-55"
                      } ${background}`}
                    >
                      <span className="break-words">{choice}</span>
                      {showCorrect ? <CheckIcon className="size-4 shrink-0" /> : null}
                      {showWrong ? <CloseIcon className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedId !== null ? (
              <div role="status" className="demo-pop mt-4 text-center font-bold">
                <p>{answeredCorrectly ? "Betul, Sekar!" : "Belum tepat"}</p>
                {!answeredCorrectly ? (
                  <p className="mt-1 text-sm">
                    Jawaban benar: <span className="underline">{correctChoice}</span>
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] leading-4 opacity-75">{question.explanation}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {selectedId !== null ? (
        <DemoButton tone="lime" size="lg" onClick={advance} className="mt-5 w-full max-w-[214px]">
          {isLastQuestion ? "Lihat skor" : "Soal berikutnya"}
          <ArrowRightIcon className="size-4" />
        </DemoButton>
      ) : null}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold leading-4 underline decoration-current underline-offset-4 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          lewati permainan ini
        </button>
      </div>
    </div>
  );
}

export function DemoQuizScoreScreen({
  score,
  onContinue,
}: {
  score: number;
  onContinue: () => void;
}) {
  const heading =
    score === 2
      ? "Paling hafal!"
      : score === 1
        ? "Lumayan kenal!"
        : "Perlu ngobrol lagi!";
  const message =
    score === 2
      ? "Bima makin yakin kamu paling perhatian."
      : score === 1
        ? "Bima masih banyak cerita buat kamu."
        : "Skor ini dikirim ke Bima. Siap-siap ditagih cerita.";

  return (
    <div
      data-demo-screen="quiz-score"
      className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center text-current"
    >
      <div className="w-full max-w-[296px]">
        <p className="mb-4 text-center">
          <span className="sticker -rotate-2 bg-tangerine px-3 py-1 text-xs text-ink">
            Main berdua · 1/2
          </span>
        </p>
        <div className="demo-pop rounded-2xl border-4 border-ink bg-paper p-6 text-center text-ink shadow-[5px_5px_0_0_#111]">
          <p className="text-sm font-bold">Skor kamu</p>
          <p className="mt-3 font-display text-7xl leading-none" aria-label={`Skor ${score} dari 2`}>
            {score}<span className="text-4xl">/2</span>
          </p>
          <h2 className="mt-3 font-display text-xl leading-tight">{heading}</h2>
          <p className="mt-1 text-sm font-bold">{message}</p>
        </div>
      </div>

      <DemoButton tone="ink" size="lg" onClick={onContinue} className="mt-6">
        Game berikutnya <ArrowRightIcon className="size-4" />
      </DemoButton>
    </div>
  );
}
