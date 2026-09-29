export type UserRole = "user" | "market_manager" | "admin";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/** Linha de `admin_list_users()` (migration 0003): perfil + e-mail, só para admin. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface OpeningHours {
  /** 0 = domingo ... 6 = sábado */
  day: number;
  opens_at: string | null;
  closes_at: string | null;
  closed: boolean;
}

export interface Market {
  id: string;
  /** Responsável pelo mercado (profiles.id); nulo = só admin gerencia. */
  owner_id?: string | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHours[];
  is_verified: boolean;
  is_featured: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  market_id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  opening_hours: OpeningHours[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export type FlyerFileType = "pdf" | "image";
export type FlyerStatus = "active" | "paused" | "archived";

export interface Flyer {
  id: string;
  market_id: string;
  branch_id: string | null;
  title: string;
  file_url: string;
  file_type: FlyerFileType;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  status: FlyerStatus;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  market_id: string;
  branch_id: string | null;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  promotional_price: number;
  regular_price: number | null;
  unit: string;
  conditions: string | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string | null;
  device_id: string | null;
  market_id: string | null;
  offer_id: string | null;
  created_at: string;
}

export type ReportReason =
  | "preco_incorreto"
  | "oferta_vencida"
  | "mercado_incorreto"
  | "conteudo_inadequado"
  | "encarte_ilegivel";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export interface Report {
  id: string;
  user_id: string | null;
  market_id: string | null;
  flyer_id: string | null;
  offer_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
}

export type AnalyticsEventName =
  | "market_view"
  | "offer_view"
  | "flyer_view"
  | "route_click"
  | "phone_click"
  | "whatsapp_click"
  | "share"
  | "favorite_add"
  | "favorite_remove";

export interface AnalyticsEvent {
  id: string;
  event_name: AnalyticsEventName;
  user_id: string | null;
  market_id: string | null;
  offer_id: string | null;
  flyer_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Um mercado enriquecido com distância calculada a partir da posição do usuário. */
export interface MarketWithDistance extends Market {
  distance_km: number | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
