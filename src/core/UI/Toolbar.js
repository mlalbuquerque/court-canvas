import Swal from 'sweetalert2';

export default class Toolbar {
  constructor(courtCanvas, options = {}) {
    this.court = courtCanvas;
    
    // Default options merge
    this.options = {
      visible: true,
      position: 'bottom', // 'top', 'bottom', 'left', 'right'
      buttons: ['select', 'player-a', 'player-b', 'arrow', 'rect', 'ellipse', 'undo', 'redo', 'clear', 'help'],
      style: {
        background: 'rgba(44, 62, 80, 0.9)',
        color: 'white',
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        margin: '10px auto',
        maxWidth: 'fit-content',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      },
      ...options
    };

    if (!this.options.visible) return;

    this.container = document.getElementById(this.court.containerId);
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.className = 'court-canvas-toolbar';
    
    // Apply styling
    Object.assign(this.toolbarElement.style, this.options.style);

    this.buttonElements = {};
    this.createButtons();
    this.injectIntoDOM();
    
    // Inicializar o destaque do botão ativo
    this.updateActiveButton();
  }

  injectIntoDOM() {
    this.container.style.position = 'relative';
    if (this.options.position === 'top') {
      this.container.insertBefore(this.toolbarElement, this.container.firstChild);
    } else {
      this.container.appendChild(this.toolbarElement);
    }
  }

  updateActiveButton() {
    const currentTool = this.court.currentTool;
    if (!currentTool) return;

    Object.entries(this.buttonElements).forEach(([btnKey, element]) => {
      // Verifica se a ferramenta do botão é a mesma que a ferramenta atual da court
      const isActive = this.checkIfButtonIsActive(btnKey, currentTool);
      
      if (isActive) {
        element.style.outline = '2px solid #3498db';
        element.style.boxShadow = '0 0 8px rgba(52, 152, 219, 0.6)';
        element.style.background = '#2c3e50';
      } else {
        element.style.outline = 'none';
        element.style.boxShadow = 'none';
        element.style.background = (this.baseButtonMap[btnKey] && this.baseButtonMap[btnKey].style && this.baseButtonMap[btnKey].style.background) || '#34495e';
      }
    });
  }

  checkIfButtonIsActive(btnKey, currentTool) {
    const config = this.baseButtonMap[btnKey];
    if (!config || !config.getTool) return false;
    
    try {
      const toolInstance = config.getTool();
      return toolInstance === currentTool;
    } catch (e) {
      return false;
    }
  }

