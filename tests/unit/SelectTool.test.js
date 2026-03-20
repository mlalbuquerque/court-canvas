import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';
import SelectTool from '../../src/core/Tools/SelectTool.js';
import Konva from 'konva';

describe('SelectTool', () => {
  let court;
  let tool;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    court = new CourtCanvas('app');
    tool = new SelectTool(court);
  });

  it('deve ativar permitindo o arrasto de elementos', () => {
    const dragSpy = vi.spyOn(court, 'setDraggableElements');
    tool.activate();
    expect(dragSpy).toHaveBeenCalledWith(true);
    expect(court.stage.container().style.cursor).toBe('default');
  });

  it('deve desativar removendo o arrasto', () => {
    const dragSpy = vi.spyOn(court, 'setDraggableElements');
    tool.deactivate();
    expect(dragSpy).toHaveBeenCalledWith(false);
  });

  it('deve selecionar um elemento clicável no mousedown', () => {
    const player = new Konva.Circle({ name: 'player', draggable: true });
    court.interactiveLayer.add(player);
    
    // Mock do evento com o player como target
    const event = { target: player };
    
    tool.onMouseDown(event);
    
    expect(court.transformer.nodes()).toContain(player);
  });

  it('deve limpar seleção se clicar no fundo (stage) ou bgLayer', () => {
    const player = new Konva.Circle({ name: 'player' });
    court.transformer.nodes([player]);
    
    tool.onMouseDown({ target: court.stage });
    expect(court.transformer.nodes().length).toBe(0);

    court.transformer.nodes([player]);
    tool.onMouseDown({ target: { parent: court.bgLayer } });
    expect(court.transformer.nodes().length).toBe(0);
  });

  it('deve ignorar cliques dentro da própria caixa do Transformer', () => {
    const player = new Konva.Circle({ name: 'player' });
    court.transformer.nodes([player]);
    
    const event = { target: { getParent: () => ({ className: 'Transformer' }) } };
    tool.onMouseDown(event);
    
    expect(court.transformer.nodes()).toContain(player);
  });

  it('deve limpar seleção ao clicar em objeto não selecionável', () => {
    const player = new Konva.Circle({ name: 'player' });
    court.transformer.nodes([player]);
    
    const unknownNode = new Konva.Rect({ name: 'unknown' });
    tool.onMouseDown({ target: unknownNode });
    
    expect(court.transformer.nodes().length).toBe(0);
  });

  it('deve selecionar o ancestral player se clicar em parte dele', () => {
    const playerGroup = new Konva.Group({ name: 'player' });
    playerGroup.addName('player'); // findAncestor usa name
    const circle = new Konva.Circle();
    playerGroup.add(circle);
    court.interactiveLayer.add(playerGroup);

    // Mock findAncestor
    circle.findAncestor = vi.fn().mockReturnValue(playerGroup);
    
    tool.onMouseDown({ target: circle });
    expect(court.transformer.nodes()).toContain(playerGroup);
  });
});
