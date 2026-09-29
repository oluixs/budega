import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, isMockMode } from "@/lib/env";

/**
 * 1. Renova a sessão do Supabase (cookies) antes de cada renderização, para Server
 *    Components e Server Actions receberem um token válido.
 * 2. Checagem otimista do /admin: sem sessão, manda para /entrar. A checagem de role
 *    contra o banco fica em lib/auth.ts (requireAdminAccess) — o proxy não é
 *    autorização de verdade.
 * Em modo mock não há sessão nem painel protegido: passa direto.
 */
export async function proxy(request: NextRequest) {
  if (isMockMode) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        // Cabeçalhos anti-cache exigidos pela lib quando grava cookie de sessão.
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  // Não coloque código entre a criação do cliente e esta chamada: é ela que renova o token.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  if (!isSignedIn && request.nextUrl.pathname.startsWith("/admin")) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/entrar";
    signInUrl.search = "";
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(signInUrl);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  // Tudo, menos assets estáticos e imagens.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
