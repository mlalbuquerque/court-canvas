export default class JsonExporter {
  constructor(courtCanvas) {
    this.court = courtCanvas;
  }

  export() {
    // Extrai a camada para Objeto JS para filtrar o Transformer
    const layerObj = this.court.interactiveLayer.toObject();
    
    if (layerObj.children) {
      layerObj.children = layerObj.children.filter(child => child.className !== 'Transformer');
    }

    // Retorna string JSON limpa e representativa da camada interativa
    return JSON.stringify(layerObj);
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
