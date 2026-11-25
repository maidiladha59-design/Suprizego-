"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import {
  AUDIO_ACCEPT,
  MAX_AUDIO_BYTES,
  MAX_AUDIO_SECONDS,
  formatDuration,
  isSupportedAudio,
  pickRecorderMime,
  readAudioDuration,
} from "@/lib/audio-rules";

export type VoiceNote = {
  url: string;
  duration: number;
  name: string;
};

type VoiceNoteEditorProps = {
  value: VoiceNote | null;
  planName: string | null;
  onSave: (blob: Blob, duration: number, name: string) => Promise<void>;
  onRemove: () => Promise<void>;
};

type Phase = "idle" | "requesting" | "recording" | "saving";

const actionClass =
  "inline-flex h-[42px] items-center gap-2 rounded-xl border-[3px] border-ink px-4 font-display text-[0.85rem] uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] transition-transform hover:-translate-y-0.5 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0";

const smallClass =
  "h-9 rounded-lg border-[3px] border-ink px-3 font-display text-[11px] uppercase leading-none tracking-[0.01em] text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink";

function permissionMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Izin mikrofon ditolak. Aktifkan lewat ikon di address bar, atau unggah audio.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "Mikrofon nggak kedetek. Coba colok mic lain, atau unggah audio.";
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return "Mikrofon lagi dipakai aplikasi lain. Tutup dulu, atau unggah audio.";
  }
  return "Rekaman gagal dimulai. Coba lagi, ya.";
}

