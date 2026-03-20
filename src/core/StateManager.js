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
    
    const json = this.court.interactiveLayer.toJSON();
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
    
    // Clone all children to interactiveLayer
    tempLayer.children.forEach((child) => {
      this.court.interactiveLayer.add(child.clone());
    });
    
    this.court.interactiveLayer.draw();
    
    // Restore events and interactivity for the loaded children
    this.court.restoreInteractivity();
  }
}
