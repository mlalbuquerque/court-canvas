import Tool from './Tool.js';
import Konva from 'konva';
import Swal from 'sweetalert2';

export default class PlayerTool extends Tool {
  constructor(courtCanvas, options = {}) {
    super(courtCanvas);
    
    // Suporte para inicialização legada (teamColor, textColor) ou novo objeto options
    if (typeof options === 'string') {
      this.teamColor = arguments[1] || '#3498db';
      this.textColor = arguments[2] || '#ffffff';
      this.imageUrl = null;
      this.textImage = null;
      this.numberPosition = 'center';
    } else {
      this.teamColor = options.teamColor || '#3498db';
      this.textColor = options.textColor || '#ffffff';
      this.imageUrl = options.imageUrl || null;
      this.textImage = options.image || null; // Texto ou Emoji
      this.numberPosition = options.numberPosition || 'center'; // 'center' ou 'bottom-right'
    }

    this.playerCount = 1;
    this.imageObj = null;
    this.loadIcon();
  }

  loadIcon() {
    if (!this.imageUrl) return;
    const img = new Image();
    img.onload = () => {
      this.imageObj = img;
    };
    img.src = this.imageUrl;
  }

  activate() {
    this.court.stage.container().style.cursor = 'cell';
    this.court.setDraggableElements(false);
  }

  deactivate() {
    this.court.stage.container().style.cursor = 'default';
  }

  onMouseDown(e) {
    const pos = this.court.stage.getPointerPosition();
    this.createPlayer(pos.x, pos.y);
  }

  createPlayer(x, y) {
    const group = new Konva.Group({
      x,
      y,
      draggable: true,
      name: 'player',
      id: `player-${Date.now()}`,
      // Salva metadados para re-hidratação de imagem no JSON
      imageUrl: this.imageUrl,
      textImage: this.textImage,
      numberPosition: this.numberPosition
    });

    let baseElement;
    const radius = 15;

    if (this.imageObj) {
      baseElement = new Konva.Image({
        image: this.imageObj,
        width: radius * 2,
        height: radius * 2,
        x: -radius,
        y: -radius
      });
    } else if (this.textImage) {
      baseElement = new Konva.Text({
        text: this.textImage,
        fontSize: radius * 2,
        x: 0,
        y: 0,
        align: 'center',
        verticalAlign: 'middle'
      });
      baseElement.offsetX(baseElement.width() / 2);
      baseElement.offsetY(baseElement.height() / 2);
    } else {
      baseElement = new Konva.Circle({
        radius: radius,
        fill: this.teamColor,
        stroke: '#2c3e50',
        strokeWidth: 2,
        shadowColor: 'black',
        shadowBlur: 5,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.3,
      });
    }

    const text = new Konva.Text({
      text: this.playerCount.toString(),
      fontSize: this.numberPosition === 'center' ? 14 : 10,
      fontFamily: 'sans-serif',
      fill: this.textColor,
      align: 'center',
      verticalAlign: 'middle',
      fontStyle: 'bold'
    });

    // Ajuste de posição do texto
    if (this.numberPosition === 'bottom-right') {
      const bgCircle = new Konva.Circle({
        radius: 7,
        fill: this.teamColor,
        stroke: '#ffffff',
        strokeWidth: 1,
        x: 10,
        y: 10
      });
      group.add(bgCircle);
      
      text.x(10);
      text.y(10);
      text.offsetX(text.width() / 2);
      text.offsetY(text.height() / 2);
    } else {
      // Se for avatar de texto, talvez queira esconder o número se for center
      if (this.textImage && this.numberPosition === 'center') {
        text.visible(false);
      }
      text.offsetX(text.width() / 2);
      text.offsetY(text.height() / 2);
    }

    group.add(baseElement);
    group.add(text);

    group.on('dragmove', () => this.constrainToPitch(group, radius));
    group.on('dragend', () => this.court.stateManager.saveState());
    
    group.on('dblclick dbltap', async () => {
      const { value: newNumber } = await Swal.fire({
        title: 'Numeração do Jogador',
        input: 'text',
        inputValue: text.text(),
        showCancelButton: true,
        inputValidator: (value) => !value && 'Você precisa digitar algo!'
      });
      
      if (newNumber) {
        text.text(newNumber.substring(0, 3));
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);
        if (this.textImage && this.numberPosition === 'center') {
           text.visible(true); // Se editou, mostra o número
        }
        this.court.interactiveLayer.batchDraw();
        this.court.stateManager.saveState();
      }
    });
    
    this.court.interactiveLayer.add(group);
    this.playerCount++;
    this.court.interactiveLayer.draw();
    this.court.stateManager.saveState();
  }

  constrainToPitch(group, radius) {
    const { width, height } = this.court.options;
    const padding = 20;
    let pos = group.position();
    let newX = Math.max(padding + radius, Math.min(pos.x, width - padding - radius));
    let newY = Math.max(padding + radius, Math.min(pos.y, height - padding - radius));
    group.position({ x: newX, y: newY });
  }
}
