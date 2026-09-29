import { expect, expectNoHorizontalScroll, screenshot, test } from "./fixtures";

// Em modo mock o painel é aberto (com aviso) e as ações só simulam a gravação.

for (const section of ["", "/mercados", "/filiais", "/ofertas", "/encartes", "/denuncias", "/usuarios"]) {
  test(`/admin${section} carrega sem erros`, async ({ page }, testInfo) => {
    const response = await page.goto(`/admin${section}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByText(/Modo demonstração/).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await screenshot(page, `admin${section.replace("/", "-")}`, testInfo.project.name);
  });
}

test("cadastrar oferta: selects mostram nomes e o formulário envia", async ({ page }) => {
  await page.goto("/admin/ofertas");
  await page.getByRole("button", { name: "Nova oferta" }).click();
  const dialog = page.getByRole("dialog");

  const [market, category] = [dialog.getByRole("combobox").nth(0), dialog.getByRole("combobox").nth(1)];
  await market.click();
  await page.getByRole("option", { name: "Bom Preço Pinheiros" }).click();
  // Regressão: mostrava "mkt-bompreco-pinheiros".
  await expect(market).toHaveText(/Bom Preço Pinheiros/);

  await category.click();
  await page.getByRole("option", { name: "Hortifruti" }).click();
  await expect(category).toHaveText(/Hortifruti/);

  await dialog.getByLabel("Produto").fill("Banana Prata");
  await dialog.getByLabel("Preço promocional").fill("3.49");
  await dialog.getByLabel("Unidade").fill("kg");
  await dialog.getByRole("button", { name: "Salvar oferta" }).click();

  // Regressão: o schema exigia UUID e o envio nunca acontecia em modo mock.
  await expect(page.getByText(/Oferta "Banana Prata" criada/)).toBeVisible();
});

test("cadastrar mercado com horário por dia", async ({ page }) => {
  await page.goto("/admin/mercados");
  await page.getByRole("button", { name: "Novo mercado" }).click();
  const dialog = page.getByRole("dialog");

  await dialog.getByLabel("Nome do mercado").fill("Mercadinho São João");
  await dialog.getByLabel("Endereço").fill("Rua das Flores, 100");
  await dialog.getByLabel("Bairro").fill("Centro");
  await dialog.getByLabel("Cidade").fill("São Paulo");
  await dialog.getByLabel("UF").fill("sp");
  await dialog.getByLabel("CEP").fill("01000-000");
  await dialog.getByLabel("Latitude").fill("-23.55");
  await dialog.getByLabel("Longitude").fill("-46.63");
  // Domingo é a última linha do editor de horário (a semana começa na segunda).
  await dialog.getByRole("checkbox", { name: "Fechado" }).last().click();
  await expect(dialog.getByLabel("Domingo: abre às")).toBeDisabled();
  await expect(dialog.getByLabel("Segunda: abre às")).toBeEnabled();

  await dialog.getByRole("button", { name: "Cadastrar mercado" }).click();
  await expect(page.getByText(/Mercado "Mercadinho São João" criado/)).toBeVisible();
});

test("cadastro de mercado mostra erro de horário inválido", async ({ page }) => {
  await page.goto("/admin/mercados");
  await page.getByRole("button", { name: "Novo mercado" }).click();
  const dialog = page.getByRole("dialog");

  await dialog.getByLabel("Segunda: abre às").fill("22:00");
  await dialog.getByLabel("Segunda: fecha às").fill("08:00");
  await dialog.getByRole("button", { name: "Cadastrar mercado" }).click();
  await expect(dialog.getByRole("alert").filter({ hasText: /Segunda/ })).toBeVisible();
});

test("editar filial abre com os dados atuais", async ({ page }) => {
  await page.goto("/admin/filiais");
  await page.getByRole("button", { name: "Editar Bom Preço Pinheiros - Centro" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Nome da filial")).toHaveValue("Bom Preço Pinheiros - Centro");
  await expect(dialog.getByRole("combobox")).toHaveText(/Bom Preço Pinheiros/);
});
