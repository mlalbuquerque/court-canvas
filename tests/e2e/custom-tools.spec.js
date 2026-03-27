import { test, expect } from '@playwright/test';

test.describe('Court Canvas Custom Tools E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Injetar uma instância com ferramentas customizadas para o teste
    await page.evaluate(() => {
      // Destruir instância anterior se existir
      if (window.courtInstance && window.courtInstance.stage) {
        window.courtInstance.stage.destroy();
        document.getElementById('app').innerHTML = '';
      }
      
      const { CourtCanvas } = window.CourtCanvasLib; // Supondo que esteja exposto ou acessivel
      
      // Como o dev/main.js usa import real, vamos apenas re-inicializar
      // via a classe que ja deve estar no bundle do Vite
      window.courtInstance = new window.CourtCanvasLib.CourtCanvas('app', {
        width: 800,
        height: 500,
        customTools: [
          { 
            id: 'test-ball', 
            type: 'stamp', 
            icon: '⚽', 
            imageUrl: 'https://raw.githubusercontent.com/konvajs/konvajs.github.io/master/assets/lion.png' // Imagem de teste real
          }
        ]
      });
    });
  });

  test('deve adicionar um carimbo (stamp) ao clicar no campo', async ({ page }) => {
    // Esperar o botão da ferramenta customizada aparecer (⚽)
    const stampBtn = page.locator('button[title="test-ball"]');
    await expect(stampBtn).toBeVisible();
    await stampBtn.click();

    // Clicar no centro do campo
    const container = page.locator('#app');
    const box = await container.boundingBox();
    await page.mouse.click(box.x + 400, box.y + 250);

    // Validar via motor do Konva que o stamp foi adicionado
    const stampExists = await page.evaluate(() => {
      const stamps = window.courtInstance.interactiveLayer.find('.stamp');
      return stamps.length > 0 && stamps[0].className === 'Image';
    });

    expect(stampExists).toBe(true);
  });
});
