"use client";

import { useEffect, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import {
  MUSIC_OPTIONS,
  type MusicMood,
  stopMusicPreview,
  subscribeMusicPreview,
  toggleMusicPreview,
} from "@/lib/music";
import { PLANS, type Plan } from "@/lib/plans";

type MusicSectionProps = {
  mood: MusicMood;
  spotify: string;
  plan: Plan;
  onMoodChange: (mood: MusicMood) => void;
  onSpotifyChange: (value: string) => void;
};

const playButtonClass =
  "grid h-[42px] w-[50px] shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-candy text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0";

export function MusicSection({
  mood,
  spotify,
  plan,
  onMoodChange,
  onSpotifyChange,
}: MusicSectionProps) {
  const spotifyEnabled = plan.spotify;
  const spotifyPlanNames = PLANS.filter((item) => item.spotify)
    .map((item) => item.name)
    .join(" / ");
  const [playing, setPlaying] = useState<MusicMood | null>(null);
  const [busy, setBusy] = useState<MusicMood | null>(null);
  const [pasteNote, setPasteNote] = useState("");

  useEffect(() => subscribeMusicPreview(setPlaying), []);
  useEffect(
    () => () => {
      stopMusicPreview();
    },
    [],
  );

  function choose(next: MusicMood) {
    onMoodChange(next);
    if (next === "tanpa") stopMusicPreview();
  }

  async function preview(id: MusicMood) {
    if (busy) return;
    setBusy(id);
    setPasteNote("");
    try {
      await toggleMusicPreview(id);
    } catch {
      setPasteNote("Musik belum bisa diputar di browser ini. Coba Chrome atau Safari terbaru, ya.");
    } finally {
      setBusy(null);
    }
  }

  async function pasteLink() {
    if (!spotifyEnabled) return;
    setPasteNote("");
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        setPasteNote("Clipboard masih kosong. Tempel manual, ya.");
        return;
      }
      onSpotifyChange(text.slice(0, 200));
      setPasteNote("Tautan ditempel.");
    } catch {
      setPasteNote("Nggak bisa baca clipboard. Tempel manual, ya.");
    }
  }

  return (
    <section className="rounded-card border-4 border-ink bg-white p-6 shadow-hard-lg sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-lime font-display text-lg">
          6
        </span>
        <h2 className="font-display text-2xl uppercase leading-8">Musik</h2>
      </div>
      <p className="mt-1 text-sm font-bold leading-5">
        Nyala begitu penerima membuka amplopnya.
      </p>

      <div role="group" aria-label="Pilih musik" className="mt-5 grid gap-3 sm:grid-cols-2">
        {MUSIC_OPTIONS.map((option) => {
          const selected = option.id === mood;
          const isPlaying = playing === option.id;
          const isLoading = busy === option.id;
          return (
            <div
              key={option.id}
              className={`flex items-center gap-2 rounded-xl border-[3px] border-ink p-2 transition-colors ${
                selected ? "bg-lime" : "bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => choose(option.id)}
                aria-pressed={selected}
                className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <span className="block font-display text-sm uppercase leading-5">
                  {option.name}
                </span>
                <span className="block truncate text-[11px] font-bold leading-4 opacity-70">
                  {option.tagline}
                </span>
              </button>
              {option.id !== "tanpa" && (
                <button
                  type="button"
                  onClick={() => void preview(option.id)}
                  disabled={busy !== null}
                  aria-pressed={isPlaying}
                  aria-busy={isLoading}
                  aria-label={
                    isPlaying ? `Hentikan ${option.name}` : `Dengar ${option.name}`
                  }
                  className={playButtonClass}
                >
                  {isLoading ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
                  ) : isPlaying ? (
                    <PauseIcon className="size-4" />
                  ) : (
                    <PlayIcon className="size-4" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5" data-spotify-locked={!spotifyEnabled}>
        <label
          htmlFor="lagu-pilihan"
          className="block text-[0.85rem] font-bold uppercase leading-5 tracking-[0.01em] text-ink"
        >
          Lagu pilihan (Spotify){" "}
          <span className="sticker ml-1 inline-block bg-candy px-2 py-0.5 align-middle text-[10px] leading-4">
            {spotifyPlanNames}
          </span>
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="lagu-pilihan"
            type="text"
            value={spotify}
            onChange={(event) => onSpotifyChange(event.target.value)}
            maxLength={200}
            autoComplete="off"
            disabled={!spotifyEnabled}
            placeholder={
              spotifyEnabled
                ? "Cari lagu atau tempel tautannya"
                : `Tersedia di paket ${spotifyPlanNames}`
            }
            className="h-14 min-w-0 flex-1 rounded-[14px] border-4 border-ink bg-white px-4 text-base font-normal leading-6 text-ink placeholder:text-ink/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void pasteLink()}
            disabled={!spotifyEnabled}
            className="h-14 shrink-0 rounded-xl border-[3px] border-ink bg-paper px-4 font-display text-xs uppercase tracking-[0.01em] text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            Tempel
          </button>
        </div>
        {pasteNote && (
          <p role="status" className="mt-2 text-xs font-bold leading-4">
            {pasteNote}
          </p>
        )}
      </div>
    </section>
  );
}
