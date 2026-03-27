import Konva from 'konva';
import StateManager from './StateManager.js';
import Toolbar from './UI/Toolbar.js';

import SelectTool from './Tools/SelectTool.js';
import PlayerTool from './Tools/PlayerTool.js';
import ArrowTool from './Tools/ArrowTool.js';
import ShapeTool from './Tools/ShapeTool.js';
import StampTool from './Tools/StampTool.js';

import JsonExporter from './Exporters/JsonExporter.js';
import ImageExporter from './Exporters/ImageExporter.js';

export default class CourtCanvas {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      width: options.width || 800,
      height: options.height || 500,
      backgroundColor: options.backgroundColor || '#4caf50',
      lineColor: options.lineColor || '#ffffff',
      initialState: options.initialState || null,
      customTools: options.customTools || [],
      toolbar: options.toolbar !== undefined ? options.toolbar : {
        buttons: ['select', 'player-a', 'player-b', 'arrow', 'rect', 'ellipse', 'undo', 'redo', 'clear', 'export-png', 'export-json', 'import-json', 'help']
      },
      ...options
    };

    this.stateManager = new StateManager(this);
    this.jsonExporter = new JsonExporter(this);
    this.imageExporter = new ImageExporter(this);

    this.initKonva();
    this.initTools();

    // Se houver estado inicial, carrega
    if (this.options.initialState) {
      this.load(this.options.initialState);
    } else {
      // Caso contrário, salva o estado vazio inicial no histórico
      this.stateManager.saveState();
    }

    // Inject native UI toolbar?
    if (this.options.toolbar !== false) {
      this.toolbar = new Toolbar(this, this.options.toolbar);
    }

    this.drawPitch();
  }

  /**
   * Factory para criar um Transformer configurado
   * @returns {Konva.Transformer}
   */
  createTransformer() {
    return new Konva.Transformer({
      nodes: [],
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 10 || newBox.height < 10) { return oldBox; }
        return newBox;
      },
    });
  }

  /**
   * Carrega um estado JSON na camada interativa
   * @param {String|Object} json 
   */
  load(json) {
    this.jsonExporter.import(json);
  }

  initTools() {
    this.tools = {
      select: new SelectTool(this),
      playerA: new PlayerTool(this, { teamColor: '#3498db', textColor: '#ffffff' }),
      playerB: new PlayerTool(this, { teamColor: '#e74c3c', textColor: '#ffffff' }),
      arrow: new ArrowTool(this, '#e74c3c'),
      rect: new ShapeTool(this, 'rect', '#f39c12'),
      ellipse: new ShapeTool(this, 'ellipse', '#f39c12')
    };

    // Registrar ferramentas customizadas
    this.options.customTools.forEach(config => {
      if (config.type === 'stamp') {
        this.tools[config.id] = new StampTool(this, config);
      } else if (config.type === 'player') {
        this.tools[config.id] = new PlayerTool(this, config);
      }
    });

    this.setTool(this.tools.select);
  }

  initKonva() {
    this.stage = new Konva.Stage({
      container: this.containerId,
      width: this.options.width,
      height: this.options.height,
    });

    this.bgLayer = new Konva.Layer();
    this.interactiveLayer = new Konva.Layer();

    // Camada Transformer (para a ferramenta de selecao)
    this.transformer = this.createTransformer();
    this.interactiveLayer.add(this.transformer);

    this.stage.add(this.bgLayer);
    this.stage.add(this.interactiveLayer);

    this.currentTool = null;
    this.bindEvents();
    this.bindKeyboardKeys();
  }

  bindKeyboardKeys() {
    window.addEventListener('keydown', (e) => {
      // Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        this.stateManager.undo();
      }
      // Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        this.stateManager.redo();
      }
      // Deletar item selecionado
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodes = this.transformer.nodes();
        if (selectedNodes.length > 0) {
          selectedNodes.forEach(node => node.destroy());
          this.transformer.nodes([]);
          this.interactiveLayer.batchDraw();
          this.stateManager.saveState();
        }
      }
    });
  }

  bindEvents() {
    this.stage.on('mousedown touchstart', (e) => {
      if (this.currentTool && this.currentTool.onMouseDown) {
        this.currentTool.onMouseDown(e);
      }
    });

    this.stage.on('mousemove touchmove', (e) => {
      if (this.currentTool && this.currentTool.onMouseMove) {
        this.currentTool.onMouseMove(e);
      }
    });

    this.stage.on('mouseup touchend', (e) => {
      if (this.currentTool && this.currentTool.onMouseUp) {
        this.currentTool.onMouseUp(e);
      }
    });
  }

  setTool(tool) {
    if (this.currentTool && this.currentTool.deactivate) {
      this.currentTool.deactivate();
    }

    this.currentTool = tool;

    if (this.currentTool && this.currentTool.activate) {
      this.currentTool.activate();
    }

    if (this.toolbar) {
      this.toolbar.updateActiveButton();
    }
  }

  setDraggableElements(isDraggable) {
    const interactables = this.interactiveLayer.find(node => {
      return node.name() === 'player' || node.name() === 'arrow' || node.name() === 'shape' || node.name() === 'stamp';
    });

    interactables.forEach(node => {
      node.draggable(isDraggable);
    });

    // Se estamos saindo da ferramenta SelectTool, perdemos a seleção do transformer
    if (!isDraggable) {
      this.transformer.nodes([]);
      this.interactiveLayer.batchDraw();
    }
  }

  // Utilizado pelo StateManager.load() para religar callbacks em objetos clonados pelo histórico JSON
  restoreInteractivity() {
    const interactables = this.interactiveLayer.find(node => {
      return node.name() === 'player' || node.name() === 'shape' || node.name() === 'stamp';
    });

    interactables.forEach(node => {
      // Re-hidratação de Imagens
      const imageUrl = node.getAttr('imageUrl');
      if (imageUrl) {
        const imgNode = node.nodeType === 'Group' ? node.findOne('Image') : node;
        if (imgNode && imgNode.className === 'Image') {
          const img = new Image();
          img.onload = () => {
            imgNode.image(img);
            this.interactiveLayer.batchDraw();
          };
          img.src = imageUrl;
        }
      }

      if (node.name() === 'player' || node.name() === 'stamp') {
        node.on('dragmove', () => {
          const radius = node.name() === 'player' ? 15 : (node.width() / 2);
          const limit = 20 + radius;
          let x = node.x(); let y = node.y();
          if (x < limit) x = limit;
          if (x > this.options.width - limit) x = this.options.width - limit;
          if (y < limit) y = limit;
          if (y > this.options.height - limit) y = this.options.height - limit;
          node.position({ x, y });
        });
      }

      // Recolocar o dragend trigger stateManager para peças reativas
      node.on('dragend transformend', () => {
        this.stateManager.saveState();
      });
    });

    const isSelectMode = this.currentTool && this.currentTool === this.tools.select;
    this.setDraggableElements(isSelectMode);
  }

  drawPitch() {
    const { width, height, backgroundColor, lineColor } = this.options;
    const padding = 20;

    // Grass background
    const bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: backgroundColor,
    });
    this.bgLayer.add(bgRect);

    // Outer boundary
    const pitchRect = new Konva.Rect({
      x: padding,
      y: padding,
      width: width - padding * 2,
      height: height - padding * 2,
      stroke: lineColor,
      strokeWidth: 2,
    });
    this.bgLayer.add(pitchRect);

    // Midline
    const midLine = new Konva.Line({
      points: [width / 2, padding, width / 2, height - padding],
      stroke: lineColor,
      strokeWidth: 2,
    });
    this.bgLayer.add(midLine);

    // Center Circle
    const centerCircle = new Konva.Circle({
      x: width / 2,
      y: height / 2,
      radius: (height - padding * 2) * 0.15,
      stroke: lineColor,
      strokeWidth: 2,
    });
    this.bgLayer.add(centerCircle);

    // Center point
    const centerPoint = new Konva.Circle({
      x: width / 2,
      y: height / 2,
      radius: 4,
      fill: lineColor,
    });
    this.bgLayer.add(centerPoint);

    // Penalty Areas (Grandes áreas)
    const penaltyAreaWidth = (width - padding * 2) * 0.18;
    const penaltyAreaHeight = (height - padding * 2) * 0.55;

    const leftPenaltyArea = new Konva.Rect({
      x: padding,
      y: height / 2 - penaltyAreaHeight / 2,
      width: penaltyAreaWidth,
      height: penaltyAreaHeight,
      stroke: lineColor,
      strokeWidth: 2,
    });
    this.bgLayer.add(leftPenaltyArea);

    const rightPenaltyArea = new Konva.Rect({
      x: width - padding - penaltyAreaWidth,
      y: height / 2 - penaltyAreaHeight / 2,
      width: penaltyAreaWidth,
      height: penaltyAreaHeight,
      stroke: lineColor,
      strokeWidth: 2,
    });
    this.bgLayer.add(rightPenaltyArea);

    // Goal Areas (Pequenas áreas)
    const goalAreaWidth = (width - padding * 2) * 0.06;
    const goalAreaHeight = (height - padding * 2) * 0.25;

    const leftGoalArea = new Konva.Rect({
      x: padding,
      y: height / 2 - goalAreaHeight / 2,
      width: goalAreaWidth,
      height: goalAreaHeight,
      stroke: lineColor,
      strokeWidth: 2,
    });
    this.bgLayer.add(leftGoalArea);

    const rightGoalArea = new Konva.Rect({
      x: width - padding - goalAreaWidth,
      y: height / 2 - goalAreaHeight / 2,
      width: goalAreaWidth,
      height: goalAreaHeight,
      stroke: lineColor,
      strokeWidth: 2,
    });
    this.bgLayer.add(rightGoalArea);

    // Draw layers to canvas
    this.bgLayer.draw();
  }
}
