import { backend } from "./backend";
import { EventEmitter } from "./utils";

const DIALOG_ID = "file_modal";
const OPEN_ID = "file_modal_open";
const NEW_ID = "file_modal_new";

export const FILE_DIALOG_EVENTS = {
	FILE_OPENED: "FILE_OPENED",
	FILE_CREATED: "FILE_CREATED",
};

export class FileDialog extends EventEmitter {
	#dialog = null;
	#openBtn = null;
	#newBtn = null;

	constructor() {
		super();
		const dialog = document.getElementById(DIALOG_ID);
		const openBtn = document.getElementById(OPEN_ID);
		const newBtn = document.getElementById(NEW_ID);

		if (!dialog || !openBtn || !newBtn) {
			throw new Error("Can't initialize file dialog!");
		}

		this.#dialog = dialog;
		this.#openBtn = openBtn;
		this.#newBtn = newBtn;

		openBtn.addEventListener("click", (event) => {
			backend
				.openDialog()
				.then(() => this.trigger(FILE_DIALOG_EVENTS.FILE_OPENED));
		});

		newBtn.addEventListener("click", (event) => {
			// 	TODO: handle new file creation
		});
	}

	openDialog() {
		this.#dialog.style.display = "flex";
	}

	hideDialog() {
		this.#dialog.style.display = "none";
	}
}
