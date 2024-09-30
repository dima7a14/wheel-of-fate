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

(async () => {
	const el = document.getElementById(WHEEL_ELEMENT_ID);
	if (!el) {
		throw new Error("Not found element for Wheel!");
	}

	const initOptions = [
		{
			name: "The Binding of Isaac",
		},
		{
			name: "Crypt of the Necro Dancer",
		},
		{
			name: "Curse of the Dead Gods",
		},
		{
			name: "Dead Cells",
		},
		{
			name: "Dead Estate",
		},
		{
			name: "Nuclear Throne",
		},
		{
			name: "Invisible Inc.",
		},
		{
			name: "Risk of Rain 2",
		},
		{
			name: "Enter the Gungeon",
		},
		{
			name: "Noita",
		},
	];

	const form = new Form(initOptions);

	await initWheel(el, initOptions);
})();
