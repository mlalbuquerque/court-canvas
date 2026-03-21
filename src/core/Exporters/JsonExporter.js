export default class JsonExporter {
  constructor(courtCanvas) {
    this.court = courtCanvas;
  }

  export() {
    // Retorna string JSON representativa da camada interativa
    return this.court.interactiveLayer.toJSON();
  }

  import(json) {
    // Se for string, tenta fazer parse para validar, se for objeto, usa direto
    const payload = typeof json === 'string' ? json : JSON.stringify(json);
    
    // Reconstroi utilizando o StateManager já programado
    this.court.stateManager.loadState(payload);
    
    // Persiste no history do Undo/Redo como passo novo
    this.court.stateManager.saveState();
  }
}
