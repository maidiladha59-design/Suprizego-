export const MAX_AUDIO_SECONDS = 60;
export const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
export const AUDIO_ACCEPT =
  ".mp3,.m4a,.wav,.ogg,.webm,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg,audio/webm";

const ALLOWED_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/webm",
]);

const ALLOWED_EXT = /\.(mp3|m4a|wav|ogg|webm)$/i;

const RECORDER_MIME_CANDIDATES = [
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

export function isSupportedAudio(file: File): boolean {
  return ALLOWED_MIME.has(file.type.toLowerCase()) || ALLOWED_EXT.test(file.name);
}

export function pickRecorderMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  if (typeof MediaRecorder.isTypeSupported !== "function") return null;
  for (const mime of RECORDER_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function readAudioDuration(blob: Blob): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    let settled = false;

    const finish = (duration: number | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onerror = null;
      audio.removeAttribute("src");
      URL.revokeObjectURL(url);
      resolve(duration);
    };

    const timer = window.setTimeout(() => {
      finish(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null);
    }, 4000);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        finish(audio.duration);
        return;
      }
      // Beberapa WebM menuliskan durasi Infinity; lompat jauh agar metadata terisi.
      audio.currentTime = Number.MAX_SAFE_INTEGER;
      audio.ontimeupdate = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) finish(audio.duration);
      };
    };
    audio.onerror = () => finish(null);
    audio.src = url;
  });
}
