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

	const wheel = new Wheel({ width, height });

	options.forEach((option) => {
		wheel.addChoice(option);
	});

	app.stage.addChild(wheel.container);

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
		// if (currentAngle < angle) {
		// 	const speed = Math.max((angle - currentAngle) / 100, MIN_SPEED);
		// 	currentAngle = Math.min(angle, currentAngle + speed);
		// 	wheel.rotate(speed);
		// }
		wheel.render();
	});
}

class Wheel {
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

	addChoice(choice) {
		const choiceComponent = new Choice(choice);

		this.choices.push(choiceComponent);
		this.container.addChild(choiceComponent.container);
	}

	removeChoice(id) {
		const index = this.choices.find((c) => c.id === id);

		if (index === -1) {
			return;
		}

		const choice = this.choices.splice(index, 1);

		choice.destroy();
		this.container.removeChildAt(index);
	}

	render() {
		this.choices.forEach((choice, index) => {
			const color = colors[index % colors.length];
			const { x, y } = this.center;
			const startAngle = index * this.delta;
			const endAngle = (index + 1) * this.delta;

			choice.render({
				x,
				y,
				startAngle,
				endAngle,
				color,
				radius: this.radius,
			});
		});
	}
}

class Choice {
	constructor(choice) {
		this.id = choice.id;
		this.name = choice.name;

		this.container = new PIXI.Container();
		this.graphics = new PIXI.Graphics();
		this.label = new Label(this.name);
		this.container.addChild(this.graphics);
		this.container.addChild(this.label.container);

		this.container.zIndex = 2;
	}

	#renderGraphics({ x, y, radius, startAngle, endAngle, color }) {
		this.graphics
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

class Label {
	constructor(name) {
		this.name = name;
		this.fontSize = 24;
		this.container = new PIXI.Container();
		const style = new PIXI.TextStyle({
			fontFamily: "Arial",
			fontSize: this.fontSize,
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
