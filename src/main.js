import { createWheel } from "./wheel";
import { Form, FORM_EVENTS } from "./form";
import { WHEEL_ELEMENT_ID } from "./config";
import { backend } from "./backend";
import { FILE_DIALOG_EVENTS, FileDialog } from "./fileDialog";
import { Legend, LEGEND_EVENTS } from "./legend";

(async () => {
	const el = document.getElementById(WHEEL_ELEMENT_ID);
	if (!el) {
		throw new Error("Not found element for Wheel!");
	}

	const legend = new Legend();
	const fileDialog = new FileDialog();

	fileDialog.on(FILE_DIALOG_EVENTS.FILE_OPENED, async () => {
		const choices = await backend.getChoices();
		const filename = await backend.getFileName();
		legend.update({ name: filename });
		wheel.addChoices(choices);
		form.addOptions(choices);
		fileDialog.hideDialog();
	});

	fileDialog.on(FILE_DIALOG_EVENTS.FILE_CREATED, async () => {
		const choices = await backend.getChoices();
		const filename = await backend.getFileName();
		legend.update({ name: filename });
		wheel.addChoices(choices);
		form.addOptions(choices);
		fileDialog.hideDialog();
	});

	legend.on(LEGEND_EVENTS.FILE_CLOSED, async () => {
		await backend.closeFile();
		wheel.removeChoices();
		form.removeOptions();
		fileDialog.showDialog();
	});

	const initOptions = [];

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
