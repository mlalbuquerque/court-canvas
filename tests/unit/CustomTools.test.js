import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';
import StampTool from '../../src/core/Tools/StampTool.js';
import PlayerTool from '../../src/core/Tools/PlayerTool.js';
import Konva from 'konva';

// Mock de Image compatível com JSDOM e vitest-canvas-mock
// Usamos o próprio HTMLImageElement do JSDOM mas simulamos o carregamento imediato
function createMockImage() {
  const img = document.createElement('img');
  // Simula o comportamento de carregamento assíncrono para disparar o onload
  setTimeout(() => {
    const event = new Event('load');
    img.dispatchEvent(event);
    if (img.onload) img.onload();
  }, 10);
  return img;
}

// Sobrescrevemos o construtor global de Image para o ambiente de teste
global.Image = vi.fn().mockImplementation(createMockImage);

describe('Custom Tools & Extensions', () => {
  let containerId = 'test-container';

  beforeEach(() => {
    document.body.innerHTML = `<div id="${containerId}"></div>`;
  });

  describe('StampTool', () => {
    it('deve criar um carimbo (stamp) com o ícone fornecido', async () => {
      const court = new CourtCanvas(containerId);
      const stampTool = new StampTool(court, { 
        imageUrl: 'ball.svg', 
        size: 30 
      });

      // Simular carregamento da imagem (setTimeout no mock)
      await new Promise(r => setTimeout(r, 10));

      stampTool.createStamp(100, 100);

      const stamps = court.interactiveLayer.find('.stamp');
      expect(stamps).toHaveLength(1);
      expect(stamps[0].className).toBe('Image');
      expect(stamps[0].getAttr('imageUrl')).toBe('ball.svg');
      expect(stamps[0].width()).toBe(30);
    });

    it('deve respeitar as bordas (bounding box) do campo', async () => {
      const court = new CourtCanvas(containerId);
      const stampTool = new StampTool(court, { imageUrl: 'cone.svg', size: 20 });
      await new Promise(r => setTimeout(r, 10));

      stampTool.createStamp(-100, -100);
      const stamp = court.interactiveLayer.findOne('.stamp');
      
      // Radius é size/2 = 10. Padding 20. Min X/Y = 30.
      expect(stamp.x()).toBe(30);
      expect(stamp.y()).toBe(30);
    });
  });

  describe('PlayerTool with Icons & Number Position', () => {
    it('deve criar jogador com imagem em vez de círculo se imageUrl estiver presente', async () => {
      const court = new CourtCanvas(containerId);
      const playerTool = new PlayerTool(court, { 
        imageUrl: 'avatar.png',
        teamColor: '#ff0000'
      });
      await new Promise(r => setTimeout(r, 10));

      playerTool.createPlayer(100, 100);
      const player = court.interactiveLayer.findOne('.player');
      
      expect(player.findOne('Image')).toBeTruthy();
      expect(player.findOne('Circle')).toBeFalsy();
    });

    it('deve posicionar o número no canto inferior direito quando numberPosition for bottom-right', async () => {
      const court = new CourtCanvas(containerId);
      const playerTool = new PlayerTool(court, { 
        numberPosition: 'bottom-right',
        teamColor: '#00ff00'
      });

      playerTool.createPlayer(100, 100);
      const player = court.interactiveLayer.findOne('.player');
      const text = player.findOne('Text');
      
      // No modo center, o texto fica em 0,0 do grupo (antes do offsetX/Y)
      // No modo bottom-right, ele fica em 10,10 do grupo.
      expect(text.x()).toBe(10);
      expect(text.y()).toBe(10);
      expect(player.find('Circle')).toHaveLength(2); // Círculo base + círculo de fundo do número
    });
  });

  describe('CourtCanvas Registration', () => {
    it('deve registrar ferramentas customizadas automaticamente via options', () => {
      const court = new CourtCanvas(containerId, {
        customTools: [
          { id: 'custom-stamp', type: 'stamp', imageUrl: 'test.svg' },
          { id: 'custom-player', type: 'player', teamColor: '#ffffff' }
        ]
      });

      expect(court.tools['custom-stamp']).toBeInstanceOf(StampTool);
      expect(court.tools['custom-player']).toBeInstanceOf(PlayerTool);
    });
  });

  describe('Export/Import Re-hydration', () => {
    it('deve recarregar imagens (re-hydrate) após importar JSON', async () => {
      const court = new CourtCanvas(containerId);
      const json = JSON.stringify({
        className: 'Layer',
        children: [
          {
            className: 'Image',
            attrs: { 
              name: 'stamp', 
              imageUrl: 'saved-icon.png', 
              x: 100, 
              y: 100, 
              width: 30, 
              height: 30 
            }
          }
        ]
      });

      court.load(json);
      
      // Aguardar processo de re-hidratação (onload da imagem)
      await new Promise(r => setTimeout(r, 10));

      const stamp = court.interactiveLayer.findOne('.stamp');
      expect(stamp.image()).toBeTruthy();
    });
  });
});
