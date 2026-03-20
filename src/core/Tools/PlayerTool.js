import Tool from './Tool.js';
import Konva from 'konva';
import Swal from 'sweetalert2';

export default class PlayerTool extends Tool {
  constructor(courtCanvas, teamColor = '#3498db', textColor = '#ffffff') {
    super(courtCanvas);
    this.teamColor = teamColor;
    this.textColor = textColor;
    this.playerCount = 1;
  }

  activate() {
    this.court.stage.container().style.cursor = 'crosshair';
    this.court.setDraggableElements(false);
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
      id: `player-${Date.now()}`
    });

    const circle = new Konva.Circle({
      radius: 15,
      fill: this.teamColor,
      stroke: '#2c3e50',
      strokeWidth: 2,
      shadowColor: 'black',
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.3,
    });

    const text = new Konva.Text({
      text: this.playerCount.toString(),
      fontSize: 14,
      fontFamily: 'sans-serif',
      fill: this.textColor,
      align: 'center',
      verticalAlign: 'middle',
    });

    // Center text
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);

    group.add(circle);
    group.add(text);

    // Eventos de borda (Bounding Box / Anti-colisão no arremate)
    group.on('dragmove', () => this.constrainToPitch(group, 15));
    
    // Salva o estado ao final do drag
    group.on('dragend', () => this.court.stateManager.saveState());
    
    // Mudar numero no clique-duplo
    group.on('dblclick dbltap', async () => {
      const currentNumber = text.text();
      
      const { value: newNumber } = await Swal.fire({
        title: 'Numeração do Jogador',
        input: 'text',
        inputLabel: 'Digite até 3 caracteres:',
        inputValue: currentNumber,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'Você precisa digitar algo!';
          }
        }
      });
      
      if (newNumber && newNumber.trim() !== '') {
        text.text(newNumber.substring(0, 3)); // Limita o tamanho para caber no circulo
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);
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
    let newX = pos.x;
    let newY = pos.y;

    if (newX < padding + radius) newX = padding + radius;
    if (newX > width - padding - radius) newX = width - padding - radius;
    if (newY < padding + radius) newY = padding + radius;
    if (newY > height - padding - radius) newY = height - padding - radius;

    group.position({ x: newX, y: newY });
  }
}
