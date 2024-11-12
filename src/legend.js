import { EventEmitter } from "./utils";

const LEGEND_ID = "legend";
const CLOSE_BTN_ID = "file_close";

export const LEGEND_EVENTS = {
	FILE_CLOSED: "FILE_CLOSED",
};

export class Legend extends EventEmitter {
	#legendEl = null;

	constructor() {
		super();

		this.#legendEl = this.#getLegendEl();
		const btn = document.getElementById(CLOSE_BTN_ID);

		if (!btn) {
			throw new Error("Missing Close button!");
		}

		btn.addEventListener("click", () => {
			this.trigger(LEGEND_EVENTS.FILE_CLOSED);
		});
	}

	update(options) {
		const titleEl = this.#legendEl.querySelector("h1");

		if (!titleEl) {
			throw new Error("Missing title element!");
		}

		const titleContent = options.name ?? "Wheel";

		titleEl.textContent = titleContent;
		titleEl.title = titleContent;
		document.title = titleContent;
	}

	#getLegendEl() {
		const legend = document.getElementById(LEGEND_ID);

		if (!legend) {
			throw new Error("Missing Legend element!");
		}

		return legend;
	}
}
