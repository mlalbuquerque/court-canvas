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
    // Pré-Conversão para impedir veneno de bases antigas!
    let parsedJson = typeof json === 'string' ? JSON.parse(json) : json;
    
    // Purificar (Sanitizar) payload antes do parser fatal do Konva
    if (parsedJson.children) {
      parsedJson.children = parsedJson.children.filter(child => child.className !== 'Transformer');
    }
    
    // Konva agora cria os Nodes seguros em temp. (Passamos o Obj Sanitizado)
    const tempLayer = window.Konva.Node.create(parsedJson);
    // Clone all children to interactiveLayer
    tempLayer.children.forEach((child) => {
        this.court.interactiveLayer.add(child.clone());
    });
    // Injeta o Transformer nativo limpo na layer reidratada
    this.court.transformer = this.court.createTransformer();
    this.court.interactiveLayer.add(this.court.transformer);
    
    this.court.interactiveLayer.draw();
    
    // Restore events and interactivity for the loaded children
    this.court.restoreInteractivity();
  }
}
