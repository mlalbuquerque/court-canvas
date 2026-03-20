import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';
import ShapeTool from '../../src/core/Tools/ShapeTool.js';
import Konva from 'konva';

describe('ShapeTool', () => {
  let court;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    court = new CourtCanvas('app');
  });

  it('deve criar um retângulo quando type é rect', () => {
    const tool = new ShapeTool(court, 'rect');
    vi.spyOn(court.stage, 'getPointerPosition').mockReturnValue({ x: 50, y: 50 });
    
    tool.onMouseDown();
    expect(tool.currentShape).toBeInstanceOf(Konva.Rect);
    expect(tool.currentShape.name()).toBe('shape');
  });

  it('deve criar uma elipse quando type é ellipse', () => {
    const tool = new ShapeTool(court, 'ellipse');
    vi.spyOn(court.stage, 'getPointerPosition').mockReturnValue({ x: 50, y: 50 });
    
    tool.onMouseDown();
    expect(tool.currentShape).toBeInstanceOf(Konva.Ellipse);
  });

  it('deve redimensionar retângulo no mousemove', () => {
    const tool = new ShapeTool(court, 'rect');
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 50, y: 50 })
      .mockReturnValueOnce({ x: 150, y: 150 });
    
    tool.onMouseDown();
    tool.onMouseMove();
    
    expect(tool.currentShape.width()).toBe(100);
    expect(tool.currentShape.height()).toBe(100);
  });

  it('deve redimensionar elipse no mousemove', () => {
    const tool = new ShapeTool(court, 'ellipse');
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 50, y: 50 })
      .mockReturnValueOnce({ x: 150, y: 150 });
    
    tool.onMouseDown();
    tool.onMouseMove();
    
    expect(tool.currentShape.radiusX()).toBe(100);
    expect(tool.currentShape.radiusY()).toBe(100);
  });

  it('deve salvar estado no mouseup se a forma for válida', () => {
    const saveSpy = vi.spyOn(court.stateManager, 'saveState');
    const tool = new ShapeTool(court, 'rect');
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 50, y: 50 })
      .mockReturnValue({ x: 100, y: 100 });
    
    tool.onMouseDown();
    tool.onMouseMove();
    tool.onMouseUp();
    
    expect(saveSpy).toHaveBeenCalled();
  });

  it('deve destruir forma se for muito pequena no mouseup', () => {
    const tool = new ShapeTool(court, 'rect');
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 50, y: 50 })
      .mockReturnValue({ x: 55, y: 55 });
    
    tool.onMouseDown();
    tool.onMouseMove();
    tool.onMouseUp();
    
    expect(court.interactiveLayer.findOne('.shape')).toBeUndefined();
  });

  it('deve destruir elipse se for muito pequena no mouseup', () => {
    const tool = new ShapeTool(court, 'ellipse');
    vi.spyOn(court.stage, 'getPointerPosition')
      .mockReturnValueOnce({ x: 50, y: 50 })
      .mockReturnValue({ x: 55, y: 55 });
    
    tool.onMouseDown();
    tool.onMouseMove();
    tool.onMouseUp();
    
    expect(court.interactiveLayer.findOne('.shape')).toBeUndefined();
  });
});
