import type { Game } from "./games";
import type { MusicMood } from "./music";
import type { MomentId } from "./moments";
import type { PlanId } from "./plans";
import type { SpecialDayId } from "./special-days";

export type SurprisePage = {
  slug: string;
  moment: MomentId;
  recipientName: string;
  senderName: string | null;
  story: string | null;
  letter: string | null;
  photoUrls: string[];
  photoCaptions?: string[];
  games?: Game[];
  musicUrl: string | null;
  musicMood?: MusicMood;
  question?: string | null;
  dateLabel?: string | null;
  designId?: string | null;
  specialDay?: SpecialDayId | null;
  voiceUrl?: string | null;
  planId?: PlanId;
  activeUntil: string | null;
  isExample: boolean;
};

export type StoredSurpriseData = {
  moment: MomentId;
  recipientName: string;
  senderName: string;
  story: string | null;
  letter: string | null;
  photoPaths: string[];
  photoCaptions: string[];
  games: Game[];
  musicUrl: null;
  musicMood: MusicMood;
  spotifyUrl: string | null;
  question: string | null;
  dateLabel: string | null;
  designId: string;
  specialDay: SpecialDayId | null;
  voicePath: string | null;
  voiceDuration: number | null;
};
