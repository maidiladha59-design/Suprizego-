export type SurprisePageRow = {
  id: string;
  slug: string;
  moment: string;
  recipient_name: string;
  sender_name: string | null;
  story: string | null;
  letter: string | null;
  photo_paths: string[];
  games?: unknown;
  music_path: string | null;
  theme: string;
  active_until: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      surprise_pages: {
        Row: SurprisePageRow;
        Insert: {
          id?: string;
          slug: string;
          moment: string;
          recipient_name: string;
          sender_name?: string | null;
          story?: string | null;
          letter?: string | null;
          photo_paths?: string[];
          music_path?: string | null;
          theme?: string;
          active_until?: string | null;
          created_at?: string;
        };
        Update: Partial<SurprisePageRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
