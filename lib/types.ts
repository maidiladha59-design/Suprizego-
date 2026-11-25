import type { Game } from "./games";
import type { MomentId } from "./moments";

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
  activeUntil: string | null;
  isExample: boolean;
};
