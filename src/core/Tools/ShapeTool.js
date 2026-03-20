import Tool from './Tool.js';
import Konva from 'konva';

export default class ShapeTool extends Tool {
  constructor(courtCanvas, shapeType = 'rect', color = '#f39c12') {
    super(courtCanvas);
    this.shapeType = shapeType; // 'rect' or 'ellipse'
    this.color = color;
    this.isDrawing = false;
    this.currentShape = null;
    this.startPos = { x: 0, y: 0 };
  }

  activate() {
    this.court.stage.container().style.cursor = 'crosshair';
    this.court.setDraggableElements(false);
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const pos = this.court.stage.getPointerPosition();
    this.startPos = pos;
    
    const commonProps = {
      x: pos.x,
      y: pos.y,
      stroke: this.color,
      strokeWidth: 3,
      dash: [5, 5], // pontilhado discreto para delimitar areas
      name: 'shape',
      id: `shape-${Date.now()}`,
      draggable: true
    };

    if (this.shapeType === 'rect') {
      this.currentShape = new Konva.Rect({
        ...commonProps,
        width: 0,
        height: 0,
      });
    } else {
      this.currentShape = new Konva.Ellipse({
        ...commonProps,
        radiusX: 0,
        radiusY: 0,
      });
    }
    
    this.court.interactiveLayer.add(this.currentShape);
  }

  onMouseMove(e) {
    if (!this.isDrawing || !this.currentShape) return;
    
    const pos = this.court.stage.getPointerPosition();
    const currentX = pos.x;
    const currentY = pos.y;
    
    if (this.shapeType === 'rect') {
      this.currentShape.width(currentX - this.startPos.x);
      this.currentShape.height(currentY - this.startPos.y);
    } else {
      // Ellipse
      this.currentShape.radiusX(Math.abs(currentX - this.startPos.x));
      this.currentShape.radiusY(Math.abs(currentY - this.startPos.y));
    }
    
    this.court.interactiveLayer.batchDraw();
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    
    // Evita formas invalidas e invisíveis de 1px
    if (this.currentShape) {
      const type = this.shapeType;
      const w = type === 'rect' ? Math.abs(this.currentShape.width()) : this.currentShape.radiusX();
      const h = type === 'rect' ? Math.abs(this.currentShape.height()) : this.currentShape.radiusY();
      
      if (w < 10 || h < 10) {
        this.currentShape.destroy();
      } else {
        this.court.stateManager.saveState();
      }
      this.currentShape = null;
      this.court.interactiveLayer.batchDraw();
    }
  }
}
