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

import { createWheel } from "./wheel";
import { Form, FORM_EVENTS } from "./form";
import { WHEEL_ELEMENT_ID } from "./config";
import { generateId } from "./utils";
import { backend } from "./backend";

(async () => {
	const el = document.getElementById(WHEEL_ELEMENT_ID);
	if (!el) {
		throw new Error("Not found element for Wheel!");
	}

	const initOptions = await backend.loadChoices();

	const form = new Form(initOptions);

	const wheel = await createWheel(el, form.choices);

	const onAddChoice = (choice) => {
		wheel.addChoice(choice);
	};

	const onRemoveChoice = (choice) => {
		wheel.removeChoice(choice);
	};

	form.on(FORM_EVENTS.ADD_CHOICE, onAddChoice);
	form.on(FORM_EVENTS.REMOVE_CHOICE, onRemoveChoice);
})();
