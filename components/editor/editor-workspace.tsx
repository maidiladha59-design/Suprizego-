"use client";

import { useEffect, useRef, useState } from "react";
import { LetterSection, MAX_LETTER_LENGTH } from "@/components/editor/letter-section";
import { MainBerduaSection } from "@/components/editor/main-berdua-section";
import { MusicSection } from "@/components/editor/music-section";
import { PhotoReader, type PreviewPhoto } from "@/components/editor/photo-reader";
import { PhotoSection, type EditorPhoto } from "@/components/editor/photo-section";
import { VoiceNoteEditor, type VoiceNote } from "@/components/editor/voice-note-editor";
import { ArrowRightIcon, SparkleIcon } from "@/components/ui/icons";
import { audioStore } from "@/lib/audio-store";
import { compressPhoto } from "@/lib/compress-photo";
import { EDITOR_CONFIG, type EditorDesign } from "@/lib/editor";
import { normalizeGames, type Game } from "@/lib/games";
import type { Moment } from "@/lib/moments";
import { normalizeMusicMood, stopMusicPreview, type MusicMood } from "@/lib/music";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, isHeicPhoto, isSupportedPhoto } from "@/lib/photo-rules";
import { photoStore } from "@/lib/photo-store";
import {
  firstPlanWithVoiceNote,
  getPlan,
  isPlanId,
  type PlanId,
} from "@/lib/plans";

type Draft = {
  design: string;
  sn: string;
  rn: string;
  dt: string;
  q: string;
  story: string[];
  song: MusicMood;
  sp: string;
  letter: string;
  planId: PlanId;
  games: Game[];
};

const STORY_MIN = 3;
const STORY_MAX = 5;
const STORY_START = 4;

function emptyStory(count = STORY_START) {
  return Array.from({ length: count }, () => "");
}

function normalizeStory(value: unknown) {
  const list = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, STORY_MAX)
    : emptyStory();
  while (list.length < STORY_MIN) list.push("");
  return list;
}

const inputClass =
  "mt-1.5 h-14 w-full rounded-[14px] border-4 border-ink bg-white px-4 text-base font-normal leading-6 text-ink placeholder:text-ink/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink";

const labelClass =
  "block text-[0.85rem] font-bold uppercase leading-5 tracking-[0.01em] text-ink";

function PreviewPhone({
  design,
  recipient,
  sender,
  stories,
  photos,
}: {
  design: EditorDesign;
  recipient: string;
  sender: string;
  stories: string[];
  photos: PreviewPhoto[];
}) {
  const name = recipient.trim() || "Nama penerima";

  return (
    <div className="mx-auto w-[300px] max-w-full sm:w-[340px]">
      <div className="rounded-[38px] border-4 border-ink bg-ink p-3 shadow-hard-lg">
        <div
          className="relative flex h-[664px] flex-col items-center gap-3 overflow-hidden rounded-[26px] px-5 pb-9 pt-8 text-center"
          style={{ backgroundColor: design.screen, color: design.text }}
        >
          <span className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-ink" />

          {photos.length > 0 ? (
            <div className="flex w-full flex-1 flex-col justify-center">
              <PhotoReader photos={photos} />
            </div>
          ) : (
            <>
              <span
                className="sticker -rotate-2 px-3 py-1 text-sm"
                style={{ backgroundColor: design.chip, color: design.chipText }}
              >
                Ada kejutan buat
              </span>

              <p className="max-w-full break-words font-display text-[2rem] uppercase leading-9">
                {name}
              </p>

              <div className="flex w-full flex-1 flex-col gap-2.5 overflow-y-auto pb-1 text-left [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {stories.map((story, index) =>
                  story.trim() ? (
                    <p
                      key={index}
                      className="rounded-2xl border-[3px] border-ink bg-paper px-3 py-2 text-[13px] font-bold leading-[18px] text-ink shadow-[3px_3px_0_0_#111]"
                    >
                      {story.trim()}
                    </p>
                  ) : (
                    <p
                      key={index}
                      className="rounded-2xl border-[3px] border-dashed border-current px-3 py-2 text-[13px] font-bold leading-[18px] opacity-40"
                    >
                      Kartu {index + 1} masih kosong...
                    </p>
                  ),
                )}
              </div>

              <p className="text-[11px] font-bold opacity-60">
                dari {sender.trim() || "kamu"}
              </p>
            </>
          )}

          <span className="absolute bottom-3 h-1 w-24 rounded-full bg-current opacity-25" />
        </div>
      </div>
    </div>
  );
}

