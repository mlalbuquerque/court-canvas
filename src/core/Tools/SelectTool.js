import Tool from './Tool.js';

export default class SelectTool extends Tool {
  activate() {
    this.court.stage.container().style.cursor = 'default';
    this.court.setDraggableElements(true);
  }

  onMouseDown(e) {
    // Se clicar no palco vazio ou na grama (background), descelecionamos
    if (e.target === this.court.stage || e.target.parent === this.court.bgLayer) {
      this.court.transformer.nodes([]);
      this.court.interactiveLayer.batchDraw();
      return;
    }

    // Nao seleciona a propria caixa do transformer
    if (e.target.getParent() && e.target.getParent().className === 'Transformer') {
      return;
    }

    let node = e.target;
    
    // Se clicou dentro de um grupo "player" (o circulo ou o numero), resgatamos o grupo pai
    const playerAncestor = node.findAncestor('.player');
    if (playerAncestor) {
      node = playerAncestor;
    }

    // Ignora se não possui o identificador correto
    if (!['player', 'arrow', 'shape'].includes(node.name())) {
      this.court.transformer.nodes([]);
      this.court.interactiveLayer.batchDraw();
      return;
    }

    this.court.transformer.nodes([node]);
    this.court.interactiveLayer.batchDraw();
  }

  deactivate() {
    this.court.setDraggableElements(false);
  }
}
