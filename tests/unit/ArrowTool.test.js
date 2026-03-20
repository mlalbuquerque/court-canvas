import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';
import ArrowTool from '../../src/core/Tools/ArrowTool.js';
import Konva from 'konva';

describe('ArrowTool', () => {
  let court;
  let tool;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    court = new CourtCanvas('app');
    tool = new ArrowTool(court);
  });

  it('deve ativar corretamente mudando o cursor', () => {
    tool.activate();
    expect(court.stage.container().style.cursor).toBe('crosshair');
  });

  it('deve iniciar desenho no mousedown', () => {
    vi.spyOn(court.stage, 'getPointerPosition').mockReturnValue({ x: 100, y: 100 });
    
    tool.onMouseDown();
    
    expect(tool.isDrawing).toBe(true);
    expect(tool.currentArrow).toBeDefined();
    expect(court.interactiveLayer.children).toContain(tool.currentArrow);
  });

  it('deve atualizar pontos no mousemove', () => {
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 100, y: 100 }) // mousedown
      .mockReturnValueOnce({ x: 150, y: 150 }); // mousemove
    
    tool.onMouseDown();
    tool.onMouseMove();
    
    const points = tool.currentArrow.points();
    expect(points[2]).toBe(150);
    expect(points[3]).toBe(150);
  });

  it('deve salvar estado no mouseup se a seta for longa o suficiente', () => {
    const saveSpy = vi.spyOn(court.stateManager, 'saveState');
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 100, y: 100 })
      .mockReturnValue({ x: 200, y: 200 });
    
    tool.onMouseDown();
    tool.onMouseMove();
    tool.onMouseUp();
    
    expect(saveSpy).toHaveBeenCalled();
    expect(tool.isDrawing).toBe(false);
  });

  it('deve destruir seta curta no mouseup', () => {
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 100, y: 100 })
      .mockReturnValue({ x: 105, y: 105 });
    
    tool.onMouseDown();
    tool.onMouseMove();
    tool.onMouseUp();
    
    expect(court.interactiveLayer.find('.arrow').length).toBe(0);
  });

  it('deve salvar estado no dragend da seta', () => {
    const saveSpy = vi.spyOn(court.stateManager, 'saveState');
    vi.spyOn(court.stage, 'getPointerPosition').mockReturnValue({ x: 100, y: 100 });
    tool.onMouseDown();
    const arrow = court.interactiveLayer.findOne('.arrow');
    
    arrow.fire('dragend');
    expect(saveSpy).toHaveBeenCalled();
  });
});
