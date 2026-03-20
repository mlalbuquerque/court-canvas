export default class JsonExporter {
  constructor(courtCanvas) {
    this.court = courtCanvas;
  }

  export() {
    // Retorna string JSON representativa da camada interativa
    return this.court.interactiveLayer.toJSON();
  }

  import(jsonString) {
    // Reconstroi utilizando o StateManager já programado
    this.court.stateManager.loadState(jsonString);
    // Persiste no history do Undo/Redo como passo novo
    this.court.stateManager.saveState();
  }
}
