import { test, expect } from '@playwright/test';

test.describe('Court Canvas Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve inicializar a prancheta corretamente', async ({ page }) => {
    // Konva cria múltiplos canvas (um por Layer), então usamos .first()
    const canvas = page.locator('#app canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('deve adicionar um jogador do Time A ao clicar no campo', async ({ page }) => {
    // Selecionar ferramenta de Time A
    await page.click('button[title="Time A"]');

    // Clicar no centro do canvas (aprox 400, 250 em um canvas 800x500)
    // Precisamos pegar a bounding box do container para clicar na posição correta
    const container = page.locator('#app');
    const box = await container.boundingBox();
    
    await page.mouse.click(box.x + 400, box.y + 250);

    // Verificar via console se um jogador foi adicionado
    const playerCount = await page.evaluate(() => {
      const court = window.courtInstance;
      return court.interactiveLayer.find('.player').length;
    });

    expect(playerCount).toBe(1);
  });

  test('deve desfazer a adição de um jogador', async ({ page }) => {
    await page.click('button[title="Time A"]');
    
    const container = page.locator('#app');
    const box = await container.boundingBox();
    await page.mouse.click(box.x + 100, box.y + 100);

    // Clicar em Desfazer
    await page.click('button[title="Desfazer (Ctrl+Z)"]');

    const playerCount = await page.evaluate(() => {
        return window.courtInstance.interactiveLayer.find('.player').length;
    });

    expect(playerCount).toBe(0);
  });
});
