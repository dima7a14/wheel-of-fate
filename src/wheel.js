import * as PIXI from "pixi.js";

import { degreesToRadians, randomBetween } from "./utils";

const colors = [
	"red",
	"blue",
	"green",
	"pink",
	"brown",
	"yellow",
	"violet",
	"orange",
];

export async function initWheel(el, options) {
	const { width, height } = el.getBoundingClientRect();
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

	const wheel = new Wheel({ width, height, choices: options });

	app.stage.addChild(wheel);

	let angle = 0;
	let currentAngle = 0;
	const MIN_SPEED = 1;

	function spin() {
		angle = randomBetween(720, 36000);
	}

	el.appendChild(app.canvas);

	// setTimeout(() => {
	// 	spin();
	// }, 2000);

	app.ticker.add(() => {
		if (currentAngle < angle) {
			const speed = Math.max((angle - currentAngle) / 100, MIN_SPEED);
			currentAngle = Math.min(angle, currentAngle + speed);
			wheel.rotate(speed);
		}
	});
}

class Wheel extends PIXI.Container {
	#choices = [];
	#children = new Map();
	#width = 0;
	#height = 0;

	constructor({ width, height, choices }) {
		super();
		this.#width = width;
		this.#height = height;
		this.#choices = choices;
		const radius = (Math.min(width, height) * 0.9) / 2;
		const delta = degreesToRadians(360 / choices.length);
		const x = width / 2;
		const y = height / 2;

		for (let i = 0; i < choices.length; i++) {
			const color = colors[i > colors.length - 1 ? i % colors.length : i];
			const container = new PIXI.Container();
			const choice = new PIXI.Graphics()
				.moveTo(x, y)
				.arc(x, y, radius, i * delta, (i + 1) * delta)
				.fill(color);

			container.addChild(choice);

			const label = createLabel(
				choices[i].name,
				x,
				y,
				(i * delta + (i + 1) * delta) / 2,
				radius,
			);

			container.addChild(label);

			container.zIndex = 2;

			this.addChild(container);
		}

		this.rotation = 0;
		this.pivot = { x, y };
		this.position = { x, y };
	}

	rotate(rotation) {
		this.rotation = rotation;
	}

	#addChoice(choice, x, y) {
		// const index = this.#choices.length;
		// const color = colors[index % colors.length];
		// const delta = degreesToRadians()
		// const container = new PIXI.Container();
		// const choiceGraphics = new PIXI.Graphics().moveTo()
		if (this.#children.has(choice.id)) {
			throw new Error("The choice already exists!", choice);
		}

		const container = new PIXI.Container();
		const choiceBg = new PIXI.Graphics();
		const choiceLabel = createLab;
		// TODO: move choice to a separate components with all children
	}

	#renderChoices() {
		const radius = (Math.min(this.#width, this.#height) * 0.9) / 2;
		const delta = degreesToRadians(360 / this.#choices.length);
		const x = this.#width / 2;
		const y = this.#height / 2;

		for (let index = 0; index < this.#choices.length; index++) {
			const color = colors[index % colors.length];
			const child = this.#children.get(choice.id);
			// Retrieve child components
		}
	}
}

function createLabel(label, x, y, angle, radius) {
	const container = new PIXI.Container();
	const fontSize = 24;
	const style = new PIXI.TextStyle({
		fontFamily: "Arial",
		fontSize,
		fontWeight: 700,
		fill: 0xffffff,
		dropShadow: {
			alpha: 1,
			angle: -60,
			blur: 1,
			color: 0x000000,
			distance: 1,
		},
	});
	const text = new PIXI.Text({
		text: label,
		style,
	});

	container.updateTransform({
		x,
		y,
		rotation: angle,
		pivotX: -radius * 0.15,
		pivotY: fontSize / 2,
	});

	container.addChild(text);

	return container;
}
