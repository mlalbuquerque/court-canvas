import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';
import Toolbar from '../../src/core/UI/Toolbar.js';

describe('Toolbar', () => {
  let court;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    court = new CourtCanvas('app');
  });

  it('deve renderizar os botões configurados', () => {
    const toolbarElement = document.querySelector('.court-canvas-toolbar');
    expect(toolbarElement).toBeDefined();
    expect(toolbarElement.querySelectorAll('button').length).toBeGreaterThan(5);
  });

  it('deve ignorar botões não configurados nas opções', () => {
    const customCourt = new CourtCanvas('app', { toolbar: { buttons: ['select', 'non-existent'] } });
    const toolbar = document.querySelector('.court-canvas-toolbar');
    expect(toolbar.querySelectorAll('button').length).toBe(1);
  });

  it('deve permitir posicionamento no topo', () => {
    const topCourt = new CourtCanvas('app', { toolbar: { position: 'top' } });
    const toolbar = document.querySelector('.court-canvas-toolbar');
    expect(topCourt.stage.container().firstChild).toBe(toolbar);
  });

  it('deve disparar animação de escala no hover dos botões', () => {
    const btnContainer = document.querySelector('.court-canvas-toolbar div');
    
    // Simula mouseenter
    const mouseEnterEvent = new MouseEvent('mouseenter');
    btnContainer.dispatchEvent(mouseEnterEvent);
    expect(btnContainer.style.transform).toBe('scale(1.05)');

    // Simula mouseleave
    const mouseLeaveEvent = new MouseEvent('mouseleave');
    btnContainer.dispatchEvent(mouseLeaveEvent);
    expect(btnContainer.style.transform).toBe('scale(1)');
  });

  it('deve mudar de ferramenta ao clicar no botão', () => {
    // Busca o botão pelo título (tooltip) configurado no Toolbar.js
    const btnRect = document.querySelector('[title="Marcar Área (Retângulo)"]');
    btnRect.click();
    
    expect(court.currentTool).toBe(court.tools.rect);
  });

  it('deve chamar undo ao clicar no botão undo', () => {
    const undoSpy = vi.spyOn(court.stateManager, 'undo');
    const btnUndo = document.querySelector('[title="Desfazer (Ctrl+Z)"]');
    btnUndo.click();
    expect(undoSpy).toHaveBeenCalled();
  });

  it('deve chamar exportação de imagem ao clicar no botão export-png', () => {
    const exportSpy = vi.spyOn(court.imageExporter, 'downloadImage').mockImplementation(() => {});
    const btnExport = document.querySelector('[title="Baixar Imagem (.png)"]');
    btnExport.click();
    expect(exportSpy).toHaveBeenCalled();
  });

  it('deve limpar o canvas ao clicar no botão clear', () => {
    const btnClear = document.querySelector('[title="Limpar Tudo"]');
    const destroySpy = vi.spyOn(court.interactiveLayer, 'destroyChildren');
    
    btnClear.click();
    
    expect(destroySpy).toHaveBeenCalled();
    expect(court.stateManager.history.length).toBe(0);
  });

  it('deve mudar a cor da ferramenta ao interagir com o color input', () => {
    const colorInput = document.querySelector('input[type="color"]');
    colorInput.value = '#000000';
    colorInput.dispatchEvent(new Event('input'));
    
    expect(court.tools.playerA.teamColor).toBe('#000000');
    expect(court.currentTool).toBe(court.tools.playerA);
  });

  it('deve exibir o modal de ajuda', () => {
    const btnHelp = document.querySelector('[title="Ajuda"]');
    court.toolbar.showHelp();
    expect(document.body.innerHTML).toContain('Dicas Táticas');
  });
});
