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
		}, this.options.visible && (this.container = document.getElementById(this.court.containerId), this.toolbarElement = document.createElement("div"), this.toolbarElement.className = "court-canvas-toolbar", Object.assign(this.toolbarElement.style, this.options.style), this.buttonElements = {}, this.createButtons(), this.injectIntoDOM(), this.updateActiveButton());
	}
	injectIntoDOM() {
		this.container.style.position = "relative", this.options.position === "top" ? this.container.insertBefore(this.toolbarElement, this.container.firstChild) : this.container.appendChild(this.toolbarElement);
	}
	updateActiveButton() {
		let e = this.court.currentTool;
		e && Object.entries(this.buttonElements).forEach(([t, n]) => {
			this.checkIfButtonIsActive(t, e) ? (n.style.outline = "2px solid #3498db", n.style.boxShadow = "0 0 8px rgba(52, 152, 219, 0.6)", n.style.background = "#2c3e50") : (n.style.outline = "none", n.style.boxShadow = "none", n.style.background = this.baseButtonMap[t] && this.baseButtonMap[t].style && this.baseButtonMap[t].style.background || "#34495e");
		});
	}
	checkIfButtonIsActive(e, t) {
		let n = this.baseButtonMap[e];
		if (!n || !n.getTool) return !1;
		try {
			return n.getTool() === t;
		} catch {
			return !1;
		}
	}
	createButtons() {
		this.baseButtonMap = {
			select: {
				icon: "🖐",
				tooltip: "Selecionar / Mover",
				action: () => this.court.setTool(this.court.tools.select),
				getTool: () => this.court.tools.select
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
						text: "JSON gerado no console (F12).",
						icon: "success"
					});
				},
				style: { background: "#27ae60" }
			},
			"import-json": {
				icon: "📥",
				tooltip: "Importar Payload JSON",
				action: async () => {
					let { value: e } = await t.fire({
						title: "Importar Tática",
						input: "textarea",
						showCancelButton: !0
					});
					if (e) try {
						this.court.load(e), t.fire("Sucesso!", "Tática carregada.", "success");
					} catch {
						t.fire("Erro!", "JSON inválido.", "error");
					}
				},
				style: { background: "#2980b9" }
			}
		}, this.court.options.customTools.forEach((e) => {
			this.baseButtonMap[e.id] = {
				icon: e.icon || "🛠",
				tooltip: e.label || e.id,
				action: () => this.court.setTool(this.court.tools[e.id]),
				hasColor: e.type === "player" && !e.imageUrl,
				getTool: () => this.court.tools[e.id],
				colorProp: "teamColor"
			}, this.options.buttons.includes(e.id) || this.options.buttons.push(e.id);
		}), this.options.buttons.forEach((e) => {
			let t = this.baseButtonMap[e];
			if (!t) return;
			let n = document.createElement("div");
			this.buttonElements[e] = n, Object.assign(n.style, {
				display: "flex",
				alignItems: "stretch",
				background: "#34495e",
				borderRadius: "4px",
				transition: "transform 0.2s",
				...t.style || {}
			}), n.addEventListener("mouseenter", () => n.style.transform = "scale(1.05)"), n.addEventListener("mouseleave", () => n.style.transform = "scale(1)");
			let r = document.createElement("button");
			if (r.innerHTML = t.icon, r.title = t.tooltip, Object.assign(r.style, {
				padding: "8px 12px",
				cursor: "pointer",
				background: "transparent",
				border: "none",
				color: "white",
				fontSize: "16px",
				display: "flex",
				alignItems: "center"
			}), r.addEventListener("click", t.action), n.appendChild(r), t.hasColor && t.getTool) {
				let e = document.createElement("input");
				e.type = "color";
				let r = t.getTool();
				e.value = r[t.colorProp], Object.assign(e.style, {
					width: "24px",
					border: "none",
					padding: "0",
					margin: "0",
					cursor: "pointer",
					background: "transparent",
					borderLeft: "1px solid rgba(255,255,255,0.2)"
				}), e.addEventListener("input", (e) => {
					r[t.colorProp] = e.target.value, this.court.setTool(r);
				}), n.appendChild(e);
			}
			this.toolbarElement.appendChild(n);
		});
	}
	clearCanvas() {
		this.court.interactiveLayer.destroyChildren(), this.court.transformer = new window.Konva.Transformer({ nodes: [] }), this.court.interactiveLayer.add(this.court.transformer), this.court.interactiveLayer.draw(), Object.values(this.court.tools).forEach((e) => {
			e.playerCount !== void 0 && (e.playerCount = 1);
		}), this.court.stateManager.history = [], this.court.stateManager.historyStep = -1;
	}
	showHelp() {
		t.fire({
			title: "Dicas Táticas ⚽",
			html: "\n        <div style=\"text-align: left; font-size: 14px; line-height: 1.6;\">\n          <b>🖐 Selecionar:</b> Mova peças ou apague-as.<br>\n          <b>🔵/🔴 Jogadores:</b> Adiciona o time no campo. Dê duplo-clique para mudar a camisa.<br>\n          <b>🛠 Ferramentas Extras:</b> Use cones, bolas e ícones personalizados se configurados.<br>\n          <b>Teclado ⌨️:</b> <kbd>DELETE</kbd> apaga o alvo. <kbd>CTRL+Z</kbd> desfaz e <kbd>CTRL+Y</kbd> refaz.\n        </div>\n      ",
			icon: "info"
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
		this.court.stage.container().style.cursor = "grab", this.court.setDraggableElements(!0);
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
			"shape",
			"stamp"
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
	constructor(e, t = {}) {
		super(e), typeof t == "string" ? (this.teamColor = arguments[1] || "#3498db", this.textColor = arguments[2] || "#ffffff", this.imageUrl = null, this.textImage = null, this.numberPosition = "center") : (this.teamColor = t.teamColor || "#3498db", this.textColor = t.textColor || "#ffffff", this.imageUrl = t.imageUrl || null, this.textImage = t.image || null, this.numberPosition = t.numberPosition || "center"), this.playerCount = 1, this.imageObj = null, this.loadIcon();
	}
	loadIcon() {
		if (!this.imageUrl) return;
		let e = new Image();
		e.onload = () => {
			this.imageObj = e;
		}, e.src = this.imageUrl;
	}
	activate() {
		this.court.stage.container().style.cursor = "cell", this.court.setDraggableElements(!1);
	}
	deactivate() {
		this.court.stage.container().style.cursor = "default";
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
			id: `player-${Date.now()}`,
			imageUrl: this.imageUrl,
			textImage: this.textImage,
			numberPosition: this.numberPosition
		}), a;
		this.imageObj ? a = new e.Image({
			image: this.imageObj,
			width: 30,
			height: 30,
			x: -15,
			y: -15
		}) : this.textImage ? (a = new e.Text({
			text: this.textImage,
			fontSize: 30,
			x: 0,
			y: 0,
			align: "center",
			verticalAlign: "middle"
		}), a.offsetX(a.width() / 2), a.offsetY(a.height() / 2)) : a = new e.Circle({
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
		});
		let o = new e.Text({
			text: this.playerCount.toString(),
			fontSize: this.numberPosition === "center" ? 14 : 10,
			fontFamily: "sans-serif",
			fill: this.textColor,
			align: "center",
			verticalAlign: "middle",
			fontStyle: "bold"
		});
		if (this.numberPosition === "bottom-right") {
			let t = new e.Circle({
				radius: 7,
				fill: this.teamColor,
				stroke: "#ffffff",
				strokeWidth: 1,
				x: 10,
				y: 10
			});
			i.add(t), o.x(10), o.y(10), o.offsetX(o.width() / 2), o.offsetY(o.height() / 2);
		} else this.textImage && this.numberPosition === "center" && o.visible(!1), o.offsetX(o.width() / 2), o.offsetY(o.height() / 2);
		i.add(a), i.add(o), i.on("dragmove", () => this.constrainToPitch(i, 15)), i.on("dragend", () => this.court.stateManager.saveState()), i.on("dblclick dbltap", async () => {
			let { value: e } = await t.fire({
				title: "Numeração do Jogador",
				input: "text",
				inputValue: o.text(),
				showCancelButton: !0,
				inputValidator: (e) => !e && "Você precisa digitar algo!"
			});
			e && (o.text(e.substring(0, 3)), o.offsetX(o.width() / 2), o.offsetY(o.height() / 2), this.textImage && this.numberPosition === "center" && o.visible(!0), this.court.interactiveLayer.batchDraw(), this.court.stateManager.saveState());
		}), this.court.interactiveLayer.add(i), this.playerCount++, this.court.interactiveLayer.draw(), this.court.stateManager.saveState();
	}
	constrainToPitch(e, t) {
		let { width: n, height: r } = this.court.options, i = e.position(), a = Math.max(20 + t, Math.min(i.x, n - 20 - t)), o = Math.max(20 + t, Math.min(i.y, r - 20 - t));
		e.position({
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
}, l = class extends i {
	constructor(e, t = {}) {
		super(e), this.imageUrl = t.imageUrl || "", this.textImage = t.image || "", this.name = t.name || "stamp", this.size = t.size || 30, this.imageObj = null, this.loadIcon();
	}
	loadIcon() {
		if (!this.imageUrl) return;
		let e = new Image();
		e.onload = () => {
			this.imageObj = e;
		}, e.src = this.imageUrl;
	}
	activate() {
		this.court.stage.container().style.cursor = "cell", this.court.setDraggableElements(!1);
	}
	deactivate() {
		this.court.stage.container().style.cursor = "default";
	}
	onMouseDown(e) {
		if (!this.imageObj && !this.textImage) return;
		let t = this.court.stage.getPointerPosition();
		this.createStamp(t.x, t.y);
	}
	createStamp(t, n) {
		let r = this.size / 2, { width: i, height: a } = this.court.options, o = Math.max(20 + r, Math.min(t, i - 20 - r)), s = Math.max(20 + r, Math.min(n, a - 20 - r)), c;
		this.imageObj ? (c = new e.Image({
			x: o,
			y: s,
			image: this.imageObj,
			width: this.size,
			height: this.size,
			draggable: !0,
			name: "stamp",
			id: `stamp-${Date.now()}`,
			imageUrl: this.imageUrl
		}), c.offsetX(r), c.offsetY(r)) : (c = new e.Text({
			x: o,
			y: s,
			text: this.textImage,
			fontSize: this.size,
			draggable: !0,
			name: "stamp",
			id: `stamp-${Date.now()}`,
			textImage: this.textImage
		}), c.offsetX(c.width() / 2), c.offsetY(c.height() / 2)), c.on("dragmove", () => {
			let e = c.x(), t = c.y(), n = this.size / 2, r = Math.max(20 + n, Math.min(e, i - 20 - n)), o = Math.max(20 + n, Math.min(t, a - 20 - n));
			c.position({
				x: r,
				y: o
			});
		}), c.on("dragend", () => this.court.stateManager.saveState()), this.court.interactiveLayer.add(c), this.court.interactiveLayer.draw(), this.court.stateManager.saveState();
	}
}, u = class {
	constructor(e) {
		this.court = e;
	}
	export() {
		return this.court.interactiveLayer.toJSON();
	}
	import(e) {
		let t = typeof e == "string" ? e : JSON.stringify(e);
		this.court.stateManager.loadState(t), this.court.stateManager.saveState();
	}
}, d = class {
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
}, f = class {
	constructor(e, t = {}) {
		this.containerId = e, this.options = {
			width: t.width || 800,
			height: t.height || 500,
			backgroundColor: t.backgroundColor || "#4caf50",
			lineColor: t.lineColor || "#ffffff",
			initialState: t.initialState || null,
			customTools: t.customTools || [],
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
				"import-json",
				"help"
			] } : t.toolbar,
			...t
		}, this.stateManager = new n(this), this.jsonExporter = new u(this), this.imageExporter = new d(this), this.initKonva(), this.initTools(), this.options.initialState ? this.load(this.options.initialState) : this.stateManager.saveState(), this.options.toolbar !== !1 && (this.toolbar = new r(this, this.options.toolbar)), this.drawPitch();
	}
	load(e) {
		this.jsonExporter.import(e);
	}
	initTools() {
		this.tools = {
			select: new a(this),
			playerA: new o(this, {
				teamColor: "#3498db",
				textColor: "#ffffff"
			}),
			playerB: new o(this, {
				teamColor: "#e74c3c",
				textColor: "#ffffff"
			}),
			arrow: new s(this, "#e74c3c"),
			rect: new c(this, "rect", "#f39c12"),
			ellipse: new c(this, "ellipse", "#f39c12")
		}, this.options.customTools.forEach((e) => {
			e.type === "stamp" ? this.tools[e.id] = new l(this, e) : e.type === "player" && (this.tools[e.id] = new o(this, e));
		}), this.setTool(this.tools.select);
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
		this.currentTool && this.currentTool.deactivate && this.currentTool.deactivate(), this.currentTool = e, this.currentTool && this.currentTool.activate && this.currentTool.activate(), this.toolbar && this.toolbar.updateActiveButton();
	}
	setDraggableElements(e) {
		this.interactiveLayer.find((e) => e.name() === "player" || e.name() === "arrow" || e.name() === "shape" || e.name() === "stamp").forEach((t) => {
			t.draggable(e);
		}), e || (this.transformer.nodes([]), this.interactiveLayer.batchDraw());
	}
	restoreInteractivity() {
		let e = this.interactiveLayer.find("Transformer")[0];
		e && (this.transformer = e), this.interactiveLayer.find((e) => e.name() === "player" || e.name() === "shape" || e.name() === "stamp").forEach((e) => {
			let t = e.getAttr("imageUrl");
			if (t) {
				let n = e.nodeType === "Group" ? e.findOne("Image") : e;
				if (n && n.className === "Image") {
					let e = new Image();
					e.onload = () => {
						n.image(e), this.interactiveLayer.batchDraw();
					}, e.src = t;
				}
			}
			(e.name() === "player" || e.name() === "stamp") && e.on("dragmove", () => {
				let t = 20 + (e.name() === "player" ? 15 : e.width() / 2), n = e.x(), r = e.y();
				n < t && (n = t), n > this.options.width - t && (n = this.options.width - t), r < t && (r = t), r > this.options.height - t && (r = this.options.height - t), e.position({
					x: n,
					y: r
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
export { c as a, a as c, l as i, d as n, s as o, u as r, o as s, f as t };
