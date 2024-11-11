import { EventEmitter } from "./utils";

export const VIEWPORT_EVENTS = {
	RESIZE: "RESIZE",
};

export class Viewport extends EventEmitter {
	constructor(el) {
		super();
		this.el = el;
		const { width, height } = el.getBoundingClientRect();

		this.width = width;
		this.height = height;

		window.addEventListener("resize", this.#resize.bind(this));
	}

	#resize(event) {
		const { width, height } = this.el.getBoundingClientRect();
		this.width = width;
		this.height = height;

		this.trigger(VIEWPORT_EVENTS.RESIZE, { width, height });
	}
}
