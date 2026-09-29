"use server";

import { revalidatePath } from "next/cache";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import {
  branchFormSchema,
  marketFormSchema,
  offerFormSchema,
  flyerFormSchema,
  slugify,
  type BranchFormValues,
  type MarketFormValues,
  type OfferFormValues,
  type FlyerFormValues,
} from "@budega/shared";
import { isMock } from "@/lib/supabase";
import { getAdminAccess, type CurrentUser } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions";

const MOCK_NOTICE = "Modo demonstração: a alteração não é persistida (configure o Supabase real para gravar de verdade).";

function mockResult(message: string): ActionResult {
  return { success: true, message: `${message} ${MOCK_NOTICE}` };
}

/**
 * Server Actions são endpoints HTTP públicos: qualquer um pode chamá-las com argumentos
 * arbitrários. Por isso cada ação (1) valida os argumentos — nunca repassa nome de
 * coluna/valor vindo do cliente sem allowlist —, (2) confere sessão e role no servidor
 * e (3) grava com o cliente autenticado do request, para o RLS (migrations 0001/0002)
 * ser a última barreira. Em modo mock não há sessão real: as ações só simulam sucesso.
 */

type Authorized =
  | { ok: true; supabase: SupabaseClient; user: CurrentUser; isAdmin: boolean }
  | { ok: false; result: ActionResult };

async function authorize({ adminOnly = false } = {}): Promise<Authorized> {
  const access = await getAdminAccess();
  if (access.status === "signed-out" || access.status === "mock") {
    return { ok: false, result: { success: false, message: "Sua sessão expirou. Entre novamente para continuar." } };
  }
  if (access.status === "forbidden" || (adminOnly && !access.isAdmin)) {
    return { ok: false, result: { success: false, message: "Você não tem permissão para esta ação." } };
  }
  return { ok: true, supabase: access.supabase, user: access.user, isAdmin: access.isAdmin };
}

function failure(error: PostgrestError): ActionResult {
  // 42501 = insufficient_privilege (RLS/trigger da 0002).
  if (error.code === "42501") return { success: false, message: "Você não tem permissão para esta ação." };
  return { success: false, message: error.message };
}

const NOT_FOUND: ActionResult = {
  success: false,
  message: "Item não encontrado ou você não tem permissão para alterá-lo.",
};

/** Revalida a tela do admin e o site público, que mostra o mesmo conteúdo. */
function revalidate(adminPath: string) {
  revalidatePath(adminPath);
  revalidatePath("/", "layout");
}

const MARKET_FLAGS = ["is_verified", "is_featured", "is_suspended"] as const;
const OFFER_FLAGS = ["is_active", "is_featured"] as const;
const FLYER_STATUSES = ["active", "paused", "archived"] as const;
const REPORT_STATUSES = ["resolved", "dismissed"] as const;

