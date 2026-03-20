import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';
import Konva from 'konva';

describe('CourtCanvas', () => {
  let container;

  beforeEach(() => {
    // Preparar container DOM
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');
  });

  it('deve inicializar com opções padrão', () => {
    const court = new CourtCanvas('app');
    expect(court.options.width).toBe(800);
    expect(court.options.height).toBe(500);
    expect(court.stage).toBeDefined();
    expect(court.bgLayer).toBeDefined();
    expect(court.interactiveLayer).toBeDefined();
  });

  it('deve inicializar todas as ferramentas', () => {
    const court = new CourtCanvas('app');
    expect(court.tools.select).toBeDefined();
    expect(court.tools.playerA).toBeDefined();
    expect(court.tools.playerB).toBeDefined();
    expect(court.currentTool).toBe(court.tools.select);
  });

  it('deve mudar de ferramenta corretamente', () => {
    const court = new CourtCanvas('app');
    const playerTool = court.tools.playerA;
    
    court.setTool(playerTool);
    expect(court.currentTool).toBe(playerTool);
  });

  it('deve disparar eventos de mouse do stage para a ferramenta atual', () => {
    const court = new CourtCanvas('app');
    const toolSpy = { onMouseDown: vi.fn() };
    court.setTool(toolSpy);

    court.stage.fire('mousedown');
    expect(toolSpy.onMouseDown).toHaveBeenCalled();
  });

  it('deve disparar undo no Ctrl+Z', () => {
    const court = new CourtCanvas('app');
    const undoSpy = vi.spyOn(court.stateManager, 'undo');
    
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
    window.dispatchEvent(event);
    
    expect(undoSpy).toHaveBeenCalled();
  });

  it('deve disparar redo no Ctrl+Shift+Z', () => {
    const court = new CourtCanvas('app');
    const redoSpy = vi.spyOn(court.stateManager, 'redo');
    
    const event = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'Z' });
    window.dispatchEvent(event);
    
    expect(redoSpy).toHaveBeenCalled();
  });

  it('deve deletar elemento selecionado no Backspace', () => {
    const court = new CourtCanvas('app');
    const player = new Konva.Circle({ name: 'player' });
    court.interactiveLayer.add(player);
    court.transformer.nodes([player]);
    
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    window.dispatchEvent(event);
    
    expect(player.parent).toBeNull();
  });

  it('deve disparar eventos de touch do stage para a ferramenta atual', () => {
    const court = new CourtCanvas('app');
    const toolSpy = { onMouseDown: vi.fn(), onMouseMove: vi.fn(), onMouseUp: vi.fn() };
    court.setTool(toolSpy);

    court.stage.fire('touchstart');
    expect(toolSpy.onMouseDown).toHaveBeenCalled();

    court.stage.fire('touchmove');
    expect(toolSpy.onMouseMove).toHaveBeenCalled();

    court.stage.fire('touchend');
    expect(toolSpy.onMouseUp).toHaveBeenCalled();
  });

  it('deve restaurar interatividade ao carregar estado e limitar movimento do player', () => {
    const court = new CourtCanvas('app');
    const player = new Konva.Group({ name: 'player' });
    court.interactiveLayer.add(player);
    
    court.restoreInteractivity();
    
    // Testa limites (padding)
    player.position({ x: -100, y: -100 });
    player.fire('dragmove');
    expect(player.x()).toBeGreaterThan(0);
    expect(player.y()).toBeGreaterThan(0);

    player.position({ x: 2000, y: 2000 });
    player.fire('dragmove');
    expect(player.x()).toBeLessThan(2000);
  });

  it('deve restringir o tamanho mínimo do transformer', () => {
    const court = new CourtCanvas('app');
    const boundBoxFunc = court.transformer.boundBoxFunc();
    
    const oldBox = { width: 20, height: 20 };
    const newBoxSmall = { width: 5, height: 5 };
    const newBoxLarge = { width: 50, height: 50 };
    
    expect(boundBoxFunc(oldBox, newBoxSmall)).toBe(oldBox);
    expect(boundBoxFunc(oldBox, newBoxLarge)).toBe(newBoxLarge);
  });
  
  it('deve desenhar o campo (pitch) na inicialização', () => {
    const court = new CourtCanvas('app');
    // Verifica se existem formas na bgLayer (gramado, linhas, etc)
    expect(court.bgLayer.children.length).toBeGreaterThan(5);
  });
});
