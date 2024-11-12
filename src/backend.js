import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { EventEmitter, parseFileName } from "./utils";

const EVENTS = {};
const INVOKE_COMMANDS = {
	loadChoices: "load_choices",
	saveChoices: "save_choices",
	getChoices: "get_choices",
	getCurrentPath: "get_current_path",
	addChoice: "add_choice",
	removeChoice: "remove_choice",
};

class Events extends EventEmitter {
	constructor() {
		super();

		Object.values(EVENTS).forEach((eventName) => {
			listen(eventName, (event) => {
				console.log("EVENT", eventName, event);
			});
		});
	}
}

export const backend = {
	events: new Events(),
	getChoices: async () => {
		const choices = await invoke(INVOKE_COMMANDS.getChoices);
		return choices;
	},
	getFileName: async () => {
		const currentPath = await invoke(INVOKE_COMMANDS.getCurrentPath);
		return parseFileName(currentPath);
	},
	addChoice: async (name) => {
		const choice = await invoke(INVOKE_COMMANDS.addChoice, {
			choiceName: name,
		});
		return choice;
	},
	removeChoice: async (id) => {
		const choices = await invoke(INVOKE_COMMANDS.removeChoice, {
			choiceId: id,
		});
		return choices;
	},
	openFile: async () => {
		const filePath = await open({
			canCreateDirectories: true,
			multiple: false,
			directory: false,
			filters: [{ name: "Wheel choices", extensions: ["json"] }],
		});

		if (!filePath) {
			return Promise.reject("No selected file.");
		}

		return await invoke(INVOKE_COMMANDS.loadChoices, { filePath });
	},
	newFile: async () => {
		const filePath = await save({
			canCreateDirectories: true,
			filters: [{ name: "Wheel choices", extensions: ["json"] }],
		});

		if (!filePath) {
			return Promise.reject("No created file.");
		}

		return await invoke(INVOKE_COMMANDS.saveChoices, { filePath });
	},
};
