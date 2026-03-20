import Tool from './Tool.js';
import Konva from 'konva';

export default class ArrowTool extends Tool {
  constructor(courtCanvas, color = '#e74c3c') {
    super(courtCanvas);
    this.color = color;
    this.isDrawing = false;
    this.currentArrow = null;
  }

  activate() {
    this.court.stage.container().style.cursor = 'crosshair';
    this.court.setDraggableElements(false);
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const pos = this.court.stage.getPointerPosition();
    
    this.currentArrow = new Konva.Arrow({
      points: [pos.x, pos.y, pos.x, pos.y],
      pointerLength: 10,
      pointerWidth: 10,
      fill: this.color,
      stroke: this.color,
      strokeWidth: 4,
      dash: [10, 5],
      name: 'arrow',
      id: `arrow-${Date.now()}`,
      draggable: true
    });
    
    this.currentArrow.on('dragend', () => {
      this.court.stateManager.saveState();
    });
    
    this.court.interactiveLayer.add(this.currentArrow);
  }

  onMouseMove(e) {
    if (!this.isDrawing || !this.currentArrow) return;
    
    const pos = this.court.stage.getPointerPosition();
    const points = this.currentArrow.points();
    
    // Atualiza apenas os ultimos dois pontos (destino X e Y)
    points[2] = pos.x;
    points[3] = pos.y;
    
    this.currentArrow.points(points);
    this.court.interactiveLayer.batchDraw();
  }

  onMouseUp(e) {
    this.isDrawing = false;
    
    // Se a seta for muito pequena (um simples clique), removemos
    if (this.currentArrow) {
      const points = this.currentArrow.points();
      const dx = points[2] - points[0];
      const dy = points[3] - points[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 15) {
        this.currentArrow.destroy();
      } else {
        this.court.stateManager.saveState();
      }
      
      this.currentArrow = null;
      this.court.interactiveLayer.batchDraw();
    }
  }
}
