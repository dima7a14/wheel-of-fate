import { createWheel } from "./wheel";
import { Form, FORM_EVENTS } from "./form";
import { WHEEL_ELEMENT_ID } from "./config";
import { backend } from "./backend";

(async () => {
	const el = document.getElementById(WHEEL_ELEMENT_ID);
	if (!el) {
		throw new Error("Not found element for Wheel!");
	}

	const initOptions = await backend.loadChoices();

	const form = new Form(initOptions);

	const wheel = await createWheel(el, form.choices);

	const onAddChoice = async (name) => {
		const choice = await backend.addChoice(name);
		form.addOption(choice);
		wheel.addChoice(choice);
	};

	const onRemoveChoice = async (choice) => {
		await backend.removeChoice(choice.id);
		wheel.removeChoice(choice);
	};

	form.on(FORM_EVENTS.ADD_CHOICE, onAddChoice);
	form.on(FORM_EVENTS.REMOVE_CHOICE, onRemoveChoice);
})();
