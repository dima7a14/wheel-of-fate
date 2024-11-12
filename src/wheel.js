import * as PIXI from "pixi.js";

import { degreesToRadians, invertColor, randomBetween } from "./utils";
import { Viewport, VIEWPORT_EVENTS } from "./viewport";

export async function createWheel(el, initChoices) {
	const viewport = new Viewport(el);
	const width = viewport.width;
	const height = viewport.height;

	console.log("Initializing Wheel", {
		el,
		width,
		height,
	});

	const app = new PIXI.Application();
	globalThis.__PIXI_APP__ = app;
	await app.init({
		resizeTo: el,
		antialias: true,
		autoDensity: true,
		resolution: window.devicePixelRatio || 1,
	});

	app.stage.eventMode = "static";
	app.stage.hitArea = app.screen;

	const wheel = new Wheel({ width, height });

	initChoices.forEach((choice) => {
		wheel.addChoice(choice);
	});

	app.stage.addChild(wheel.container);

	let angle = 0;
	let currentAngle = 0;
	const MIN_SPEED = 1;

	function spin() {
		angle = angle + randomBetween(720, 36000);
	}

	el.appendChild(app.canvas);

	app.ticker.add(() => {
		if (currentAngle < angle) {
			const speed = Math.max((angle - currentAngle) / 100, MIN_SPEED);
			currentAngle = Math.min(angle, currentAngle + speed);
			wheel.rotate(speed);
		}
		wheel.render();
	});

	app.stage.on("click", () => {
		spin();
	});

	const addChoice = (choice) => {
		wheel.addChoice(choice);
	};

	const addChoices = (choices) => {
		choices.forEach(addChoice);
	};

	const removeChoice = (choice) => {
		wheel.removeChoice(choice);
	};

	const removeChoices = () => {
		wheel.removeChoices();
	};

	viewport.on(VIEWPORT_EVENTS.RESIZE, ({ width, height }) => {
		wheel.width = width;
		wheel.height = height;
		wheel.forceRender();
	});

	return {
		addChoice,
		addChoices,
		removeChoice,
		removeChoices,
	};
}

class Wheel {
	#shouldRender = true;
	#rotation = 0;

	constructor({ width, height }) {
		this.width = width;
		this.height = height;
		this.container = new PIXI.Container();
		this.choices = [];
	}

	get radius() {
		return (Math.min(this.width, this.height) * 0.9) / 2;
	}

	get delta() {
		return degreesToRadians(360 / this.choices.length);
	}

	get center() {
		return { x: this.width / 2, y: this.height / 2 };
	}

	rotate(delta) {
		const rotation = this.#rotation + degreesToRadians(delta);
		this.#rotation = rotation;
		this.#shouldRender = true;
	}

	addChoice(choice) {
		const choiceComponent = new Choice(choice);

		this.choices.push(choiceComponent);
		this.container.addChild(choiceComponent.container);
		this.#shouldRender = true;
	}

	removeChoice(choice) {
		const index = this.choices.findIndex((c) => c.id === choice.id);

		if (index === -1) {
			return;
		}

		const [choiceToRemove] = this.choices.splice(index, 1);

		choiceToRemove.destroy();
		this.#shouldRender = true;
	}

	removeChoices() {
		for (let i = 0; i < this.choices.length; i++) {
			const choice = this.choices[i];

			choice.destroy();
		}

		this.choices = [];
		this.#shouldRender = true;
	}

	forceRender() {
		this.#shouldRender = true;
	}

	render() {
		if (!this.#shouldRender) {
			return;
		}

		this.choices.forEach((choice, index) => {
			const { x, y } = this.center;
			const startAngle = this.#rotation + index * this.delta;
			const endAngle = this.#rotation + (index + 1) * this.delta;

			choice.render({
				x,
				y,
				startAngle,
				endAngle,
				color: choice.color,
				radius: this.radius,
			});
		});

		this.#shouldRender = false;
	}
}

class Choice {
	constructor(choice) {
		this.id = choice.id;
		this.name = choice.name;
		this.color = choice.color;

		this.container = new PIXI.Container();
		this.graphics = new PIXI.Graphics();
		this.label = new Label(this.name, this.color);
		this.container.addChild(this.graphics);
		this.container.addChild(this.label.container);

		this.container.zIndex = 2;
	}

	#renderGraphics({ x, y, radius, startAngle, endAngle, color }) {
		this.graphics
			.clear()
			.moveTo(x, y)
			.arc(x, y, radius, startAngle, endAngle)
			.fill(color);
	}

	render({ x, y, radius, startAngle, endAngle, color }) {
		this.#renderGraphics({ x, y, radius, startAngle, endAngle, color });
		this.label.render({ x, y, startAngle, endAngle, radius });
	}

	destroy() {
		this.label.destroy();
		this.graphics.destroy();
		this.container.destroy();
	}
}

const FONT_SIZE_SCALE = 40;

class Label {
	constructor(name, bgColor) {
		this.name = name;
		const minDim = Math.min(window.innerWidth, window.innerHeight);
		this.fontSize = minDim / FONT_SIZE_SCALE;
		this.container = new PIXI.Container();
		const style = new PIXI.TextStyle({
			fontFamily: "Arial",
			fontSize: this.fontSize,
			fontWeight: 700,
			fill: invertColor(bgColor),
			// dropShadow: {
			// 	alpha: 1,
			// 	angle: 0,
			// 	blur: 3,
			// 	color: 0x000000,
			// 	distance: 0,
			// },
		});
		this.text = new PIXI.Text({ text: name, style });
		this.container.addChild(this.text);
	}

	render({ x, y, startAngle, endAngle, radius }) {
		const angle = (startAngle + endAngle) / 2;
		this.container.updateTransform({
			x,
			y,
			rotation: angle,
			pivotX: -radius * 0.15,
			pivotY: this.fontSize / 2,
		});
	}

	destroy() {
		this.text.destroy();
		this.container.destroy();
	}
}
