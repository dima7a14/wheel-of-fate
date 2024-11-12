const LEGEND_ID = "legend";

export function updateLegend(options) {
	const legend = document.getElementById(LEGEND_ID);

	if (!legend) {
		throw new Error("Missing Legend element!");
	}

	const title = legend.querySelector("h1");

	if (!title) {
		throw new Error("Missing title element!");
	}

	const titleContent = options.name ?? "Wheel";

	title.textContent = titleContent;
	document.title = titleContent;
}
