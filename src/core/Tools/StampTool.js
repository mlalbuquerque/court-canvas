import Tool from './Tool.js';
import Konva from 'konva';

export default class StampTool extends Tool {
  constructor(courtCanvas, options = {}) {
    super(courtCanvas);
    this.imageUrl = options.imageUrl || '';
    this.textImage = options.image || ''; // Texto ou Emoji
    this.name = options.name || 'stamp';
    this.size = options.size || 30;

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
    // Se não tem imagem carregada e não tem texto definido, não faz nada
    if (!this.imageObj && !this.textImage) return;
    const pos = this.court.stage.getPointerPosition();
    this.createStamp(pos.x, pos.y);
  }

  createStamp(x, y) {
    const half = this.size / 2;
    const { width, height } = this.court.options;
    const padding = 20;

    // Valida posição inicial para não nascer fora do campo
    let finalX = Math.max(padding + half, Math.min(x, width - padding - half));
    let finalY = Math.max(padding + half, Math.min(y, height - padding - half));

    let stamp;

    if (this.imageObj) {
      stamp = new Konva.Image({
        x: finalX,
        y: finalY,
        image: this.imageObj,
        width: this.size,
        height: this.size,
        draggable: true,
        name: 'stamp',
        id: `stamp-${Date.now()}`,
        imageUrl: this.imageUrl 
      });
      stamp.offsetX(half);
      stamp.offsetY(half);
    } else {
      // Se for texto/emoji
      stamp = new Konva.Text({
        x: finalX,
        y: finalY,
        text: this.textImage,
        fontSize: this.size,
        draggable: true,
        name: 'stamp',
        id: `stamp-${Date.now()}`,
        textImage: this.textImage
      });
      stamp.offsetX(stamp.width() / 2);
      stamp.offsetY(stamp.height() / 2);
    }

    stamp.on('dragmove', () => {
      let curX = stamp.x();
      let curY = stamp.y();

      const radius = this.size / 2;
      let validatedX = Math.max(padding + radius, Math.min(curX, width - padding - radius));
      let validatedY = Math.max(padding + radius, Math.min(curY, height - padding - radius));

      stamp.position({ x: validatedX, y: validatedY });
    });

    stamp.on('dragend', () => this.court.stateManager.saveState());

    this.court.interactiveLayer.add(stamp);
    this.court.interactiveLayer.draw();
    this.court.stateManager.saveState();
  }
}

