export type MusicMood = "manis" | "kotak" | "tanpa";

type PlayingMood = Exclude<MusicMood, "tanpa">;

export type MusicOption = {
  id: MusicMood;
  name: string;
  tagline: string;
};

export const MUSIC_OPTIONS: readonly MusicOption[] = [
  { id: "manis", name: "Manis Manja", tagline: "Lembut, bikin senyum sendiri." },
  { id: "kotak", name: "Kotak Musik", tagline: "Kecil, lucu, bikin gemas." },
  { id: "tanpa", name: "Tanpa Musik", tagline: "Senyap, biar kata-katamu yang main." },
];

export function normalizeMusicMood(value: unknown): MusicMood {
  return MUSIC_OPTIONS.some((option) => option.id === value)
    ? (value as MusicMood)
    : "manis";
}

const SAMPLE_RATE = 44100;

type Chord = {
  bass: number;
  pad: readonly [number, number, number, number];
  arp: readonly [number, number, number, number];
};

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function schedulePluck(
  ctx: OfflineAudioContext,
  out: AudioNode,
  midi: number,
  start: number,
  length: number,
  options: {
    type?: OscillatorType;
    gain: number;
    attack?: number;
    filter?: number;
    harmonic?: { ratio: number; gain: number };
  },
) {
  const stop = start + Math.max(length, 0.08);
  const attack = options.attack ?? 0.008;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, start);
  env.gain.linearRampToValueAtTime(options.gain, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, stop);

  let tail: AudioNode = env;
  if (options.filter) {
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = options.filter;
    env.connect(lowpass);
    tail = lowpass;
  }
  tail.connect(out);

  const osc = ctx.createOscillator();
  osc.type = options.type ?? "sine";
  osc.frequency.value = midiToFreq(midi);
  osc.connect(env);
  osc.start(start);
  osc.stop(stop + 0.04);

  if (options.harmonic) {
    const extra = ctx.createOscillator();
    extra.type = "sine";
    extra.frequency.value = midiToFreq(midi) * options.harmonic.ratio;
    const extraGain = ctx.createGain();
    extraGain.gain.value = options.harmonic.gain;
    extra.connect(extraGain);
    extraGain.connect(env);
    extra.start(start);
    extra.stop(stop + 0.04);
  }
}

function schedulePad(
  ctx: OfflineAudioContext,
  out: AudioNode,
  midi: number,
  start: number,
  length: number,
  gain: number,
) {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(gain, start + 0.35);
  env.gain.setValueAtTime(gain, start + Math.max(0.4, length - 0.4));
  env.gain.linearRampToValueAtTime(0, start + length);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 1100;
  env.connect(lowpass);
  lowpass.connect(out);

  for (const detune of [-4, 4]) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = midiToFreq(midi);
    osc.detune.value = detune;
    osc.connect(env);
    osc.start(start);
    osc.stop(start + length + 0.04);
  }
}

function scheduleKick(ctx: OfflineAudioContext, out: AudioNode, start: number, gain: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(130, start);
  osc.frequency.exponentialRampToValueAtTime(48, start + 0.14);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, start);
  env.gain.linearRampToValueAtTime(gain, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
  osc.connect(env);
  env.connect(out);
  osc.start(start);
  osc.stop(start + 0.28);
}

function renderManis(ctx: OfflineAudioContext, master: AudioNode) {
  const bpm = 96;
  const beat = 60 / bpm;
  const bars: readonly Chord[] = [
    { bass: 36, pad: [60, 64, 67, 71], arp: [72, 76, 79, 83] },
    { bass: 43, pad: [59, 62, 67, 71], arp: [71, 74, 79, 83] },
    { bass: 45, pad: [57, 60, 64, 67], arp: [69, 72, 76, 79] },
    { bass: 41, pad: [53, 57, 60, 64], arp: [65, 69, 72, 76] },
  ];
  const arpPattern = [0, 1, 2, 3, 2, 1, 2, 3] as const;

  bars.forEach((chord, bar) => {
    const barStart = bar * 4 * beat;
    const [padA, padB, padC, padD] = chord.pad;
    for (const note of [padA, padB, padC, padD]) {
      schedulePad(ctx, master, note, barStart, 4 * beat - 0.05, 0.022);
    }

    schedulePluck(ctx, master, chord.bass, barStart, 1.9 * beat, { gain: 0.11, filter: 320 });
    schedulePluck(ctx, master, chord.bass + 7, barStart + 2 * beat, 1.35 * beat, {
      gain: 0.07,
      filter: 320,
    });

    const [arpA, arpB, arpC, arpD] = chord.arp;
    const arpNotes = [arpA, arpB, arpC, arpD] as const;
    arpPattern.forEach((pattern, step) => {
      const note = arpNotes[pattern];
      schedulePluck(ctx, master, note, barStart + step * 0.5 * beat, 0.55 * beat, {
        type: "triangle",
        gain: 0.045,
        filter: 2600,
        harmonic: { ratio: 2, gain: 0.18 },
      });
    });

    scheduleKick(ctx, master, barStart, 0.1);
    scheduleKick(ctx, master, barStart + 2 * beat, 0.08);
  });

  const melody: readonly [number, number, number][] = [
    [0 + 0, 76, 1.2],
    [0 + 1.5, 79, 0.8],
    [0 + 2.5, 81, 1.3],
    [4 + 0, 79, 1],
    [4 + 1, 76, 0.75],
    [4 + 2, 74, 1.6],
    [8 + 0.5, 72, 1],
    [8 + 1.5, 74, 0.9],
    [8 + 2.5, 76, 1.4],
    [12 + 0, 74, 1.1],
    [12 + 1.2, 72, 0.9],
    [12 + 2.2, 69, 1.7],
  ];
  for (const [beatAt, midi, beats] of melody) {
    schedulePluck(ctx, master, midi, beatAt * beat, beats * beat, {
      type: "triangle",
      gain: 0.095,
      filter: 3200,
      harmonic: { ratio: 2, gain: 0.12 },
    });
  }
}

