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
  special_day: string | null;
  active_until: string | null;
  created_at: string;
};

export type PageRow = {
  id: string;
  slug: string;
  data: unknown;
  paket: "dasar" | "plus" | "abadi";
  status: "draft" | "pending" | "active" | "expired";
  active_until: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  page_id: string;
  order_id: string;
  paket: "dasar" | "plus" | "abadi";
  gross_amount: number;
  status:
    | "pending"
    | "settlement"
    | "capture"
    | "deny"
    | "expire"
    | "cancel"
    | "failure";
  snap_token: string | null;
  payment_type: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
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
          special_day?: string | null;
          active_until?: string | null;
          created_at?: string;
        };
        Update: Partial<SurprisePageRow>;
        Relationships: [];
      };
      pages: {
        Row: PageRow;
        Insert: {
          id?: string;
          slug: string;
          data: unknown;
          paket: "dasar" | "plus" | "abadi";
          status?: "draft" | "pending" | "active" | "expired";
          active_until?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<PageRow>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: {
          id?: string;
          page_id: string;
          order_id: string;
          paket: "dasar" | "plus" | "abadi";
          gross_amount: number;
          status?:
            | "pending"
            | "settlement"
            | "capture"
            | "deny"
            | "expire"
            | "cancel"
            | "failure";
          snap_token?: string | null;
          payment_type?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<OrderRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      activate_midtrans_order: {
        Args: {
          p_order_id: string;
          p_payment_type: string;
          p_paid_at: string;
          p_active_days: number | null;
        };
        Returns: OrderRow;
      };
      fail_midtrans_order: {
        Args: {
          p_order_id: string;
          p_status: "deny" | "expire" | "cancel" | "failure";
          p_payment_type: string;
        };
        Returns: OrderRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