  createButtons() {
    this.baseButtonMap = {
      'select':   { icon: '🖐', tooltip: 'Selecionar / Mover', action: () => this.court.setTool(this.court.tools.select), getTool: () => this.court.tools.select },
      'player-a': { icon: '🔵', tooltip: 'Time A', action: () => this.court.setTool(this.court.tools.playerA), hasColor: true, getTool: () => this.court.tools.playerA, colorProp: 'teamColor' },
      'player-b': { icon: '🔴', tooltip: 'Time B', action: () => this.court.setTool(this.court.tools.playerB), hasColor: true, getTool: () => this.court.tools.playerB, colorProp: 'teamColor' },
      'arrow':    { icon: '↗️', tooltip: 'Desenhar Seta', action: () => this.court.setTool(this.court.tools.arrow), hasColor: true, getTool: () => this.court.tools.arrow, colorProp: 'color' },
      'rect':     { icon: '🔲', tooltip: 'Marcar Área (Retângulo)', action: () => this.court.setTool(this.court.tools.rect), hasColor: true, getTool: () => this.court.tools.rect, colorProp: 'color' },
      'ellipse':  { icon: '⭕', tooltip: 'Marcar Círculo (Elipse)', action: () => this.court.setTool(this.court.tools.ellipse), hasColor: true, getTool: () => this.court.tools.ellipse, colorProp: 'color' },
      'undo':     { icon: '↩️', tooltip: 'Desfazer (Ctrl+Z)', action: () => this.court.stateManager.undo() },
      'redo':     { icon: '↪️', tooltip: 'Refazer (Ctrl+Y)', action: () => this.court.stateManager.redo() },
      'clear':    { icon: '🗑', tooltip: 'Limpar Tudo', action: this.clearCanvas.bind(this), style: { background: '#e74c3c' } },
      'help':     { icon: '❓', tooltip: 'Ajuda', action: this.showHelp.bind(this), style: { background: '#f39c12' } },
      'export-png': { icon: '📸', tooltip: 'Baixar Imagem (.png)', action: () => this.court.imageExporter.downloadImage(`tatica_${Date.now()}.png`), style: { background: '#9b59b6' } },
      'export-json': { icon: '📋', tooltip: 'Extrair Payload JSON', action: () => { 
          console.log(this.court.jsonExporter.export()); 
          Swal.fire({ title: 'Tática Pronta!', text: 'JSON gerado no console (F12).', icon: 'success' });
       }, style: { background: '#27ae60' } },
      'import-json': { icon: '📥', tooltip: 'Importar Payload JSON', action: async () => {
          const { value: json } = await Swal.fire({
            title: 'Importar Tática',
            input: 'textarea',
            showCancelButton: true
          });
          if (json) {
            try { this.court.load(json); Swal.fire('Sucesso!', 'Tática carregada.', 'success'); }
            catch (err) { Swal.fire('Erro!', 'JSON inválido.', 'error'); }
          }
      }, style: { background: '#2980b9' } }
    };

    // Adicionar botões para ferramentas customizadas dinamicamente
    this.court.options.customTools.forEach(toolConfig => {
      this.baseButtonMap[toolConfig.id] = {
        icon: toolConfig.icon || '🛠',
        tooltip: toolConfig.label || toolConfig.id,
        action: () => this.court.setTool(this.court.tools[toolConfig.id]),
        // Se for do tipo player sem imagem, permite mudar cor. Se tiver imagem, cor é fixa.
        hasColor: toolConfig.type === 'player' && !toolConfig.imageUrl,
        getTool: () => this.court.tools[toolConfig.id],
        colorProp: 'teamColor'
      };
      
      // Se o usuário não especificou a lista de botões explicitamente, adiciona o novo botão ao final
      if (!this.options.buttons.includes(toolConfig.id)) {
        this.options.buttons.push(toolConfig.id);
      }
    });

    this.options.buttons.forEach(btnKey => {
      const config = this.baseButtonMap[btnKey];
      if (!config) return;

      const container = document.createElement('div');
      this.buttonElements[btnKey] = container;
      Object.assign(container.style, {
        display: 'flex',
        alignItems: 'stretch',
        background: '#34495e',
        borderRadius: '4px',
        transition: 'transform 0.2s',
        ...(config.style || {})
      });
      container.addEventListener('mouseenter', () => container.style.transform = 'scale(1.05)');
      container.addEventListener('mouseleave', () => container.style.transform = 'scale(1)');

      const btn = document.createElement('button');
      btn.innerHTML = config.icon;
      btn.title = config.tooltip;
      Object.assign(btn.style, {
        padding: '8px 12px',
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center'
      });
      btn.addEventListener('click', config.action);
      container.appendChild(btn);

      if (config.hasColor && config.getTool) {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        const toolInstance = config.getTool();
        colorInput.value = toolInstance[config.colorProp];
        Object.assign(colorInput.style, {
          width: '24px',
          border: 'none',
          padding: '0',
          margin: '0',
          cursor: 'pointer',
          background: 'transparent',
          borderLeft: '1px solid rgba(255,255,255,0.2)'
        });
        colorInput.addEventListener('input', (e) => {
          toolInstance[config.colorProp] = e.target.value;
          this.court.setTool(toolInstance); 
        });
        container.appendChild(colorInput);
      }

      this.toolbarElement.appendChild(container);
    });
  }

  clearCanvas() {
    this.court.interactiveLayer.destroyChildren();
    this.court.transformer = new window.Konva.Transformer({ nodes: [] });
    this.court.interactiveLayer.add(this.court.transformer);
    this.court.interactiveLayer.draw();
    Object.values(this.court.tools).forEach(tool => {
      if (tool.playerCount !== undefined) tool.playerCount = 1;
    });
    this.court.stateManager.history = [];
    this.court.stateManager.historyStep = -1;
  }

  showHelp() {
    Swal.fire({
      title: 'Dicas Táticas ⚽',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <b>🖐 Selecionar:</b> Mova peças ou apague-as.<br>
          <b>🔵/🔴 Jogadores:</b> Adiciona o time no campo. Dê duplo-clique para mudar a camisa.<br>
          <b>🛠 Ferramentas Extras:</b> Use cones, bolas e ícones personalizados se configurados.<br>
          <b>Teclado ⌨️:</b> <kbd>DELETE</kbd> apaga o alvo. <kbd>CTRL+Z</kbd> desfaz e <kbd>CTRL+Y</kbd> refaz.
        </div>
      `,
      icon: 'info'
    });
  }
}