function isOneOf<T extends string>(allowed: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

const INVALID: ActionResult = { success: false, message: "Ação inválida." };

export async function setMarketFlag(
  marketId: string,
  flag: (typeof MARKET_FLAGS)[number],
  value: boolean,
): Promise<ActionResult> {
  if (!isOneOf(MARKET_FLAGS, flag) || typeof value !== "boolean") return INVALID;
  if (isMock) return mockResult(`Mercado atualizado (${flag} = ${value}).`);

  // Verificar/destacar/suspender é moderação: só admin (também garantido por trigger).
  const auth = await authorize({ adminOnly: true });
  if (!auth.ok) return auth.result;

  const { data, error } = await auth.supabase.from("markets").update({ [flag]: value }).eq("id", marketId).select("id");
  if (error) return failure(error);
  if (!data?.length) return NOT_FOUND;
  revalidate("/admin/mercados");
  return { success: true, message: "Mercado atualizado." };
}

export async function createMarket(values: MarketFormValues): Promise<ActionResult> {
  const parsed = marketFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados do mercado inválidos." };
  const baseSlug = slugify(parsed.data.name);
  if (!baseSlug) return { success: false, message: "Use letras ou números no nome do mercado." };

  if (isMock) return mockResult(`Mercado "${parsed.data.name}" criado.`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  // Responsável por mercado vira dono do que cadastra (policy markets_insert_owner_or_admin).
  // Mercado cadastrado por admin fica sem dono até ser atribuído a um responsável.
  const row = {
    ...parsed.data,
    state: parsed.data.state.toUpperCase(),
    owner_id: auth.isAdmin ? null : auth.user.id,
  };

  // Slug é único: em caso de nome repetido, tenta com sufixo numérico.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const slug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    const { error } = await auth.supabase.from("markets").insert({ ...row, slug });
    if (!error) {
      revalidate("/admin/mercados");
      return { success: true, message: "Mercado cadastrado com sucesso." };
    }
    if (error.code !== "23505") return failure(error); // 23505 = unique_violation
  }
  return { success: false, message: "Já existem mercados com esse nome. Use um nome mais específico." };
}

/** O slug (URL pública) não muda ao editar, para não quebrar links já compartilhados. */
export async function updateMarket(marketId: string, values: MarketFormValues): Promise<ActionResult> {
  if (typeof marketId !== "string" || !marketId) return INVALID;
  const parsed = marketFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados do mercado inválidos." };

  if (isMock) return mockResult(`Mercado "${parsed.data.name}" atualizado.`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { data, error } = await auth.supabase
    .from("markets")
    .update({ ...parsed.data, state: parsed.data.state.toUpperCase() })
    .eq("id", marketId)
    .select("id");
  if (error) return failure(error);
  if (!data?.length) return NOT_FOUND;
  revalidate("/admin/mercados");
  return { success: true, message: "Mercado atualizado." };
}

export async function createBranch(values: BranchFormValues): Promise<ActionResult> {
  const parsed = branchFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados da filial inválidos." };

  if (isMock) return mockResult(`Filial "${parsed.data.name}" criada.`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { error } = await auth.supabase.from("branches").insert({
    ...parsed.data,
    state: parsed.data.state.toUpperCase(),
  });
  if (error) return failure(error);
  revalidate("/admin/filiais");
  return { success: true, message: "Filial criada com sucesso." };
}

export async function updateBranch(branchId: string, values: BranchFormValues): Promise<ActionResult> {
  if (typeof branchId !== "string" || !branchId) return INVALID;
  const parsed = branchFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados da filial inválidos." };

  if (isMock) return mockResult(`Filial "${parsed.data.name}" atualizada.`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { data, error } = await auth.supabase
    .from("branches")
    .update({ ...parsed.data, state: parsed.data.state.toUpperCase() })
    .eq("id", branchId)
    .select("id");
  if (error) return failure(error);
  if (!data?.length) return NOT_FOUND;
  revalidate("/admin/filiais");
  return { success: true, message: "Filial atualizada." };
}

/**
 * Ofertas e encartes vinculados à filial não são apagados: a FK usa
 * `on delete set null`, então passam a valer para o mercado inteiro.
 */
export async function deleteBranch(branchId: string): Promise<ActionResult> {
  if (typeof branchId !== "string" || !branchId) return INVALID;
  if (isMock) return mockResult("Filial excluída.");

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { data, error } = await auth.supabase.from("branches").delete().eq("id", branchId).select("id");
  if (error) return failure(error);
  if (!data?.length) return NOT_FOUND;
  revalidate("/admin/filiais");
  return { success: true, message: "Filial excluída." };
}

export async function createOffer(values: OfferFormValues): Promise<ActionResult> {
  const parsed = offerFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados da oferta inválidos." };

  if (isMock) return mockResult(`Oferta "${parsed.data.name}" criada.`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { error } = await auth.supabase.from("offers").insert({
    ...parsed.data,
    is_active: true,
  });
  if (error) return failure(error);
  revalidate("/admin/ofertas");
  return { success: true, message: "Oferta criada com sucesso." };
}

export async function setOfferFlag(
  offerId: string,
  flag: (typeof OFFER_FLAGS)[number],
  value: boolean,
): Promise<ActionResult> {
  if (!isOneOf(OFFER_FLAGS, flag) || typeof value !== "boolean") return INVALID;
  if (isMock) return mockResult(`Oferta atualizada (${flag} = ${value}).`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { data, error } = await auth.supabase.from("offers").update({ [flag]: value }).eq("id", offerId).select("id");
  if (error) return failure(error);
  if (!data?.length) return NOT_FOUND;
  revalidate("/admin/ofertas");
  return { success: true, message: "Oferta atualizada." };
}

export async function createFlyer(values: FlyerFormValues): Promise<ActionResult> {
  const parsed = flyerFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados do encarte inválidos." };

  if (isMock) return mockResult(`Encarte "${parsed.data.title}" criado.`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { error } = await auth.supabase.from("flyers").insert({
    ...parsed.data,
    is_active: parsed.data.status === "active",
  });
  if (error) return failure(error);
  revalidate("/admin/encartes");
  return { success: true, message: "Encarte criado com sucesso." };
}

export async function setFlyerStatus(
  flyerId: string,
  status: (typeof FLYER_STATUSES)[number],
): Promise<ActionResult> {
  if (!isOneOf(FLYER_STATUSES, status)) return INVALID;
  if (isMock) return mockResult(`Encarte atualizado (status = ${status}).`);

  const auth = await authorize();
  if (!auth.ok) return auth.result;

  const { data, error } = await auth.supabase
    .from("flyers")
    .update({ status, is_active: status === "active" })
    .eq("id", flyerId)
    .select("id");
  if (error) return failure(error);
  if (!data?.length) return NOT_FOUND;
  revalidate("/admin/encartes");
  return { success: true, message: "Encarte atualizado." };
}

export async function resolveReport(
  reportId: string,
  status: (typeof REPORT_STATUSES)[number],
): Promise<ActionResult> {
  if (!isOneOf(REPORT_STATUSES, status)) return INVALID;
  if (isMock) return mockResult(`Denúncia marcada como ${status}.`);

  const auth = await authorize({ adminOnly: true });
  if (!auth.ok) return auth.result;

  const { data, error } = await auth.supabase
    .from("reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", reportId)
    .select("id");
  if (error) return failure(error);
  if (!data?.length) return NOT_FOUND;
  revalidatePath("/admin/denuncias");
  return { success: true, message: "Denúncia atualizada." };
}
