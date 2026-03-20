import { describe, it, expect, beforeEach, vi } from 'vitest';
import PlayerTool from '../../src/core/Tools/PlayerTool.js';
import Konva from 'konva';
import Swal from 'sweetalert2';

// Mock do SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe('PlayerTool', () => {
  let courtMock;
  let playerTool;

  beforeEach(() => {
    courtMock = {
      stage: new Konva.Stage({ container: document.createElement('div'), width: 800, height: 500 }),
      interactiveLayer: new Konva.Layer(),
      options: { width: 800, height: 500 },
      setDraggableElements: vi.fn(),
      stateManager: { saveState: vi.fn() },
    };
    courtMock.stage.add(courtMock.interactiveLayer);
    playerTool = new PlayerTool(courtMock, '#3498db', '#ffffff');
  });

  it('deve inicializar com contador de jogadores em 1', () => {
    expect(playerTool.playerCount).toBe(1);
  });

  it('deve criar um jogador ao clicar no stage', () => {
    // Simular clique na posição 100, 100
    vi.spyOn(courtMock.stage, 'getPointerPosition').mockReturnValue({ x: 100, y: 100 });
    
    playerTool.onMouseDown();
    
    const players = courtMock.interactiveLayer.find('.player');
    expect(players).toHaveLength(1);
    expect(players[0].x()).toBe(100);
    expect(players[0].y()).toBe(100);
    expect(courtMock.stateManager.saveState).toHaveBeenCalled();
  });

  it('deve incrementar o contador de jogadores após a criação', () => {
    playerTool.createPlayer(50, 50);
    expect(playerTool.playerCount).toBe(2);
    
    playerTool.createPlayer(60, 60);
    expect(playerTool.playerCount).toBe(3);
  });

  it('deve limitar a posição do jogador às bordas do campo (constrainToPitch)', () => {
    const group = new Konva.Group({ x: -10, y: -10 });
    playerTool.constrainToPitch(group, 15);
    
    // Padding padrão é 20, raio é 15. Logo, min X/Y deve ser 35.
    expect(group.x()).toBe(35);
    expect(group.y()).toBe(35);

    group.position({ x: 1000, y: 1000 });
    playerTool.constrainToPitch(group, 15);
    // Width 800, height 500. Max X = 800 - 20 - 15 = 765. Max Y = 500 - 20 - 15 = 465.
    expect(group.x()).toBe(765);
    expect(group.y()).toBe(465);
  });

  it('deve abrir o prompt de renomeação no clique duplo', async () => {
    Swal.fire.mockResolvedValue({ value: '10' });
    
    playerTool.createPlayer(100, 100);
    const player = courtMock.interactiveLayer.findOne('.player');
    
    await player.fire('dblclick');
    
    expect(Swal.fire).toHaveBeenCalled();
    expect(player.findOne('Text').text()).toBe('10');
  });

  it('deve disparar constrainToPitch no dragmove e saveState no dragend', () => {
    playerTool.createPlayer(100, 100);
    const player = courtMock.interactiveLayer.findOne('.player');
    
    player.position({ x: -10, y: -10 });
    player.fire('dragmove');
    expect(player.x()).toBe(35);

    player.fire('dragend');
    expect(courtMock.stateManager.saveState).toHaveBeenCalled();
  });
});
