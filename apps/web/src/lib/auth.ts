import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@budega/shared";
import { isMock } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
}

export type AdminAccess =
  | { status: "mock" }
  | { status: "signed-out" }
  | { status: "forbidden"; user: CurrentUser }
  | {
      status: "granted";
      user: CurrentUser;
      supabase: SupabaseClient;
      isAdmin: boolean;
      /** Mercados que o usuário gerencia; `null` = todos (admin). */
      marketIds: string[] | null;
    };

const PANEL_ROLES: UserRole[] = ["admin", "market_manager"];

/**
 * Checagem de acesso ao painel feita no servidor, contra o banco (a do proxy é só
 * otimista, pelo cookie). `cache` evita repetir as consultas quando layout, página e
 * funções de dados pedem a mesma informação no mesmo request.
 */
export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  if (isMock) return { status: "mock" };

  const supabase = (await createServerSupabase())!;
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { status: "signed-out" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", userId)
    .maybeSingle<CurrentUser>();
  if (!profile) return { status: "signed-out" };
  if (!PANEL_ROLES.includes(profile.role)) return { status: "forbidden", user: profile };

  const isAdmin = profile.role === "admin";
  let marketIds: string[] | null = null;
  if (!isAdmin) {
    const { data: owned } = await supabase.from("markets").select("id").eq("owner_id", userId);
    marketIds = (owned ?? []).map((market: { id: string }) => market.id);
  }

  return { status: "granted", user: profile, supabase, isAdmin, marketIds };
});

type GrantedAccess = Extract<AdminAccess, { status: "granted" }>;

/**
 * Para Server Components do /admin: devolve o acesso concedido (ou `mock`) e
 * redireciona nos demais casos. Layout e página renderizam em paralelo, então cada
 * página/função de dados do painel precisa chamar isto — não basta o layout.
 */
export async function requireAdminAccess(): Promise<GrantedAccess | { status: "mock" }> {
  const access = await getAdminAccess();
  if (access.status === "signed-out") redirect("/entrar?next=/admin");
  if (access.status === "forbidden") redirect("/acesso-negado");
  return access;
}
