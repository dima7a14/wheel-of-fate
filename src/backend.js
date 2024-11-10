import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { EventEmitter } from "./utils";

const EVENTS = {};
const INVOKE_COMMANDS = {
	getChoices: "get_choices",
	addChoice: "add_choice",
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
	loadChoices: async () => {
		const choices = await invoke(INVOKE_COMMANDS.getChoices);
		return choices;
	},
	addChoice: async (name) => {
		const choice = await invoke(INVOKE_COMMANDS.addChoice, {
			choiceName: name,
		});
		return choice;
	},
};
