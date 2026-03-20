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

    this.createButtons();
    this.injectIntoDOM();
  }

  injectIntoDOM() {
    // If setting position relative to container
    this.container.style.position = 'relative';
    
    // Simplest way is to append it after or inside the container depending on position
    if (this.options.position === 'top') {
      this.container.insertBefore(this.toolbarElement, this.container.firstChild);
    } else {
      this.container.appendChild(this.toolbarElement);
    }
  }

  createButtons() {
    const buttonMap = {
      'select':   { icon: '🖐', tooltip: 'Selecionar / Mover', action: () => this.court.setTool(this.court.tools.select) },
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
          Swal.fire({
            title: 'Tática Pronta!',
            text: 'A string JSON do estado atual foi gerada e enviada para o F12 (Console) do seu navegador.',
            icon: 'success',
            confirmButtonText: 'Entendido'
          });
       }, style: { background: '#27ae60' } }
    };

    this.options.buttons.forEach(btnKey => {
      const config = buttonMap[btnKey];
      if (!config) return;

      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'stretch';
      container.style.background = '#34495e';
      container.style.borderRadius = '4px';
      container.style.transition = 'transform 0.2s';
      container.addEventListener('mouseenter', () => container.style.transform = 'scale(1.05)');
      container.addEventListener('mouseleave', () => container.style.transform = 'scale(1)');

      if (config.style) {
        Object.assign(container.style, config.style);
      }

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
        alignItems: 'center',
        justifyContent: 'center'
      });
      btn.addEventListener('click', config.action);
      container.appendChild(btn);

      // Adicionar color picker se a ferramenta possuir suporte
      if (config.hasColor && config.getTool) {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.title = `Mudar cor (${config.tooltip})`;
        
        // Pega a cor inicial diretamente da instância nativa da ferramenta
        const toolInstance = config.getTool();
        colorInput.value = toolInstance[config.colorProp];
        
        Object.assign(colorInput.style, {
          width: '24px',
          border: 'none',
          padding: '0',
          margin: '0',
          cursor: 'pointer',
          background: 'transparent',
          borderLeft: '1px solid rgba(255,255,255,0.2)',
          borderTopRightRadius: '4px',
          borderBottomRightRadius: '4px'
        });

        // Quando o usuário escolhe a cor, atualiza dinamicamente a propriedade da ferramenta
        colorInput.addEventListener('input', (e) => {
          toolInstance[config.colorProp] = e.target.value;
          // Automagicamente troca para a ferramenta se o usuario modificou a cor dela
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
    
    // Reset player incremental counts
    if (this.court.tools.playerA) this.court.tools.playerA.playerCount = 1;
    if (this.court.tools.playerB) this.court.tools.playerB.playerCount = 1;
    
    // Clear History
    this.court.stateManager.history = [];
    this.court.stateManager.historyStep = -1;
  }

  showHelp() {
    Swal.fire({
      title: 'Dicas Táticas ⚽',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <b>🖐 Selecionar:</b> Mova peças ou apague-as.<br>
          <b>🔵/🔴 Jogadores:</b> Adiciona o time no campo. O motor segura as peças dentro das 4 linhas! Dê duplo-clique para mudar a camisa.<br>
          <b>↗️ Setas:</b> Puxe e solte para traçar linhas de passe.<br>
          <b>🔲/⭕ Formas:</b> Desenhe delimitações de área.<br>
          <b>Teclado ⌨️:</b> <kbd>DELETE</kbd> ou <kbd>BACKSPACE</kbd> apaga o alvo. <kbd>CTRL+Z</kbd> refaz os passos e <kbd>CTRL+Y</kbd> adianta.
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Bora!'
    });
  }
}
