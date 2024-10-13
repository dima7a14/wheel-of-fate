// const { invoke } = window.__TAURI__.tauri;

// let greetInputEl;
// let greetMsgEl;

// async function greet() {
//   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//   greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
// }

// window.addEventListener("DOMContentLoaded", () => {
//   greetInputEl = document.querySelector("#greet-input");
//   greetMsgEl = document.querySelector("#greet-msg");
//   document.querySelector("#greet-form").addEventListener("submit", (e) => {
//     e.preventDefault();
//     greet();
//   });
// });

import { initWheel } from "./wheel";
import { Form } from "./form";
import { WHEEL_ELEMENT_ID } from "./config";
import { generateId } from "./utils";

(async () => {
	const el = document.getElementById(WHEEL_ELEMENT_ID);
	if (!el) {
		throw new Error("Not found element for Wheel!");
	}

	const initOptions = [
		{
			id: generateId(),
			name: "The Binding of Isaac",
		},
		{
			id: generateId(),
			name: "Crypt of the Necro Dancer",
		},
		{
			id: generateId(),
			name: "Curse of the Dead Gods",
		},
		{
			id: generateId(),
			name: "Dead Cells",
		},
		{
			id: generateId(),
			name: "Dead Estate",
		},
		{
			id: generateId(),
			name: "Nuclear Throne",
		},
		{
			id: generateId(),
			name: "Invisible Inc.",
		},
		{
			id: generateId(),
			name: "Risk of Rain 2",
		},
		{
			id: generateId(),
			name: "Enter the Gungeon",
		},
		{
			id: generateId(),
			name: "Noita",
		},
	];

	const form = new Form(initOptions);

	await initWheel(el, initOptions);
})();
