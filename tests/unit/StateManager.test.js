import { describe, it, expect, beforeEach, vi } from 'vitest';
import StateManager from '../../src/core/StateManager.js';
import Konva from 'konva';

describe('StateManager', () => {
  let courtMock;
  let stateManager;

  beforeEach(() => {
    // Mock simples do CourtCanvas
    courtMock = {
      interactiveLayer: new Konva.Layer(),
      restoreInteractivity: vi.fn(),
    };
    stateManager = new StateManager(courtMock);
  });

  it('deve inicializar com histórico vazio', () => {
    expect(stateManager.history).toHaveLength(0);
    expect(stateManager.historyStep).toBe(-1);
  });

  it('deve salvar o estado corretamente', () => {
    stateManager.saveState();
    expect(stateManager.history).toHaveLength(1);
    expect(stateManager.historyStep).toBe(0);
  });

  it('deve executar undo corretamente', () => {
    stateManager.saveState(); // step 0
    stateManager.saveState(); // step 1
    
    stateManager.undo();
    expect(stateManager.historyStep).toBe(0);
    expect(courtMock.restoreInteractivity).toHaveBeenCalled();
  });

  it('deve limpar a layer ao dar undo no primeiro passo', () => {
    const destroySpy = vi.spyOn(courtMock.interactiveLayer, 'destroyChildren');
    stateManager.saveState(); // step 0
    stateManager.undo();
    
    expect(stateManager.historyStep).toBe(-1);
    expect(destroySpy).toHaveBeenCalled();
  });

  it('deve executar redo corretamente', () => {
    stateManager.saveState(); // step 0
    stateManager.undo();
    stateManager.redo();
    
    expect(stateManager.historyStep).toBe(0);
    expect(courtMock.restoreInteractivity).toHaveBeenCalled();
  });

  it('deve truncar o histórico se salvar após um undo', () => {
    stateManager.saveState(); // 0
    stateManager.saveState(); // 1
    stateManager.saveState(); // 2
    
    stateManager.undo(); // step 1
    stateManager.saveState(); // novo step 2, remove o antigo 2
    
    expect(stateManager.history).toHaveLength(3);
    expect(stateManager.historyStep).toBe(2);
  });
});
