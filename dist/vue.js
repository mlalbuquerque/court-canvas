import { n as e, r as t, t as n } from "./CourtCanvas-2F0axRFo.js";
import { createElementBlock as r, onBeforeUnmount as i, onMounted as a, openBlock as o, ref as s } from "vue";
//#region src/vue/CourtCanvasVue.vue
var c = ["id"], l = {
	__name: "CourtCanvasVue",
	props: {
		width: {
			type: Number,
			default: 800
		},
		height: {
			type: Number,
			default: 500
		},
		backgroundColor: {
			type: String,
			default: "#2ecc71"
		},
		lineColor: {
			type: String,
			default: "#ffffff"
		}
	},
	emits: ["ready"],
	setup(l, { emit: u }) {
		let d = l, f = u, p = s(`court-vue-${Math.random().toString(36).substr(2, 9)}`), m = null;
		return a(() => {
			m = new n(p.value, {
				width: d.width,
				height: d.height,
				backgroundColor: d.backgroundColor,
				lineColor: d.lineColor
			}), m.jsonExporter = new t(m), m.imageExporter = new e(m), f("ready", m);
		}), i(() => {
			m && m.stage && m.stage.destroy();
		}), (e, t) => (o(), r("div", {
			id: p.value,
			class: "court-canvas-vue-container",
			tabindex: "0",
			style: { outline: "none" }
		}, null, 8, c));
	}
};
//#endregion
export { l as default };
