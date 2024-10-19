export function degreesToRadians(degrees) {
	return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians) {
	return (radians * 180) / Math.PI;
}

export function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// TODO: This generated IDs should be replaced by IDs from the persistent storage
export function generateId() {
	return `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
