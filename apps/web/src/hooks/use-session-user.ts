"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@budega/shared";
import { getBrowserSupabase } from "@/lib/supabase";

export interface SessionUser {
  id: string;
  role: UserRole | null;
}

/**
 * Usuário logado para a UI do cabeçalho (mostrar "Entrar" ou "Painel/Sair"). Roda no
 * cliente para as páginas públicas continuarem estáticas. É só apresentação: quem
 * decide o acesso ao /admin é o servidor (lib/auth.ts). Em modo mock é sempre `null`.
 */
export function useSessionUser(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let active = true;

    async function load(userId: string | undefined) {
      if (!userId) {
        if (active) setUser(null);
        return;
      }
      const { data } = await supabase!.from("profiles").select("role").eq("id", userId).maybeSingle<{ role: UserRole }>();
      if (active) setUser({ id: userId, role: data?.role ?? null });
    }

    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user.id);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return user;
}
