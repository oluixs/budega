import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { safeNextPath } from "@/lib/utils";

/**
 * Destino do link de confirmação de e-mail do cadastro (emailRedirectTo em
 * auth-form.tsx). O Supabase devolve um `code` (fluxo PKCE) que trocamos por uma sessão
 * gravada em cookie. No painel do Supabase, adicione `<seu-domínio>/auth/callback` em
 * Authentication > URL Configuration > Redirect URLs.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createServerSupabase();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=confirmacao`);
}
