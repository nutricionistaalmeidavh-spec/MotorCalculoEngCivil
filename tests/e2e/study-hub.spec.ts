import { expect, test } from "@playwright/test";

test("seven Apple Utils resources are visible and functional", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Central de Estudos" })).toBeVisible();

  for (const heading of [
    "Painel de Estudos",
    "Material PDF",
    "Anotações",
    "Mapa de Estudos",
    "Busca Local",
    "Progresso e Armazenamento",
    "Offline / PWA",
  ]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  await page.getByRole("button", { name: "Limites", exact: true }).click();
  await expect(page.getByTestId("study-topic-detail")).toContainText("Limites");
  await expect(page.getByTestId("study-topic-detail")).toContainText(/limite/i);

  await page.getByLabel("Buscar no material").fill("limite");
  await expect(page.getByTestId("study-search-results")).toContainText("Limites");

  await page.getByLabel("Nova anotação").fill("termo-unico-e2e");
  await page.getByRole("button", { name: "Adicionar anotação" }).click();
  await expect(page.getByTestId("study-annotation-list")).toContainText("termo-unico-e2e");

  await page.getByLabel("Buscar no material").fill("termo-unico-e2e");
  await expect(page.getByTestId("study-search-results")).toContainText("termo-unico-e2e");

  await page.getByRole("button", { name: "Abrir material PDF" }).click();
  await expect(page.getByTestId("study-pdf-status")).toContainText(/Carregado.*1 página/);

  await expect(page.getByTestId("study-storage-status")).toContainText(/indexeddb|memory-browser/);
  await expect(page.getByTestId("study-pwa-status")).toContainText(/Ativo|Indisponível|Falhou/);
});

test("annotation and progress survive reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Limites", exact: true }).click();
  await page.getByLabel("Tópico concluído").check();
  await page.getByLabel("Nova anotação").fill("persistencia-e2e");
  await page.getByRole("button", { name: "Adicionar anotação" }).click();
  await expect(page.getByTestId("study-storage-status")).toContainText("salvo");
  await page.reload();
  await expect(page.getByTestId("study-topic-detail")).toContainText("Limites");
  await expect(page.getByLabel("Tópico concluído")).toBeChecked();
  await expect(page.getByTestId("study-annotation-list")).toContainText("persistencia-e2e");
});

test("study hub stays usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Central de Estudos" })).toBeVisible();
  await expect(page.getByLabel("Expressão matemática")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
