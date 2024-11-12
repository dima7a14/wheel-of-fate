export function degreesToRadians(degrees) {
	return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians) {
	return (radians * 180) / Math.PI;
}

export function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export class EventEmitter {
	#listeners = new Map();

	on(eventName, cb) {
		const listeners = this.#listeners.get(eventName) ?? [];

		listeners.push(cb);

		this.#listeners.set(eventName, listeners);

		const off = () => {
			let listeners = this.#listeners.get(eventName) ?? [];

			const index = listeners.findIndex((e) => e === cb);

			if (index !== -1) {
				listeners.splice(index, 1);
			}

			this.#listeners.set(eventName, listeners);
		};

		return off;
	}

	trigger(eventName, payload) {
		const listeners = this.#listeners.get(eventName) ?? [];

		listeners.forEach((listener) => listener(payload));
	}
}

function fromHexToRGB(hexColor) {
	if (typeof hexColor !== "string") {
		throw new Error("Invalid color", hexColor);
	}

	if (hexColor.indexOf("#") !== 0) {
		throw new Error("Invalid format for hex color", hexColor);
	}

	let color = hexColor.slice(1);

	if (color.length === 3) {
		color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
	}

	if (color.length !== 6) {
		throw new Error("Invalid hex color", hexColor);
	}

	const r = parseInt(color.slice(0, 2), 16);
	const g = parseInt(color.slice(2, 4), 16);
	const b = parseInt(color.slice(4, 6), 16);

	return { r, g, b };
}

export function invertColor(color) {
	const { r, g, b } = fromHexToRGB(color);
	return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#ffffff";
}

export function parseFileName(fullPath) {
	const filenameWithExt = fullPath.replace(/^.*[\\/]/, "");
	const index = filenameWithExt.lastIndexOf(".");

	return filenameWithExt.slice(0, index);
}
