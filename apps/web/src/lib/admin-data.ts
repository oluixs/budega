import "server-only";
import {
  isExpiringSoon,
  mock,
  type Branch,
  type Flyer,
  type Market,
  type Offer,
  type Report,
} from "@budega/shared";
import { isMock, supabase } from "@/lib/supabase";

/**
 * Camada de dados do painel admin. Em modo mock, lê os arrays estáticos de
 * packages/shared/src/mock diretamente (sem filtrar por vigência — o admin precisa ver
 * tudo, inclusive pausado/vencido/arquivado). Com Supabase configurado, consulta o
 * banco real sem aplicar os filtros de "ativo" usados na experiência pública.
 */

export async function getAllMarketsAdmin(): Promise<Market[]> {
  if (isMock) return mock.mockMarkets;
  const { data, error } = await supabase!.from("markets").select("*").order("name");
  if (error) throw new Error(error.message);
  return data as Market[];
}

export async function getAllBranchesAdmin(): Promise<Branch[]> {
  if (isMock) return mock.mockBranches;
  const { data, error } = await supabase!.from("branches").select("*").order("name");
  if (error) throw new Error(error.message);
  return data as Branch[];
}

export async function getAllFlyersAdmin(): Promise<Flyer[]> {
  if (isMock) return mock.mockFlyers;
  const { data, error } = await supabase!.from("flyers").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Flyer[];
}

export async function getAllOffersAdmin(): Promise<Offer[]> {
  if (isMock) return mock.mockOffers;
  const { data, error } = await supabase!.from("offers").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Offer[];
}

export async function getAllReportsAdmin(): Promise<Report[]> {
  if (isMock) return mock.mockReports;
  const { data, error } = await supabase!.from("reports").select("*").order("created_at", { ascending: false });
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
