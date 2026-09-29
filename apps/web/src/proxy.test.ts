// @vitest-environment node
// NextRequest precisa do Headers do Node, não do jsdom.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Simula o modo Supabase real (com credenciais) e controla quem está logado.
vi.mock("@/lib/env", () => ({
  env: { supabaseUrl: "https://exemplo.supabase.co", supabaseAnonKey: "anon-key" },
  isMockMode: false,
}));

let currentUserId: string | null = null;
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getClaims: async () => ({ data: currentUserId ? { claims: { sub: currentUserId } } : null }),
    },
  }),
}));

const { proxy } = await import("./proxy");

function request(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("proxy (modo Supabase real)", () => {
  beforeEach(() => {
    currentUserId = null;
  });

  it("sem sessão, /admin redireciona para /entrar guardando o destino", async () => {
    const response = await proxy(request("/admin/ofertas"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/entrar");
    expect(location.searchParams.get("next")).toBe("/admin/ofertas");
  });

  it("com sessão, /admin segue (a checagem de role é no servidor, em lib/auth.ts)", async () => {
    currentUserId = "00000000-0000-4000-8000-000000000001";
    const response = await proxy(request("/admin"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("páginas públicas nunca exigem login", async () => {
    const response = await proxy(request("/explorar"));
    expect(response.headers.get("location")).toBeNull();
  });
});