export function EditorWorkspace({ moment }: { moment: Moment }) {
  const config = EDITOR_CONFIG[moment.id];
  const baseDraft: Draft = {
    design: config.designs[0].id,
    sn: "",
    rn: "",
    dt: "",
    q: "",
    story: emptyStory(),
    song: "manis",
    sp: "",
    letter: "",
    planId: "plus",
    games: [],
  };

  const [draft, setDraft] = useState<Draft>(baseDraft);
  const [photos, setPhotos] = useState<EditorPhoto[]>([]);
  const [voice, setVoice] = useState<VoiceNote | null>(null);
  const [notices, setNotices] = useState<string[]>([]);
  const photosLoaded = useRef(false);
  const hydrated = useRef(false);
  const storageKey = `suprizego:draft:${moment.id}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<Draft>;
        setDraft({
          design: config.designs.some((design) => design.id === stored.design)
            ? String(stored.design)
            : baseDraft.design,
          sn: typeof stored.sn === "string" ? stored.sn : "",
          rn: typeof stored.rn === "string" ? stored.rn : "",
          dt: typeof stored.dt === "string" ? stored.dt : "",
          q: typeof stored.q === "string" ? stored.q : "",
          story: normalizeStory(stored.story),
          song: normalizeMusicMood(stored.song),
          sp: typeof stored.sp === "string" ? stored.sp.slice(0, 200) : "",
          letter:
            typeof stored.letter === "string"
              ? stored.letter.slice(0, MAX_LETTER_LENGTH)
              : "",
          planId: isPlanId(stored.planId) ? stored.planId : baseDraft.planId,
          games: normalizeGames(stored.games),
        });
      }
    } catch {
      // localStorage bisa diblokir; editor tetap jalan tanpa draf tersimpan.
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated.current) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // Diamkan: penyimpanan lokal tidak tersedia.
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [draft, storageKey]);

  useEffect(() => {
    let cancelled = false;
    void audioStore
      .get(moment.id)
      .then((record) => {
        if (cancelled || !record) return;
        setVoice({
          url: audioStore.getUrl(record),
          duration: record.duration,
          name: record.name,
        });
      })
      .catch(() => {
        // Audio sementara tidak tersedia; blok tetap bisa dipakai.
      });
    return () => {
      cancelled = true;
    };
  }, [moment.id]);

  useEffect(() => {
    photosLoaded.current = false;
    let cancelled = false;
    void photoStore
      .list(moment.id)
      .then((records) => {
        if (cancelled) return;
        setPhotos(
          records.map((record) => ({
            id: record.id,
            caption: record.caption,
            url: photoStore.getUrl(record),
            blob: record.blob,
            status: "ready" as const,
          })),
        );
        photosLoaded.current = true;
      })
      .catch(() => {
        photosLoaded.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [moment.id]);

  useEffect(() => {
    if (!photosLoaded.current) return;
    const timer = window.setTimeout(() => {
      for (const photo of photos) {
        if (photo.status === "ready" && photo.blob) {
          void photoStore.updateCaption(moment.id, photo.id, photo.caption);
        }
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [photos, moment.id]);

  const design =
    config.designs.find((item) => item.id === draft.design) ?? config.designs[0];
  const plan = getPlan(draft.planId);

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateStory(index: number, value: string) {
    setDraft((current) => ({
      ...current,
      story: current.story.map((story, i) => (i === index ? value : story)),
    }));
  }

  function addStory() {
    setDraft((current) =>
      current.story.length >= STORY_MAX
        ? current
        : { ...current, story: [...current.story, ""] },
    );
  }

  function removeStory(index: number) {
    setDraft((current) =>
      current.story.length <= STORY_MIN
        ? current
        : {
            ...current,
            story: current.story.filter((_, i) => i !== index),
          },
    );
  }

  function fillExample() {
    setDraft((current) => {
      let cursor = 0;
      const story = current.story.map((item) =>
        item.trim() ? item : (config.stories[cursor++] ?? ""),
      );
      return { ...current, story };
    });
  }

  function addNotices(...messages: string[]) {
    setNotices((current) => [...current, ...messages]);
  }

  function startCompressing(file: File) {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPhotos((current) =>
      current.length >= MAX_PHOTOS
        ? current
        : [
            ...current,
            {
              id,
              caption: "",
              url: null,
              blob: null,
              status: "loading",
              name: file.name,
            },
          ],
    );

    void (async () => {
      try {
        const blob = await compressPhoto(file);
        const record = {
          id,
          momentId: moment.id,
          caption: "",
          blob,
          order: Date.now(),
          createdAt: Date.now(),
        };
        const url = photoStore.getUrl(record);
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === id ? { ...photo, blob, url, status: "ready" } : photo,
          ),
        );
        await photoStore.add(moment.id, record);
      } catch {
        const message = isHeicPhoto(file)
          ? "HEIC belum bisa dibuka di browser ini. Coba JPG/PNG/WebP, ya."
          : "Foto ini nggak bisa dibaca. Coba file lain, ya.";
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === id ? { ...photo, status: "error", error: message } : photo,
          ),
        );
      }
    })();
  }

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const slots = MAX_PHOTOS - photos.length;
    if (slots <= 0) {
      addNotices("Maksimal 8 foto. Hapus satu dulu buat ganti, ya.");
      return;
    }

    const files = Array.from(list);
    const considered = files.slice(0, slots);
    const messages: string[] = [];
    if (files.length > slots) {
      messages.push(`Maksimal 8 foto. ${files.length - slots} file nggak ikut.`);
    }

    const accepted: File[] = [];
    for (const file of considered) {
      if (!isSupportedPhoto(file)) {
        messages.push(`"${file.name}" bukan JPG/PNG/WebP/HEIC.`);
      } else if (file.size > MAX_PHOTO_BYTES) {
        messages.push(`"${file.name}" lebih dari 10 MB.`);
      } else {
        accepted.push(file);
      }
    }

    if (messages.length > 0) addNotices(...messages);
    for (const file of accepted) startCompressing(file);
  }

  function updatePhotoCaption(id: string, caption: string) {
    setPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, caption } : photo)),
    );
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    void photoStore.remove(moment.id, id);
  }

  function movePhoto(id: string, direction: -1 | 1) {
    const index = photos.findIndex((photo) => photo.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= photos.length) return;
    const next = [...photos];
    const current = next[index];
    const other = next[target];
    if (!current || !other) return;
    next[index] = other;
    next[target] = current;
    setPhotos(next);
    void photoStore.reorder(
      moment.id,
      next.filter((photo) => photo.status === "ready").map((photo) => photo.id),
    );
  }

  async function saveVoice(blob: Blob, duration: number, name: string) {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const record = {
      id,
      momentId: moment.id,
      blob,
      mime: blob.type,
      duration,
      name,
      createdAt: Date.now(),
    };
    await audioStore.add(moment.id, record);
    setVoice({ url: audioStore.getUrl(record), duration, name });
  }

  async function removeVoice() {
    await audioStore.remove(moment.id);
    setVoice(null);
  }

  async function resetDraft() {
    if (!window.confirm("Hapus isian ini dan mulai dari awal?")) return;
    stopMusicPreview();
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // abaikan
    }
    await photoStore.clear(moment.id);
    await audioStore.clear(moment.id);
    setPhotos([]);
    setVoice(null);
    setNotices([]);
    setDraft(baseDraft);
  }

  const resetButton = (
    <button
      type="button"
      onClick={() => void resetDraft()}
      className="mx-auto mt-4 flex h-[42px] items-center justify-center rounded-xl border-[3px] border-ink bg-paper px-4 font-display text-[0.85rem] uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      Ulangi dari awal
    </button>
  );

  const previewPhotos: PreviewPhoto[] = photos.flatMap((photo) =>
    photo.status === "ready" && photo.url
      ? [{ id: photo.id, url: photo.url, caption: photo.caption }]
      : [],
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 pt-8 pb-10 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <div className="px-6 sm:px-7">
          <div className="flex items-start gap-6">
            <span className="grid size-12 shrink-0 -rotate-3 place-items-center rounded-xl border-[3px] border-ink bg-lime shadow-[4px_4px_0_0_#111]">
              <SparkleIcon className="size-6" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-3xl uppercase leading-9 sm:text-4xl sm:leading-10">
                Halaman {moment.label}
              </h1>
              <p className="text-sm font-bold leading-5">
                Isi pelan-pelan. Pratinjau dan draf otomatis tersimpan.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6 sm:mt-9">
          <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
                1
              </span>
              <h2 className="font-display text-2xl uppercase leading-8">
                Pilih desain
              </h2>
            </div>

            <div
              role="group"
              aria-label="Pilih desain"
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              {config.designs.map((option) => {
                const selected = option.id === design.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update("design", option.id)}
                    className={`min-h-[120px] rounded-2xl border-4 border-ink p-4 text-left transition ${
                      selected
                        ? "-translate-y-1 shadow-[6px_6px_0_0_#111]"
                        : "opacity-90 hover:-translate-y-0.5 hover:opacity-100"
                    } focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink`}
                    style={{
                      backgroundColor: option.screen,
                      color: option.text,
                    }}
                  >
                    <span className="block font-display text-xl uppercase leading-6">
                      {option.name}
                    </span>
                    <span className="mt-1 block text-xs font-bold leading-4">
                      {option.tagline}
                    </span>
                    <span className="mt-3 flex gap-1.5">
                      {option.dots.map((color) => (
                        <span
                          key={color}
                          className="size-4 rounded-full border-2 border-ink"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
                2
              </span>
              <h2 className="font-display text-2xl uppercase leading-8">
                Siapa ke siapa
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Namamu
                <input
                  type="text"
                  maxLength={40}
                  value={draft.sn}
                  onChange={(event) => update("sn", event.target.value)}
                  autoComplete="name"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Nama penerima
                <input
                  type="text"
                  maxLength={40}
                  value={draft.rn}
                  onChange={(event) => update("rn", event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className={`${labelClass} mt-4 block`}>
              {config.dateLabel}
              <input
                type="date"
                value={draft.dt}
                onChange={(event) => update("dt", event.target.value)}
                className={inputClass}
              />
            </label>

            <label className={`${labelClass} mt-4 block`}>
              Pertanyaan besar
              <input
                type="text"
                maxLength={80}
                value={draft.q}
                onChange={(event) => update("q", event.target.value)}
                placeholder={config.questionPlaceholder}
                className={inputClass}
              />
            </label>
          </section>

          <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
                3
              </span>
              <h2 className="font-display text-2xl uppercase leading-8">
                Ceritamu
              </h2>
            </div>
            <p className="mt-1 text-sm font-bold leading-5">
              3 sampai 5 kartu pendek. Nanti muncul satu per satu, kayak chat.
            </p>

            <div className="mt-5 space-y-4">
              {draft.story.map((story, index) => (
                <div key={index} className="flex items-start gap-2">
                  <textarea
                    value={story}
                    onChange={(event) => updateStory(index, event.target.value)}
                    maxLength={180}
                    rows={2}
                    aria-label={`Kartu cerita ${index + 1}`}
                    placeholder={`Kartu ${index + 1}: tulis satu kalimat...`}
                    className="h-20 w-full rounded-[14px] border-4 border-ink bg-white px-4 py-3 text-base font-normal leading-6 text-ink placeholder:text-ink/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  />
                  <button
                    type="button"
                    onClick={() => removeStory(index)}
                    disabled={draft.story.length <= STORY_MIN}
                    aria-label={`Hapus kartu ${index + 1}`}
                    className="grid size-12 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-tangerine text-xl leading-none text-ink shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:translate-y-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addStory}
                disabled={draft.story.length >= STORY_MAX}
                className="h-[42px] rounded-xl border-[3px] border-ink bg-lime px-4 font-display text-[0.85rem] uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
              >
                + Tambah kartu
              </button>
              <button
                type="button"
                onClick={fillExample}
                disabled={draft.story.every((item) => item.trim().length > 0)}
                className="h-[42px] rounded-xl border-[3px] border-ink bg-paper px-4 font-display text-[0.85rem] uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
              >
                Pakai contoh isi
              </button>
            </div>
          </section>

          <PhotoSection
            photos={photos}
            notices={notices}
            onFiles={handleFiles}
            onCaption={updatePhotoCaption}
            onRemove={removePhoto}
            onMove={movePhoto}
            onDismissNotices={() => setNotices([])}
          />

          <MainBerduaSection
            games={draft.games}
            plan={plan}
            photos={previewPhotos}
            onChange={(games) => update("games", games)}
          />

          <MusicSection
            mood={draft.song}
            spotify={draft.sp}
            onMoodChange={(song) => update("song", song)}
            onSpotifyChange={(sp) => update("sp", sp)}
          />

          <LetterSection
            value={draft.letter}
            onChange={(letter) => update("letter", letter)}
          >
            <VoiceNoteEditor
              value={voice}
              planName={firstPlanWithVoiceNote()?.name ?? null}
              onSave={saveVoice}
              onRemove={removeVoice}
            />
          </LetterSection>
        </div>

        <details className="mt-8 px-6 sm:px-7 lg:hidden">
          <summary className="flex h-[46px] cursor-pointer list-none items-center justify-center gap-2 rounded-xl border-[3px] border-ink bg-paper px-4 font-display text-sm uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] [&::-webkit-details-marker]:hidden">
            Lihat pratinjau
            <ArrowRightIcon className="size-4" />
          </summary>
          <div className="mt-6">
            <PreviewPhone
              design={design}
              recipient={draft.rn}
              sender={draft.sn}
              stories={draft.story}
              photos={previewPhotos}
            />
            {resetButton}
          </div>
        </details>
      </div>

      <aside className="hidden lg:block" aria-label="Pratinjau langsung">
        <div className="sticky top-24">
          <p className="text-center font-display text-sm uppercase tracking-[0.06em]">
            Pratinjau langsung
          </p>
          <div className="mt-4">
            <PreviewPhone
              design={design}
              recipient={draft.rn}
              sender={draft.sn}
              stories={draft.story}
              photos={previewPhotos}
            />
          </div>
          {resetButton}
        </div>
      </aside>
    </div>
  );
}
