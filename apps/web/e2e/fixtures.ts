import { test as base, expect, type Page } from "@playwright/test";

/**
 * `page` que falha o teste se o navegador registrar qualquer erro de console ou exceção
 * não tratada (inclui erros de hidratação do React).
 */
export const test = base.extend<{ page: Page }>({
  // `provide` (e não o nome usual `use`) para o lint não confundir com o hook do React.
  page: async ({ page }, provide) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await provide(page);
    expect(errors, "erros no console do navegador").toEqual([]);
  },
});

export { expect };

/** Garante que a página não tem rolagem horizontal (layout quebrado no celular). */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "largura excedente em px").toBeLessThanOrEqual(0);
}

export async function screenshot(page: Page, name: string, projectName: string) {
  await page.screenshot({ path: `test-results/screens/${projectName}-${name}.png`, fullPage: true });
}
