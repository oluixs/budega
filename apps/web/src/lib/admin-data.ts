import "server-only";
import {
  isExpiringSoon,
  mock,
  type AdminUser,
  type Branch,
  type Flyer,
  type Market,
  type Offer,
  type Report,
} from "@budega/shared";
import { requireAdminAccess } from "@/lib/auth";
import { dataMode, getLocalData } from "@/lib/local-data";

/**
 * Camada de dados do painel admin. Em modo mock, lê os arrays estáticos de
 * packages/shared/src/mock diretamente (sem filtrar por vigência — o admin precisa ver
 * tudo, inclusive pausado/vencido/arquivado/suspenso). Com Supabase configurado,
 * consulta o banco **com a sessão do usuário** (cookie), então o RLS devolve o que ele
 * pode gerenciar; para gerentes de mercado, filtramos ainda pelos mercados dele, já que
 * o RLS também libera a leitura do conteúdo público dos outros mercados.
 *
 * Cada função chama requireAdminAccess(): página e layout do /admin renderizam em
 * paralelo, então a checagem não pode ficar só no layout.
 */

export async function getAllMarketsAdmin(): Promise<Market[]> {
  const access = await requireAdminAccess();
  if (access.status === "mock") return (await getLocalData()).markets;
  let query = access.supabase.from("markets").select("*").order("name");
  if (access.marketIds) query = query.in("id", access.marketIds);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Market[];
}

export async function getAllBranchesAdmin(): Promise<Branch[]> {
  const access = await requireAdminAccess();
  if (access.status === "mock") return (await getLocalData()).branches;
  let query = access.supabase.from("branches").select("*").order("name");
  if (access.marketIds) query = query.in("market_id", access.marketIds);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Branch[];
}

export async function getAllFlyersAdmin(): Promise<Flyer[]> {
  const access = await requireAdminAccess();
  if (access.status === "mock") return (await getLocalData()).flyers;
  let query = access.supabase.from("flyers").select("*").order("created_at", { ascending: false });
  if (access.marketIds) query = query.in("market_id", access.marketIds);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Flyer[];
}

export async function getAllOffersAdmin(): Promise<Offer[]> {
  const access = await requireAdminAccess();
  if (access.status === "mock") return (await getLocalData()).offers;
  let query = access.supabase.from("offers").select("*").order("created_at", { ascending: false });
  if (access.marketIds) query = query.in("market_id", access.marketIds);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Offer[];
}

/** Só admin (a função do banco também recusa outros papéis — migration 0003). */
export async function getAllUsersAdmin(): Promise<AdminUser[]> {
  const access = await requireAdminAccess();
  if (access.status === "mock") return mock.mockUsers;
  if (!access.isAdmin) return [];
  const { data, error } = await access.supabase.rpc("admin_list_users");
  if (error) throw new Error(error.message);
  return data as AdminUser[];
}

/** Denúncias são moderadas só por admin (RLS: reports_select_own_or_admin). */
export async function getAllReportsAdmin(): Promise<Report[]> {
  const access = await requireAdminAccess();
  // Denúncias de exemplo só fazem sentido com os mercados fictícios.
  if (access.status === "mock") return dataMode === "demo" ? mock.mockReports : [];
  if (!access.isAdmin) return [];
  const { data, error } = await access.supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Report[];
}

export interface DashboardStats {
  activeMarkets: number;
  activeOffers: number;
  activeFlyers: number;
  expiringOffers: number;
  expiringFlyers: number;
  pendingReports: number;
}

export interface AnalyticsSummary {
  /** true quando os números abaixo vêm de dados reais (analytics_events); false em modo mock. */
  available: boolean;
  views: number;
  routeClicks: number;
  contactClicks: number;
  shares: number;
}

const EMPTY_ANALYTICS: AnalyticsSummary = { available: false, views: 0, routeClicks: 0, contactClicks: 0, shares: 0 };

/**
 * `analytics_events` só pode ser lida por admin (RLS `analytics_select_admin_only`) —
 * responsável por mercado não vê essas contagens, mesmo dentro do próprio mercado dele.
 * Em modo mock não existe a tabela: os números ficam em 0 com `available: false`, nunca
 * inventados (regra do projeto: não fabricar métricas).
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const access = await requireAdminAccess();
  if (access.status === "mock" || !access.isAdmin) return EMPTY_ANALYTICS;

  const { data, error } = await access.supabase.from("analytics_events").select("event_name");
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data as { event_name: string }[]) {
    counts.set(row.event_name, (counts.get(row.event_name) ?? 0) + 1);
  }

  return {
    available: true,
    views: (counts.get("market_view") ?? 0) + (counts.get("offer_view") ?? 0) + (counts.get("flyer_view") ?? 0),
    routeClicks: counts.get("route_click") ?? 0,
    contactClicks: (counts.get("phone_click") ?? 0) + (counts.get("whatsapp_click") ?? 0),
    shares: counts.get("share") ?? 0,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [markets, offers, flyers, reports] = await Promise.all([
    getAllMarketsAdmin(),
    getAllOffersAdmin(),
    getAllFlyersAdmin(),
    getAllReportsAdmin(),
  ]);

  return {
    activeMarkets: markets.filter((market) => !market.is_suspended).length,
    activeOffers: offers.filter((o) => o.is_active).length,
    activeFlyers: flyers.filter((f) => f.is_active).length,
    expiringOffers: offers.filter((o) => o.is_active && isExpiringSoon(o.valid_until)).length,
    expiringFlyers: flyers.filter((f) => f.is_active && isExpiringSoon(f.valid_until)).length,
    pendingReports: reports.filter((r) => r.status === "pending").length,
  };
}
