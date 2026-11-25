import type { Game } from "./games";
import type { MomentId } from "./moments";
import type { PlanId } from "./plans";

export type SurprisePage = {
  slug: string;
  moment: MomentId;
  recipientName: string;
  senderName: string | null;
  story: string | null;
  letter: string | null;
  photoUrls: string[];
  games?: Game[];
  musicUrl: string | null;
  question?: string | null;
  dateLabel?: string | null;
  designId?: string | null;
  voiceUrl?: string | null;
  planId?: PlanId;
  activeUntil: string | null;
  isExample: boolean;
};
