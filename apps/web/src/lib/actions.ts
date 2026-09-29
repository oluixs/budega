"use server";

import { reportFormSchema, type ReportFormValues } from "@budega/shared";
import { isMock } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export interface ActionResult {
  success: boolean;
  message: string;
}

export async function submitReport(values: ReportFormValues): Promise<ActionResult> {
  const parsed = reportFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Não foi possível enviar a denúncia. Revise os dados." };
  }

  if (isMock) {
    // Modo mock: não há banco real para persistir a denúncia. Documentado no README —
    // configure NEXT_PUBLIC_SUPABASE_URL/ANON_KEY para habilitar o envio real.
    return {
      success: true,
      message: "Denúncia registrada (modo demonstração — configure o Supabase para persistir de verdade).",
    };
  }

  // Denunciar não exige login (RLS reports_insert_anyone). Com sessão, a denúncia fica
  // no nome do usuário; sem sessão, vai anônima — nunca aceitamos user_id do cliente.
  const supabase = (await createServerSupabase())!;
  const { data: claimsData } = await supabase.auth.getClaims();
  const { error } = await supabase.from("reports").insert({
    user_id: claimsData?.claims?.sub ?? null,
    market_id: parsed.data.market_id ?? null,
    flyer_id: parsed.data.flyer_id ?? null,
    offer_id: parsed.data.offer_id ?? null,
    reason: parsed.data.reason,
    description: parsed.data.description ?? null,
  });

  if (error) {
    return { success: false, message: `Erro ao registrar denúncia: ${error.message}` };
  }

  return { success: true, message: "Denúncia enviada com sucesso. Obrigado por ajudar a manter o Budega atualizado." };
}
