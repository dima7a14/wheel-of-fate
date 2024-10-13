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
