import * as PIXI from "pixi.js";

import { degreesToRadians, invertColor, randomBetween, inRange } from "./utils";
import { Viewport, VIEWPORT_EVENTS } from "./viewport";
import arrow from "./assets/arrow.png";

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

	const wheel = new Wheel({ width, height, ticker: app.ticker });

	initChoices.forEach((choice) => {
		wheel.addChoice(choice);
	});

	app.stage.addChild(wheel.container);

	el.appendChild(app.canvas);

	app.ticker.add(() => {
		wheel.render();
	});

	app.stage.on("click", () => {
		wheel.spin();
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
		wheel.updateDims(width, height);
	});

	return {
		addChoice,
		addChoices,
		removeChoice,
		removeChoices,
	};
}

const INITIAL_ROTATION = Math.PI;
const ROTATION_MIN_SPEED = 0.01;
const ROTATION_MAX_SPEED = 1;
const MIN_ROTATION = 8 * Math.PI;
const MAX_ROTATION = 24 * Math.PI;

class Wheel {
	#shouldRender = true;
	#rotation = INITIAL_ROTATION;
	#ticker = null;
	#targetRotation = INITIAL_ROTATION;

	constructor({ width, height, ticker }) {
		this.width = width;
		this.height = height;
		this.container = new PIXI.Container();
		this.choices = [];
		this.head = new WheelHead();
		this.container.addChild(this.head.container);
		this.head.container.position.set(
			this.width / 2 + this.radius - 10,
			height / 2,
		);
		this.head.updateDims(this.width, this.height);
		this.head.container.zIndex = Number.MAX_SAFE_INTEGER;
		this.#ticker = ticker;

		this.rotate = this.rotate.bind(this);
		this.spin = this.spin.bind(this);
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

	get isSpinning() {
		return this.#rotation !== this.#targetRotation;
	}

	updateDims(width, height) {
		this.width = width;
		this.height = height;
		this.head.container.position.set(
			this.width / 2 + this.radius - 10,
			height / 2,
		);
		this.head.updateDims(this.width, this.height);
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

	render() {
		if (!this.#shouldRender) {
			return;
		}

		this.choices.forEach((choice, index) => {
			const { x, y } = this.center;
			const startAngle = this.#rotation + index * this.delta;
			const endAngle = this.#rotation + (index + 1) * this.delta;
			const fullCircles = Math.ceil(this.#rotation / (2 * Math.PI));
			const angle = 2 * Math.PI * fullCircles;
			const range = {
				start: startAngle,
				end: endAngle,
			};
			const isWinner = !this.isSpinning && inRange(angle, range);

			choice.render({
				x,
				y,
				startAngle,
				endAngle,
				color: choice.color,
				radius: this.radius,
				isWinner,
			});
		});

		this.#shouldRender = false;
	}

	getWinner() {
		const fullCircles = Math.ceil(this.#rotation / (2 * Math.PI));
		const angle = 2 * Math.PI * fullCircles;
		let winner = {
			index: -1,
		};

		for (let index = 0; index < this.choices.length; index++) {
			const choice = this.choices[index];
			const startAngle = this.#rotation + index * this.delta;
			const endAngle = this.#rotation + (index + 1) * this.delta;
			const range = {
				start: startAngle,
				end: endAngle,
			};

			if (inRange(angle, range)) {
				winner = {
					index,
					id: choice.id,
					name: choice.name,
					color: choice.color,
				};
				break;
			}
		}

		return winner;
	}

	rotate() {
		if (this.#rotation < this.#targetRotation) {
			const diff = (this.#targetRotation - this.#rotation) / 100;
			const speed = Math.min(
				Math.max(diff, ROTATION_MIN_SPEED),
				ROTATION_MAX_SPEED,
			);
			this.#rotation += speed;
			this.#shouldRender = true;
		} else {
			if (this.#rotation > this.#targetRotation) {
				this.#rotation = this.#targetRotation;
			}

			this.#ticker.remove(this.rotate);
			this.#shouldRender = true;
		}
	}

	spin() {
		if (this.isSpinning) {
			return;
		}

		this.#targetRotation =
			this.#rotation + randomBetween(MIN_ROTATION, MAX_ROTATION);
		this.#ticker.add(this.rotate);
	}
}

class Choice {
	#winnerScale = 1.1;

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

	#renderGraphics({ x, y, radius, startAngle, endAngle, color, isWinner }) {
		const finalRadius = isWinner ? radius * this.#winnerScale : radius;
		this.graphics
			.clear()
			.moveTo(x, y)
			.arc(x, y, finalRadius, startAngle, endAngle)
			.fill(color);
	}

	render({ x, y, radius, startAngle, endAngle, color, isWinner }) {
		this.#renderGraphics({
			x,
			y,
			radius,
			startAngle,
			endAngle,
			color,
			isWinner,
		});
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

class WheelHead {
	#texture = null;
	#sprite = null;
	#maxSpriteSize = 128;
	#size = 128;

	constructor() {
		this.container = new PIXI.Container();
		this.loadTexture();
	}

	async loadTexture() {
		this.#texture = await PIXI.Assets.load(arrow);
		const sprite = new PIXI.Sprite(this.#texture);
		sprite.rotation = Math.PI;
		sprite.anchor.set(0.25, 0.5);
		sprite.blendMode = PIXI.BLEND;
		sprite.width = this.#size;
		sprite.height = this.#size;
		this.#sprite = sprite;
		this.container.addChild(this.#sprite);
	}

	updateDims(containerWidth, containerHeight) {
		let size = Math.min(containerWidth, containerHeight) * 0.25;

		if (size > this.#maxSpriteSize) {
			size = this.#maxSpriteSize;
		}

		if (this.#sprite) {
			this.#sprite.width = size;
			this.#sprite.height = size;
		}
	}

	destroy() {
		this.#sprite.destroy();
		this.#texture.destroy();
		this.container.destroy();
	}
}
