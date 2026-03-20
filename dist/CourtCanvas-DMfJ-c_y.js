import e from "konva";
import t from "sweetalert2";
//#region src/core/StateManager.js
var n = class {
	constructor(e) {
		this.court = e, this.history = [], this.historyStep = -1;
	}
	saveState() {
		this.historyStep < this.history.length - 1 && (this.history = this.history.slice(0, this.historyStep + 1));
		let e = this.court.interactiveLayer.toJSON();
		this.history.push(e), this.historyStep++;
	}
	undo() {
		this.historyStep > 0 ? (this.historyStep--, this.loadState(this.history[this.historyStep])) : this.historyStep === 0 && (this.historyStep--, this.court.interactiveLayer.destroyChildren(), this.court.interactiveLayer.draw());
	}
	redo() {
		this.historyStep < this.history.length - 1 && (this.historyStep++, this.loadState(this.history[this.historyStep]));
	}
	loadState(e) {
		this.court.interactiveLayer.destroyChildren(), window.Konva.Node.create(e).children.forEach((e) => {
			this.court.interactiveLayer.add(e.clone());
		}), this.court.interactiveLayer.draw(), this.court.restoreInteractivity();
	}
}, r = class {
	constructor(e, t = {}) {
		this.court = e, this.options = {
			visible: !0,
			position: "bottom",
			buttons: [
				"select",
				"player-a",
				"player-b",
				"arrow",
				"rect",
				"ellipse",
				"undo",
				"redo",
				"clear",
				"help"
			],
			style: {
				background: "rgba(44, 62, 80, 0.9)",
				color: "white",
				borderRadius: "8px",
				padding: "10px",
				display: "flex",
				gap: "8px",
				justifyContent: "center",
				alignItems: "center",
				flexWrap: "wrap",
				margin: "10px auto",
				maxWidth: "fit-content",
				boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
			},
			...t
		}, this.options.visible && (this.container = document.getElementById(this.court.containerId), this.toolbarElement = document.createElement("div"), this.toolbarElement.className = "court-canvas-toolbar", Object.assign(this.toolbarElement.style, this.options.style), this.createButtons(), this.injectIntoDOM());
	}
	injectIntoDOM() {
		this.container.style.position = "relative", this.options.position === "top" ? this.container.insertBefore(this.toolbarElement, this.container.firstChild) : this.container.appendChild(this.toolbarElement);
	}
	createButtons() {
		let e = {
			select: {
				icon: "🖐",
				tooltip: "Selecionar / Mover",
				action: () => this.court.setTool(this.court.tools.select)
			},
			"player-a": {
				icon: "🔵",
				tooltip: "Time A",
				action: () => this.court.setTool(this.court.tools.playerA),
				hasColor: !0,
				getTool: () => this.court.tools.playerA,
				colorProp: "teamColor"
			},
			"player-b": {
				icon: "🔴",
				tooltip: "Time B",
				action: () => this.court.setTool(this.court.tools.playerB),
				hasColor: !0,
				getTool: () => this.court.tools.playerB,
				colorProp: "teamColor"
			},
			arrow: {
				icon: "↗️",
				tooltip: "Desenhar Seta",
				action: () => this.court.setTool(this.court.tools.arrow),
				hasColor: !0,
				getTool: () => this.court.tools.arrow,
				colorProp: "color"
			},
			rect: {
				icon: "🔲",
				tooltip: "Marcar Área (Retângulo)",
				action: () => this.court.setTool(this.court.tools.rect),
				hasColor: !0,
				getTool: () => this.court.tools.rect,
				colorProp: "color"
			},
			ellipse: {
				icon: "⭕",
				tooltip: "Marcar Círculo (Elipse)",
				action: () => this.court.setTool(this.court.tools.ellipse),
				hasColor: !0,
				getTool: () => this.court.tools.ellipse,
				colorProp: "color"
			},
			undo: {
				icon: "↩️",
				tooltip: "Desfazer (Ctrl+Z)",
				action: () => this.court.stateManager.undo()
			},
			redo: {
				icon: "↪️",
				tooltip: "Refazer (Ctrl+Y)",
				action: () => this.court.stateManager.redo()
			},
			clear: {
				icon: "🗑",
				tooltip: "Limpar Tudo",
				action: this.clearCanvas.bind(this),
				style: { background: "#e74c3c" }
			},
			help: {
				icon: "❓",
				tooltip: "Ajuda",
				action: this.showHelp.bind(this),
				style: { background: "#f39c12" }
			},
			"export-png": {
				icon: "📸",
				tooltip: "Baixar Imagem (.png)",
				action: () => this.court.imageExporter.downloadImage(`tatica_${Date.now()}.png`),
				style: { background: "#9b59b6" }
			},
			"export-json": {
				icon: "📋",
				tooltip: "Extrair Payload JSON",
				action: () => {
					console.log(this.court.jsonExporter.export()), t.fire({
						title: "Tática Pronta!",
						text: "A string JSON do estado atual foi gerada e enviada para o F12 (Console) do seu navegador.",
						icon: "success",
						confirmButtonText: "Entendido"
					});
				},
				style: { background: "#27ae60" }
			}
		};
		this.options.buttons.forEach((t) => {
			let n = e[t];
			if (!n) return;
			let r = document.createElement("div");
			r.style.display = "flex", r.style.alignItems = "stretch", r.style.background = "#34495e", r.style.borderRadius = "4px", r.style.transition = "transform 0.2s", r.addEventListener("mouseenter", () => r.style.transform = "scale(1.05)"), r.addEventListener("mouseleave", () => r.style.transform = "scale(1)"), n.style && Object.assign(r.style, n.style);
			let i = document.createElement("button");
			if (i.innerHTML = n.icon, i.title = n.tooltip, Object.assign(i.style, {
				padding: "8px 12px",
				cursor: "pointer",
				background: "transparent",
				border: "none",
				color: "white",
				fontSize: "16px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center"
			}), i.addEventListener("click", n.action), r.appendChild(i), n.hasColor && n.getTool) {
				let e = document.createElement("input");
				e.type = "color", e.title = `Mudar cor (${n.tooltip})`;
				let t = n.getTool();
				e.value = t[n.colorProp], Object.assign(e.style, {
					width: "24px",
					border: "none",
					padding: "0",
					margin: "0",
					cursor: "pointer",
					background: "transparent",
					borderLeft: "1px solid rgba(255,255,255,0.2)",
					borderTopRightRadius: "4px",
					borderBottomRightRadius: "4px"
				}), e.addEventListener("input", (e) => {
					t[n.colorProp] = e.target.value, this.court.setTool(t);
				}), r.appendChild(e);
			}
			this.toolbarElement.appendChild(r);
		});
	}
	clearCanvas() {
		this.court.interactiveLayer.destroyChildren(), this.court.transformer = new window.Konva.Transformer({ nodes: [] }), this.court.interactiveLayer.add(this.court.transformer), this.court.interactiveLayer.draw(), this.court.tools.playerA && (this.court.tools.playerA.playerCount = 1), this.court.tools.playerB && (this.court.tools.playerB.playerCount = 1), this.court.stateManager.history = [], this.court.stateManager.historyStep = -1;
	}
	showHelp() {
		t.fire({
			title: "Dicas Táticas ⚽",
			html: "\n        <div style=\"text-align: left; font-size: 14px; line-height: 1.6;\">\n          <b>🖐 Selecionar:</b> Mova peças ou apague-as.<br>\n          <b>🔵/🔴 Jogadores:</b> Adiciona o time no campo. O motor segura as peças dentro das 4 linhas! Dê duplo-clique para mudar a camisa.<br>\n          <b>↗️ Setas:</b> Puxe e solte para traçar linhas de passe.<br>\n          <b>🔲/⭕ Formas:</b> Desenhe delimitações de área.<br>\n          <b>Teclado ⌨️:</b> <kbd>DELETE</kbd> ou <kbd>BACKSPACE</kbd> apaga o alvo. <kbd>CTRL+Z</kbd> refaz os passos e <kbd>CTRL+Y</kbd> adianta.\n        </div>\n      ",
			icon: "info",
			confirmButtonText: "Bora!"
		});
	}
}, i = class {
	constructor(e) {
		this.court = e;
	}
	onMouseDown(e) {}
	onMouseMove(e) {}
	onMouseUp(e) {}
	activate() {}
	deactivate() {}
}, a = class extends i {
	activate() {
		this.court.stage.container().style.cursor = "default", this.court.setDraggableElements(!0);
	}
	onMouseDown(e) {
		if (e.target === this.court.stage || e.target.parent === this.court.bgLayer) {
			this.court.transformer.nodes([]), this.court.interactiveLayer.batchDraw();
			return;
		}
		if (e.target.getParent() && e.target.getParent().className === "Transformer") return;
		let t = e.target, n = t.findAncestor(".player");
		if (n && (t = n), ![
			"player",
			"arrow",
			"shape"
		].includes(t.name())) {
			this.court.transformer.nodes([]), this.court.interactiveLayer.batchDraw();
			return;
		}
		this.court.transformer.nodes([t]), this.court.interactiveLayer.batchDraw();
	}
	deactivate() {
		this.court.setDraggableElements(!1);
	}
}, o = class extends i {
	constructor(e, t = "#3498db", n = "#ffffff") {
		super(e), this.teamColor = t, this.textColor = n, this.playerCount = 1;
	}
	activate() {
		this.court.stage.container().style.cursor = "crosshair", this.court.setDraggableElements(!1);
	}
	onMouseDown(e) {
		let t = this.court.stage.getPointerPosition();
		this.createPlayer(t.x, t.y);
	}
	createPlayer(n, r) {
		let i = new e.Group({
			x: n,
			y: r,
			draggable: !0,
			name: "player",
			id: `player-${Date.now()}`
		}), a = new e.Circle({
			radius: 15,
			fill: this.teamColor,
			stroke: "#2c3e50",
			strokeWidth: 2,
			shadowColor: "black",
			shadowBlur: 5,
			shadowOffset: {
				x: 2,
				y: 2
			},
			shadowOpacity: .3
		}), o = new e.Text({
			text: this.playerCount.toString(),
			fontSize: 14,
			fontFamily: "sans-serif",
			fill: this.textColor,
			align: "center",
			verticalAlign: "middle"
		});
		o.offsetX(o.width() / 2), o.offsetY(o.height() / 2), i.add(a), i.add(o), i.on("dragmove", () => this.constrainToPitch(i, 15)), i.on("dragend", () => this.court.stateManager.saveState()), i.on("dblclick dbltap", async () => {
			let e = o.text(), { value: n } = await t.fire({
				title: "Numeração do Jogador",
				input: "text",
				inputLabel: "Digite até 3 caracteres:",
				inputValue: e,
				showCancelButton: !0,
				confirmButtonText: "Salvar",
				cancelButtonText: "Cancelar",
				inputValidator: (e) => {
					if (!e) return "Você precisa digitar algo!";
				}
			});
			n && n.trim() !== "" && (o.text(n.substring(0, 3)), o.offsetX(o.width() / 2), o.offsetY(o.height() / 2), this.court.interactiveLayer.batchDraw(), this.court.stateManager.saveState());
		}), this.court.interactiveLayer.add(i), this.playerCount++, this.court.interactiveLayer.draw(), this.court.stateManager.saveState();
	}
	constrainToPitch(e, t) {
		let { width: n, height: r } = this.court.options, i = e.position(), a = i.x, o = i.y;
		a < 20 + t && (a = 20 + t), a > n - 20 - t && (a = n - 20 - t), o < 20 + t && (o = 20 + t), o > r - 20 - t && (o = r - 20 - t), e.position({
			x: a,
			y: o
		});
	}
}, s = class extends i {
	constructor(e, t = "#e74c3c") {
		super(e), this.color = t, this.isDrawing = !1, this.currentArrow = null;
	}
	activate() {
		this.court.stage.container().style.cursor = "crosshair", this.court.setDraggableElements(!1);
	}
	onMouseDown(t) {
		this.isDrawing = !0;
		let n = this.court.stage.getPointerPosition();
		this.currentArrow = new e.Arrow({
			points: [
				n.x,
				n.y,
				n.x,
				n.y
			],
			pointerLength: 10,
			pointerWidth: 10,
			fill: this.color,
			stroke: this.color,
			strokeWidth: 4,
			dash: [10, 5],
			name: "arrow",
			id: `arrow-${Date.now()}`,
			draggable: !0
		}), this.currentArrow.on("dragend", () => {
			this.court.stateManager.saveState();
		}), this.court.interactiveLayer.add(this.currentArrow);
	}
	onMouseMove(e) {
		if (!this.isDrawing || !this.currentArrow) return;
		let t = this.court.stage.getPointerPosition(), n = this.currentArrow.points();
		n[2] = t.x, n[3] = t.y, this.currentArrow.points(n), this.court.interactiveLayer.batchDraw();
	}
	onMouseUp(e) {
		if (this.isDrawing = !1, this.currentArrow) {
			let e = this.currentArrow.points(), t = e[2] - e[0], n = e[3] - e[1];
			Math.sqrt(t * t + n * n) < 15 ? this.currentArrow.destroy() : this.court.stateManager.saveState(), this.currentArrow = null, this.court.interactiveLayer.batchDraw();
		}
	}
}, c = class extends i {
	constructor(e, t = "rect", n = "#f39c12") {
		super(e), this.shapeType = t, this.color = n, this.isDrawing = !1, this.currentShape = null, this.startPos = {
			x: 0,
			y: 0
		};
	}
	activate() {
		this.court.stage.container().style.cursor = "crosshair", this.court.setDraggableElements(!1);
	}
	onMouseDown(t) {
		this.isDrawing = !0;
		let n = this.court.stage.getPointerPosition();
		this.startPos = n;
		let r = {
			x: n.x,
			y: n.y,
			stroke: this.color,
			strokeWidth: 3,
			dash: [5, 5],
			name: "shape",
			id: `shape-${Date.now()}`,
			draggable: !0
		};
		this.shapeType === "rect" ? this.currentShape = new e.Rect({
			...r,
			width: 0,
			height: 0
		}) : this.currentShape = new e.Ellipse({
			...r,
			radiusX: 0,
			radiusY: 0
		}), this.court.interactiveLayer.add(this.currentShape);
	}
	onMouseMove(e) {
		if (!this.isDrawing || !this.currentShape) return;
		let t = this.court.stage.getPointerPosition(), n = t.x, r = t.y;
		this.shapeType === "rect" ? (this.currentShape.width(n - this.startPos.x), this.currentShape.height(r - this.startPos.y)) : (this.currentShape.radiusX(Math.abs(n - this.startPos.x)), this.currentShape.radiusY(Math.abs(r - this.startPos.y))), this.court.interactiveLayer.batchDraw();
	}
	onMouseUp(e) {
		if (this.isDrawing && (this.isDrawing = !1, this.currentShape)) {
			let e = this.shapeType, t = e === "rect" ? Math.abs(this.currentShape.width()) : this.currentShape.radiusX(), n = e === "rect" ? Math.abs(this.currentShape.height()) : this.currentShape.radiusY();
			t < 10 || n < 10 ? this.currentShape.destroy() : this.court.stateManager.saveState(), this.currentShape = null, this.court.interactiveLayer.batchDraw();
		}
	}
}, l = class {
	constructor(e) {
		this.court = e;
	}
	export() {
		return this.court.interactiveLayer.toJSON();
	}
	import(e) {
		this.court.stateManager.loadState(e), this.court.stateManager.saveState();
	}
}, u = class {
	constructor(e) {
		this.court = e;
	}
	exportBase64(e = 2) {
		let t = this.court.transformer.visible();
		this.court.transformer.hide();
		let n = this.court.stage.toDataURL({
			pixelRatio: e,
			mimeType: "image/png",
			quality: 1
		});
		return t && this.court.transformer.show(), n;
	}
	downloadImage(e = "tatica.png") {
		let t = this.exportBase64(), n = document.createElement("a");
		n.download = e, n.href = t, document.body.appendChild(n), n.click(), document.body.removeChild(n);
	}
}, d = class {
	constructor(e, t = {}) {
		this.containerId = e, this.options = {
			width: t.width || 800,
			height: t.height || 500,
			backgroundColor: t.backgroundColor || "#4caf50",
			lineColor: t.lineColor || "#ffffff",
			toolbar: t.toolbar === void 0 ? { buttons: [
				"select",
				"player-a",
				"player-b",
				"arrow",
				"rect",
				"ellipse",
				"undo",
				"redo",
				"clear",
				"export-png",
				"export-json",
				"help"
			] } : t.toolbar,
			...t
		}, this.stateManager = new n(this), this.jsonExporter = new l(this), this.imageExporter = new u(this), this.initKonva(), this.initTools(), this.options.toolbar !== !1 && (this.toolbar = new r(this, this.options.toolbar)), this.drawPitch();
	}
	initTools() {
		this.tools = {
			select: new a(this),
			playerA: new o(this, "#3498db", "#ffffff"),
			playerB: new o(this, "#e74c3c", "#ffffff"),
			arrow: new s(this, "#e74c3c"),
			rect: new c(this, "rect", "#f39c12"),
			ellipse: new c(this, "ellipse", "#f39c12")
		}, this.setTool(this.tools.select);
	}
	initKonva() {
		this.stage = new e.Stage({
			container: this.containerId,
			width: this.options.width,
			height: this.options.height
		}), this.bgLayer = new e.Layer(), this.interactiveLayer = new e.Layer(), this.transformer = new e.Transformer({
			nodes: [],
			boundBoxFunc: (e, t) => t.width < 10 || t.height < 10 ? e : t
		}), this.interactiveLayer.add(this.transformer), this.stage.add(this.bgLayer), this.stage.add(this.interactiveLayer), this.currentTool = null, this.bindEvents(), this.bindKeyboardKeys();
	}
	bindKeyboardKeys() {
		window.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.key === "z" && (e.preventDefault(), this.stateManager.undo()), (e.ctrlKey && e.key === "y" || e.ctrlKey && e.shiftKey && e.key === "Z") && (e.preventDefault(), this.stateManager.redo()), e.key === "Delete" || e.key === "Backspace") {
				let e = this.transformer.nodes();
				e.length > 0 && (e.forEach((e) => e.destroy()), this.transformer.nodes([]), this.interactiveLayer.batchDraw(), this.stateManager.saveState());
			}
		});
	}
	bindEvents() {
		this.stage.on("mousedown touchstart", (e) => {
			this.currentTool && this.currentTool.onMouseDown && this.currentTool.onMouseDown(e);
		}), this.stage.on("mousemove touchmove", (e) => {
			this.currentTool && this.currentTool.onMouseMove && this.currentTool.onMouseMove(e);
		}), this.stage.on("mouseup touchend", (e) => {
			this.currentTool && this.currentTool.onMouseUp && this.currentTool.onMouseUp(e);
		});
	}
	setTool(e) {
		this.currentTool && this.currentTool.deactivate && this.currentTool.deactivate(), this.currentTool = e, this.currentTool && this.currentTool.activate && this.currentTool.activate();
	}
	setDraggableElements(e) {
		this.interactiveLayer.find((e) => e.name() === "player" || e.name() === "arrow" || e.name() === "shape").forEach((t) => {
			t.draggable(e);
		}), e || (this.transformer.nodes([]), this.interactiveLayer.batchDraw());
	}
	restoreInteractivity() {
		let e = this.interactiveLayer.find("Transformer")[0];
		e && (this.transformer = e), this.interactiveLayer.find((e) => e.name() === "player" || e.name() === "shape").forEach((e) => {
			e.name() === "player" && e.on("dragmove", () => {
				let t = e.x(), n = e.y();
				t < 35 && (t = 35), t > this.options.width - 35 && (t = this.options.width - 35), n < 35 && (n = 35), n > this.options.height - 35 && (n = this.options.height - 35), e.position({
					x: t,
					y: n
				});
			}), e.on("dragend transformend", () => {
				this.stateManager.saveState();
			});
		});
		let t = this.currentTool && this.currentTool.constructor.name === "SelectTool";
		this.setDraggableElements(t);
	}
	drawPitch() {
		let { width: t, height: n, backgroundColor: r, lineColor: i } = this.options, a = new e.Rect({
			x: 0,
			y: 0,
			width: t,
			height: n,
			fill: r
		});
		this.bgLayer.add(a);
		let o = new e.Rect({
			x: 20,
			y: 20,
			width: t - 40,
			height: n - 40,
			stroke: i,
			strokeWidth: 2
		});
		this.bgLayer.add(o);
		let s = new e.Line({
			points: [
				t / 2,
				20,
				t / 2,
				n - 20
			],
			stroke: i,
			strokeWidth: 2
		});
		this.bgLayer.add(s);
		let c = new e.Circle({
			x: t / 2,
			y: n / 2,
			radius: (n - 40) * .15,
			stroke: i,
			strokeWidth: 2
		});
		this.bgLayer.add(c);
		let l = new e.Circle({
			x: t / 2,
			y: n / 2,
			radius: 4,
			fill: i
		});
		this.bgLayer.add(l);
		let u = (t - 40) * .18, d = (n - 40) * .55, f = new e.Rect({
			x: 20,
			y: n / 2 - d / 2,
			width: u,
			height: d,
			stroke: i,
			strokeWidth: 2
		});
		this.bgLayer.add(f);
		let p = new e.Rect({
			x: t - 20 - u,
			y: n / 2 - d / 2,
			width: u,
			height: d,
			stroke: i,
			strokeWidth: 2
		});
		this.bgLayer.add(p);
		let m = (t - 40) * .06, h = (n - 40) * .25, g = new e.Rect({
			x: 20,
			y: n / 2 - h / 2,
			width: m,
			height: h,
			stroke: i,
			strokeWidth: 2
		});
		this.bgLayer.add(g);
		let _ = new e.Rect({
			x: t - 20 - m,
			y: n / 2 - h / 2,
			width: m,
			height: h,
			stroke: i,
			strokeWidth: 2
		});
		this.bgLayer.add(_), this.bgLayer.draw();
	}
};
//#endregion
export { s as a, c as i, u as n, o, l as r, a as s, d as t };
