"use client";

import type { AnalyticsEventName } from "@budega/shared";
import { getBrowserSupabase } from "@/lib/supabase";

export interface TrackEventTarget {
  market_id?: string | null;
  offer_id?: string | null;
  flyer_id?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Registra um evento de analytics (visualização, clique em rota/telefone/WhatsApp,
 * compartilhamento, favorito). Em modo mock não há tabela real: a função não faz nada.
 * Com Supabase configurado, grava com o cliente do navegador (RLS
 * `analytics_insert_anyone`/0002 exige `user_id` nulo ou o do usuário logado — nunca
 * enviamos `user_id` aqui, então sempre cai no caso anônimo).
 *
 * "Fire and forget": nunca bloqueia a navegação/ação do usuário nem mostra erro a ele —
 * telemetria não pode atrapalhar o fluxo principal. Falhas só vão para o console.
 */
export function trackEvent(eventName: AnalyticsEventName, target: TrackEventTarget = {}): void {
  const supabase = getBrowserSupabase();
  if (!supabase) return;

  supabase
    .from("analytics_events")
    .insert({
      event_name: eventName,
      market_id: target.market_id ?? null,
      offer_id: target.offer_id ?? null,
      flyer_id: target.flyer_id ?? null,
      metadata: target.metadata ?? null,
    })
    .then(({ error }) => {
      if (error) console.error(`Falha ao registrar evento "${eventName}":`, error.message);
    });
}