export function VoiceNoteEditor({ value, planName, onSave, onRemove }: VoiceNoteEditorProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const aliveRef = useRef(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  const startedAtRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    return () => {
      aliveRef.current = false;
      clearTimer();
      cancelledRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          // abaikan saat unmount
        }
      }
      stopTracks();
      audioRef.current?.pause();
    };
  }, []);

  const audioUrl = value?.url ?? null;
  useEffect(() => {
    setPlaying(false);
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    const handleStop = () => setPlaying(false);
    audio.addEventListener("ended", handleStop);
    audio.addEventListener("pause", handleStop);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleStop);
      audio.removeEventListener("pause", handleStop);
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [audioUrl]);

  async function save(blob: Blob, duration: number, name: string) {
    setPhase("saving");
    try {
      await onSave(blob, duration, name);
      if (!aliveRef.current) return;
      setPhase("idle");
      setNotice(null);
    } catch {
      if (!aliveRef.current) return;
      setPhase("idle");
      setNotice("Audio gagal disimpan di perangkat ini. Coba lagi, ya.");
    }
  }

  function tick() {
    const seconds = Math.min(MAX_AUDIO_SECONDS, (Date.now() - startedAtRef.current) / 1000);
    elapsedRef.current = seconds;
    setElapsed(seconds);
    if (seconds >= MAX_AUDIO_SECONDS) stopRecording();
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    clearTimer();
    setPhase("saving");
    try {
      recorder.stop();
    } catch {
      stopTracks();
      setPhase("idle");
    }
  }

  function cancelRecording() {
    cancelledRef.current = true;
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        stopTracks();
      }
    } else {
      stopTracks();
    }
    elapsedRef.current = 0;
    setElapsed(0);
    setPhase("idle");
  }

  async function startRecording() {
    if (phase !== "idle") return;
    setNotice(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setNotice("Browser ini belum bisa merekam. Coba Chrome atau Safari terbaru, atau unggah audio.");
      return;
    }

    setPhase("requesting");
    setNotice("Izinkan mikrofon dulu, ya. Rekaman cuma disimpan di perangkatmu.");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      if (!aliveRef.current) return;
      setPhase("idle");
      setNotice(permissionMessage(error));
      return;
    }

    if (!aliveRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    streamRef.current = stream;
    const mime = pickRecorderMime();
    let recorder: MediaRecorder;
    try {
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      stopTracks();
      setPhase("idle");
      setNotice("Perangkat ini belum bisa merekam audio. Coba unggah file, ya.");
      return;
    }

    recorderRef.current = recorder;
    chunksRef.current = [];
    cancelledRef.current = false;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      clearTimer();
      stopTracks();
      recorderRef.current = null;
      const chunks = chunksRef.current;
      chunksRef.current = [];
      if (!aliveRef.current || cancelledRef.current) {
        setPhase("idle");
        return;
      }
      const duration = Math.min(MAX_AUDIO_SECONDS, elapsedRef.current);
      const blob = new Blob(chunks, { type: recorder.mimeType || mime || "audio/webm" });
      elapsedRef.current = 0;
      setElapsed(0);
      if (duration < 0.6 || blob.size < 800) {
        setPhase("idle");
        setNotice("Rekamannya terlalu pendek. Coba lagi, ya.");
        return;
      }
      if (blob.size > MAX_AUDIO_BYTES) {
        setPhase("idle");
        setNotice("Rekaman lebih dari 5 MB. Coba yang lebih singkat, ya.");
        return;
      }
      void save(blob, duration, "Rekaman suara");
    };

    try {
      recorder.start(250);
    } catch {
      stopTracks();
      setPhase("idle");
      setNotice("Rekaman gagal dimulai. Coba lagi, ya.");
      return;
    }

    startedAtRef.current = Date.now();
    elapsedRef.current = 0;
    setElapsed(0);
    setPhase("recording");
    setNotice(null);
    timerRef.current = window.setInterval(tick, 250);
  }

  async function handleUpload(file: File | undefined, input: HTMLInputElement) {
    input.value = "";
    if (!file) return;
    setNotice(null);

    if (!isSupportedAudio(file)) {
      setNotice("Formatnya harus MP3, M4A, WAV, OGG, atau WebM.");
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setNotice("Filenya lebih dari 5 MB. Pilih yang lebih kecil, ya.");
      return;
    }

    setPhase("saving");
    const duration = await readAudioDuration(file);
    if (!aliveRef.current) return;
    if (duration === null) {
      setPhase("idle");
      setNotice("Durasi audio nggak kebaca. Coba file lain, ya.");
      return;
    }
    if (duration > MAX_AUDIO_SECONDS + 0.5) {
      setPhase("idle");
      setNotice("Audionya lebih dari 1 menit. Potong dulu, ya.");
      return;
    }
    await save(file, duration, file.name);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    audio.currentTime = 0;
    setNotice(null);
    void audio
      .play()
      .then(() => {
        if (aliveRef.current) setPlaying(true);
      })
      .catch(() => {
        if (aliveRef.current) setNotice("Audio belum bisa diputar di browser ini.");
      });
  }

  async function handleRemove() {
    audioRef.current?.pause();
    setPhase("saving");
    try {
      await onRemove();
      if (!aliveRef.current) return;
      setNotice(null);
    } catch {
      if (!aliveRef.current) return;
      setNotice("Gagal menghapus audio. Coba lagi, ya.");
    }
    if (aliveRef.current) setPhase("idle");
  }

  const busy = phase === "requesting" || phase === "saving";
  const remaining = Math.max(0, MAX_AUDIO_SECONDS - elapsed);

  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 text-[0.85rem] font-bold uppercase leading-5 tracking-[0.01em]">
        Pesan suara (maks 1 menit)
        {planName && (
          <span className="sticker bg-candy px-2 py-0.5 text-[10px] uppercase leading-4">
            {planName}
          </span>
        )}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept={AUDIO_ACCEPT}
        className="sr-only"
        aria-label="Unggah audio"
        onChange={(event) => {
          const input = event.currentTarget;
          void handleUpload(event.target.files?.[0], input);
        }}
      />

      {phase === "recording" ? (
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-white shadow-[3px_3px_0_0_#111]">
              <span className="size-3 animate-pulse rounded-full bg-tangerine" />
            </span>
            <span className="font-display text-lg tabular-nums leading-6">
              {formatDuration(elapsed)}
            </span>
            <span className="text-[11px] font-bold leading-4 opacity-60">
              sisa {formatDuration(remaining)}
            </span>
            <span className="ml-auto flex gap-2">
              <button type="button" onClick={stopRecording} className={`${actionClass} bg-lime`}>
                Selesai
              </button>
              <button type="button" onClick={cancelRecording} className={`${actionClass} bg-paper`}>
                Batal
              </button>
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full border-2 border-ink bg-white">
            <div
              className="h-full bg-tangerine"
              style={{ width: `${Math.min(100, (elapsed / MAX_AUDIO_SECONDS) * 100)}%` }}
            />
          </div>
        </div>
      ) : busy ? (
        <p role="status" className="mt-2 flex items-center gap-2 text-xs font-bold leading-4">
          <span className="size-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
          {phase === "requesting" ? "Minta izin mikrofon..." : "Menyimpan audio..."}
        </p>
      ) : value ? (
        <div className="mt-2 rounded-xl border-[3px] border-ink bg-paper p-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Jeda pesan suara" : "Putar pesan suara"}
              aria-pressed={playing}
              className="grid size-10 shrink-0 place-items-center rounded-lg border-[3px] border-ink bg-lime text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xs uppercase leading-4">{value.name}</p>
              <p className="text-[11px] font-bold leading-4 opacity-60">
                Pesan suara · {formatDuration(value.duration)}
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={startRecording} className={`${smallClass} bg-lime`}>
              Rekam ulang
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`${smallClass} bg-white`}
            >
              Ganti audio
            </button>
            <button type="button" onClick={() => void handleRemove()} className={`${smallClass} bg-tangerine`}>
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void startRecording()}
            className={`${actionClass} bg-lime`}
          >
            <span className="size-2 rounded-full bg-tangerine" />
            Rekam
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`${actionClass} bg-paper`}
          >
            Unggah audio
          </button>
        </div>
      )}

      {notice && (
        <p role="status" aria-live="polite" className="mt-2 text-xs font-bold leading-4">
          {notice}
        </p>
      )}
    </div>
  );
}
