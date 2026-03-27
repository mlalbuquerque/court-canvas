import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';

describe('CourtCanvas Import/Export', () => {
  let court;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('deve carregar um estado inicial via construtor', () => {
    // Estado simples: Uma Layer com um Rect
    const initialState = {
      className: 'Layer',
      children: [
        {
          className: 'Rect',
          attrs: { name: 'shape', x: 100, y: 100, width: 50, height: 50, fill: 'red' }
        }
      ]
    };

    court = new CourtCanvas('app', { initialState });
    
    // Verifica se o Rect foi adicionado à camada interativa
    const shapes = court.interactiveLayer.find('.shape');
    expect(shapes.length).toBe(1);
    expect(shapes[0].x()).toBe(100);
  });

  it('deve permitir carregar estado via método load() e suportar Undo', () => {
    court = new CourtCanvas('app');
    
    const newState = {
      className: 'Layer',
      children: [
        {
          className: 'Rect',
          attrs: { name: 'shape', x: 200, y: 200, width: 50, height: 50, fill: 'blue' }
        }
      ]
    };

    court.load(newState);
    
    let shapes = court.interactiveLayer.find('.shape');
    expect(shapes.length).toBe(1);
    expect(shapes[0].x()).toBe(200);

    // Testar Undo
    court.stateManager.undo();
    shapes = court.interactiveLayer.find('.shape');
    expect(shapes.length).toBe(0); // Volta ao estado inicial (vazio)
  });
});
