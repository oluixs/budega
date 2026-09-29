import { expect, expectNoHorizontalScroll, screenshot, test } from "./fixtures";

const PAGES = [
  { path: "/", name: "home" },
  { path: "/explorar", name: "explorar" },
  { path: "/mercados/bom-preco-pinheiros", name: "mercado" },
  { path: "/favoritos", name: "favoritos" },
  { path: "/entrar", name: "entrar" },
  { path: "/cadastro", name: "cadastro" },
  { path: "/privacidade", name: "privacidade" },
  { path: "/termos", name: "termos" },
  { path: "/explorar?view=mapa", name: "explorar-mapa" },
];

test("filtros do explorar mostram os nomes das opções e têm rótulo", async ({ page }) => {
  await page.goto("/explorar");
  // Regressão: mostravam "any"/"distance" (valor cru do Select) e os rótulos eram soltos.
  await expect(page.getByLabel("Distância")).toHaveText(/Qualquer distância/);
  await expect(page.getByLabel("Categoria")).toHaveText(/Todas as categorias/);
  await expect(page.getByLabel("Ordenar por")).toHaveText(/Mais perto/);
});

test("mapa interativo mostra os mercados com a lista acessível abaixo", async ({ page }) => {
  await page.goto("/explorar?view=mapa");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mercados no mapa" })).toBeVisible();
});

for (const { path, name } of PAGES) {
  test(`${path} carrega sem erros e sem rolagem horizontal`, async ({ page }, testInfo) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await screenshot(page, name, testInfo.project.name);
  });
}

test("busca da home leva ao explorar com resultados do bairro", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Endereço ou bairro" }).fill("Pinheiros");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page).toHaveURL(/\/explorar\?q=Pinheiros/);
  await expect(page.getByText("Bom Preço Pinheiros").first()).toBeVisible();
});

test("favoritar um mercado aparece em Favoritos, sem cadastro", async ({ page }) => {
  await page.goto("/mercados/bom-preco-pinheiros");
  await page.getByRole("button", { name: "Adicionar aos favoritos" }).first().click();
  await expect(page.getByRole("button", { name: "Remover dos favoritos" }).first()).toBeVisible();

  await page.goto("/favoritos");
  await expect(page.getByText("Bom Preço Pinheiros").first()).toBeVisible();
});

test("denunciar mostra o motivo pelo nome e envia em modo demonstração", async ({ page }) => {
  await page.goto("/mercados/bom-preco-pinheiros");
  await page.getByRole("button", { name: "Denunciar" }).first().click();

  const dialog = page.getByRole("dialog");
  const reason = dialog.getByRole("combobox");
  // Regressão: o Select mostrava "mercado_incorreto" (valor cru) em vez do rótulo.
  await expect(reason).toHaveText(/Informações do mercado incorretas/);
  // Regressão: os <label> apontavam para uma <div>; agora nomeiam o campo.
  await expect(dialog.getByLabel("Motivo")).toBeVisible();

  await reason.click();
  await page.getByRole("option", { name: "Oferta vencida" }).click();
  await expect(reason).toHaveText(/Oferta vencida/);

  await dialog.getByRole("button", { name: /enviar/i }).click();
  await expect(page.getByText(/Denúncia registrada/)).toBeVisible();
});

test("mercado inexistente responde 404", async ({ page }) => {
  // Único caso em que o console registra erro esperado (o 404 do documento).
  const response = await page.request.get("/mercados/nao-existe");
  expect(response.status()).toBe(404);
});
