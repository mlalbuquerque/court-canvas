export default class StateManager {
  constructor(courtCanvas) {
    this.court = courtCanvas;
    this.history = [];
    this.historyStep = -1;
  }

  saveState() {
    // Delete any future history if we were in undo state and did a new action
    if (this.historyStep < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyStep + 1);
    }
    
    // Converte a camada para objeto literal para filtrar o Transformer
    const layerObj = this.court.interactiveLayer.toObject();
    if (layerObj.children) {
      layerObj.children = layerObj.children.filter(child => child.className !== 'Transformer');
    }
    
    const json = JSON.stringify(layerObj);
    this.history.push(json);
    this.historyStep++;
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.loadState(this.history[this.historyStep]);
    } else if (this.historyStep === 0) {
      this.historyStep--;
      this.court.interactiveLayer.destroyChildren();
      
      // Reinstancia um transformer vivo
      this.court.transformer = this.court.createTransformer();
      this.court.interactiveLayer.add(this.court.transformer);
      
      this.court.interactiveLayer.draw();
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.loadState(this.history[this.historyStep]);
    }
  }

  loadState(json) {
    this.court.interactiveLayer.destroyChildren(); // Clear current
    
    // Konva.Node.create creates a new Layer from JSON, but we just want its children
    const tempLayer = window.Konva.Node.create(json);
    
    // Array.from é necessário pois ao transferir nós a Collection original perde o Node.
    const childrenToMove = Array.from(tempLayer.children || []);
    childrenToMove.forEach((child) => {
      if (child.className !== 'Transformer') {
        child.moveTo(this.court.interactiveLayer);
      }
    });
    tempLayer.destroy();
    
    // Reinstancia um transformer vivo ANTES do draw
    this.court.transformer = this.court.createTransformer();
    this.court.interactiveLayer.add(this.court.transformer);
    
    this.court.interactiveLayer.draw();
    
    // Restore events and interactivity for the loaded children
    this.court.restoreInteractivity();
  }
}