function renderKotak(ctx: OfflineAudioContext, master: AudioNode) {
  const bpm = 84;
  const beat = 60 / bpm;
  const duration = 12 * beat;
  const bars: readonly Chord[] = [
    { bass: 48, pad: [72, 76, 79, 84], arp: [84, 88, 91, 96] },
    { bass: 45, pad: [69, 72, 76, 81], arp: [81, 84, 88, 93] },
    { bass: 41, pad: [65, 69, 72, 77], arp: [77, 81, 84, 89] },
    { bass: 43, pad: [67, 71, 74, 79], arp: [79, 83, 86, 91] },
  ];

  bars.forEach((chord, bar) => {
    const barStart = bar * 3 * beat;
    schedulePluck(ctx, master, chord.bass, barStart, 1.9 * beat, {
      gain: 0.1,
      filter: 500,
      harmonic: { ratio: 2, gain: 0.12 },
    });

    for (let step = 0; step < 3; step += 1) {
      const note = chord.arp[step] ?? chord.arp[0];
      const start = barStart + step * beat;
      const length = Math.min(1.15 * beat, duration - start - 0.05);
      schedulePluck(ctx, master, note, start, length, {
        gain: 0.07,
        attack: 0.004,
        harmonic: { ratio: 3, gain: 0.3 },
      });
    }

    schedulePad(ctx, master, chord.pad[0], barStart, 3 * beat - 0.05, 0.012);
  });

  const melody: readonly [number, number, number][] = [
    [0 + 0.5, 91, 0.9],
    [0 + 1.5, 88, 1.2],
    [6 + 0.5, 89, 0.9],
    [6 + 1.5, 84, 1.2],
  ];
  for (const [beatAt, midi, beats] of melody) {
    schedulePluck(ctx, master, midi, beatAt * beat, beats * beat, {
      gain: 0.045,
      attack: 0.004,
      harmonic: { ratio: 3, gain: 0.25 },
    });
  }
}

function buildOffline(mood: PlayingMood) {
  const duration = mood === "manis" ? 16 * (60 / 96) : 12 * (60 / 84);
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * SAMPLE_RATE), SAMPLE_RATE);
  const master = ctx.createGain();
  master.gain.value = 0.9;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 2.5;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.24;
  master.connect(compressor);
  compressor.connect(ctx.destination);

  if (mood === "manis") renderManis(ctx, master);
  else renderKotak(ctx, master);

  return ctx.startRendering();
}

let audioContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeGain: GainNode | null = null;
let activeMood: MusicMood | null = null;
const rendered = new Map<PlayingMood, AudioBuffer>();
const rendering = new Map<PlayingMood, Promise<AudioBuffer>>();
const listeners = new Set<(mood: MusicMood | null) => void>();

function emit() {
  for (const listener of listeners) listener(activeMood);
}

function getContext() {
  audioContext ??= new AudioContext();
  return audioContext;
}

export function subscribeMusicPreview(listener: (mood: MusicMood | null) => void) {
  listeners.add(listener);
  listener(activeMood);
  return () => {
    listeners.delete(listener);
  };
}

export function stopMusicPreview() {
  const source = activeSource;
  const gain = activeGain;
  const ctx = audioContext;
  activeSource = null;
  activeGain = null;
  activeMood = null;
  if (!source || !gain || !ctx) {
    emit();
    return;
  }
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.16);
  try {
    source.stop(now + 0.18);
  } catch {
    // sumber mungkin sudah berhenti
  }
  window.setTimeout(() => {
    source.disconnect();
    gain.disconnect();
  }, 420);
  emit();
}

export async function toggleMusicPreview(mood: MusicMood): Promise<MusicMood | null> {
  if (mood === "tanpa") {
    stopMusicPreview();
    return null;
  }
  if (activeMood === mood) {
    stopMusicPreview();
    return null;
  }

  const ctx = getContext();
  await ctx.resume();

  let buffer = rendered.get(mood);
  if (!buffer) {
    let pending = rendering.get(mood);
    if (!pending) {
      pending = buildOffline(mood)
        .then((next) => {
          rendered.set(mood, next);
          rendering.delete(mood);
          return next;
        })
        .catch((error: unknown) => {
          rendering.delete(mood);
          throw error;
        });
      rendering.set(mood, pending);
    }
    buffer = await pending;
  }

  stopMusicPreview();

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.25);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  activeSource = source;
  activeGain = gain;
  activeMood = mood;
  emit();
  return mood;
}
