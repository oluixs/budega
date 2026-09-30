import { defineConfig, devices } from "@playwright/test";

/**
 * Testes end-to-end num navegador real (Chromium), contra um build de produção com os
 * dados fictícios (BUDEGA_DADOS=demo). Rodar com `pnpm --filter @budega/web test:e2e`
 * (o próprio Playwright faz o build). Depois, rode `next build` de novo antes de usar
 * `next start` com os dados reais.
 * Screenshots de cada página ficam em test-results/screens/ para revisão visual.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // O build também precisa do modo demo: páginas estáticas (home, favoritos) são
    // geradas nele, com os dados do momento do build.
    command: `pnpm exec next build && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    // Força o modo sem Supabase e os dados fictícios (os testes não podem depender dos
    // sites dos mercados), mesmo que exista um .env.local.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      BUDEGA_DADOS: "demo",
      // Painel e login de demonstração (em produção sem Supabase o site é só catálogo).
      NEXT_PUBLIC_BUDEGA_PAINEL_DEMO: "1",
    },
  },
});
