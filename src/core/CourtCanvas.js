import Konva from 'konva';
import StateManager from './StateManager.js';
import Toolbar from './UI/Toolbar.js';

import SelectTool from './Tools/SelectTool.js';
import PlayerTool from './Tools/PlayerTool.js';
import ArrowTool from './Tools/ArrowTool.js';
import ShapeTool from './Tools/ShapeTool.js';

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
      toolbar: options.toolbar !== undefined ? options.toolbar : {
        buttons: ['select', 'player-a', 'player-b', 'arrow', 'rect', 'ellipse', 'undo', 'redo', 'clear', 'export-png', 'export-json', 'help']
      },
      ...options
    };

    this.stateManager = new StateManager(this);
    this.jsonExporter = new JsonExporter(this);
    this.imageExporter = new ImageExporter(this);
    
    this.initKonva();
    this.initTools();
    
    // Inject native UI toolbar?
    if (this.options.toolbar !== false) {
       this.toolbar = new Toolbar(this, this.options.toolbar);
    }
    
    this.drawPitch();
  }

  initTools() {
    this.tools = {
      select: new SelectTool(this),
      playerA: new PlayerTool(this, '#3498db', '#ffffff'),
      playerB: new PlayerTool(this, '#e74c3c', '#ffffff'),
      arrow: new ArrowTool(this, '#e74c3c'),
      rect: new ShapeTool(this, 'rect', '#f39c12'),
      ellipse: new ShapeTool(this, 'ellipse', '#f39c12')
    };
    
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
    this.transformer = new Konva.Transformer({
      nodes: [],
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 10 || newBox.height < 10) { return oldBox; }
        return newBox;
      },
    });
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
  }
  
  setDraggableElements(isDraggable) {
    const interactables = this.interactiveLayer.find(node => {
      return node.name() === 'player' || node.name() === 'arrow' || node.name() === 'shape';
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
    // Buscar nova referencia do transformer criado ao limpar a layer
    const newTransformer = this.interactiveLayer.find('Transformer')[0];
    if (newTransformer) {
      this.transformer = newTransformer;
    }

    const interactables = this.interactiveLayer.find(node => {
      return node.name() === 'player' || node.name() === 'shape';
    });
    
    interactables.forEach(node => {
      if (node.name() === 'player') {
         node.on('dragmove', () => {
             // O PlayerTool já injetava isso, mas agora que carregamos do serializado,
             // o padding eh manual
             const limit = 20 + 15;
             let x = node.x(); let y = node.y();
             if (x < limit) x = limit; 
             if (x > this.options.width - limit) x = this.options.width - limit;
             if (y < limit) y = limit; 
             if (y > this.options.height - limit) y = this.options.height - limit;
             node.position({x, y});
         });
      }
      
      // Recolocar o dragend trigger stateManager para peças reativas
      node.on('dragend transformend', () => {
         this.stateManager.saveState();
      });
    });
    
    const isSelectMode = this.currentTool && this.currentTool.constructor.name === 'SelectTool';
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
