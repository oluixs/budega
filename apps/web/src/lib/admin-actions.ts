"use server";

import { revalidatePath } from "next/cache";
import {
  offerFormSchema,
  flyerFormSchema,
  type OfferFormValues,
  type FlyerFormValues,
} from "@budega/shared";
import { isMock, supabase } from "@/lib/supabase";
import type { ActionResult } from "@/lib/actions";

const MOCK_NOTICE = "Modo demonstração: a alteração não é persistida (configure o Supabase real para gravar de verdade).";

function mockResult(message: string): ActionResult {
  return { success: true, message: `${message} ${MOCK_NOTICE}` };
}

/**
 * Todas as mutações abaixo exigem autenticação e role apropriada em produção — isso é
 * garantido pelas policies de RLS em packages/supabase/migrations/0001_init.sql
 * (regra de negócio 10.11), não apenas por esta camada. Em modo mock, não há sessão
 * real, então as ações só simulam sucesso e explicam a limitação.
 */

export async function setMarketFlag(
  marketId: string,
  flag: "is_verified" | "is_featured" | "is_suspended",
  value: boolean,
): Promise<ActionResult> {
  if (isMock) return mockResult(`Mercado atualizado (${flag} = ${value}).`);

  const { error } = await supabase!.from("markets").update({ [flag]: value }).eq("id", marketId);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/mercados");
  return { success: true, message: "Mercado atualizado." };
}

export async function createOffer(values: OfferFormValues): Promise<ActionResult> {
  const parsed = offerFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados da oferta inválidos." };

  if (isMock) return mockResult(`Oferta "${parsed.data.name}" criada.`);

  const { error } = await supabase!.from("offers").insert({
    ...parsed.data,
    is_active: true,
  });
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/ofertas");
  return { success: true, message: "Oferta criada com sucesso." };
}

export async function setOfferFlag(
  offerId: string,
  flag: "is_active" | "is_featured",
  value: boolean,
): Promise<ActionResult> {
  if (isMock) return mockResult(`Oferta atualizada (${flag} = ${value}).`);

  const { error } = await supabase!.from("offers").update({ [flag]: value }).eq("id", offerId);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/ofertas");
  return { success: true, message: "Oferta atualizada." };
}

export async function createFlyer(values: FlyerFormValues): Promise<ActionResult> {
  const parsed = flyerFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Dados do encarte inválidos." };

  if (isMock) return mockResult(`Encarte "${parsed.data.title}" criado.`);

  const { error } = await supabase!.from("flyers").insert({
    ...parsed.data,
    is_active: parsed.data.status === "active",
  });
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/encartes");
  return { success: true, message: "Encarte criado com sucesso." };
}

export async function setFlyerStatus(
  flyerId: string,
  status: "active" | "paused" | "archived",
): Promise<ActionResult> {
  if (isMock) return mockResult(`Encarte atualizado (status = ${status}).`);

  const { error } = await supabase!
    .from("flyers")
    .update({ status, is_active: status === "active" })
    .eq("id", flyerId);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/encartes");
  return { success: true, message: "Encarte atualizado." };
}

export async function resolveReport(
  reportId: string,
  status: "resolved" | "dismissed",
): Promise<ActionResult> {
  if (isMock) return mockResult(`Denúncia marcada como ${status}.`);

  const { error } = await supabase!
    .from("reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/denuncias");
  return { success: true, message: "Denúncia atualizada." };
}
