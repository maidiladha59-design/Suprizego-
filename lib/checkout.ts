import type { Game } from "./games";
import type { MusicMood } from "./music";
import type { MomentId } from "./moments";
import type { PlanId } from "./pricing";
import type { SpecialDayId } from "./special-days";

export type CheckoutPayload = {
  moment: MomentId;
  recipientName: string;
  senderName: string;
  dateLabel: string | null;
  question: string | null;
  story: string[];
  designId: string;
  specialDay: SpecialDayId | null;
  planId: PlanId;
  musicMood: MusicMood;
  spotifyUrl: string | null;
  letter: string | null;
  games: Game[];
  photoCaptions: string[];
  voiceDuration: number | null;
};

export type CheckoutResponse = {
  clientKey: string;
  snapUrl: string;
  snapToken: string;
  orderId: string;
  slug: string;
  grossAmount: number;
};
