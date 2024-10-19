import { FORM_ID, OPTIONS_LIST_ID } from "./config";
import { generateId, EventEmitter } from "./utils";

export const FORM_EVENTS = {
	ADD_CHOICE: "ADD_CHOICE",
	REMOVE_CHOICE: "REMOVE_CHOICE",
};

export class Form extends EventEmitter {
	#options = [];

	constructor(options = []) {
		super();
		this.#options = options;
		this.#renderOptions();
		this.#initForm();
	}

	get choices() {
		return this.#options;
	}

	#initForm() {
		const form = document.getElementById(FORM_ID);

		if (!form) {
			throw new Error("Can't initialize form!");
		}

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const data = new FormData(form);
			const newOption = {
				id: generateId(),
				name: data.get("name"),
			};
			this.#options.push(newOption);
			this.trigger(FORM_EVENTS.ADD_CHOICE, newOption);
			this.#update();
			form.reset();
		});
	}

	#renderOptions() {
		const ul = document.getElementById(OPTIONS_LIST_ID);

		if (!ul) {
			throw new Error("Can't render choices!");
		}

		for (let i = 0; i < this.#options.length; i++) {
			const option = this.#options[i];
			const li = document.createElement("li");

			const optionNumber = document.createElement("span");
			optionNumber.textContent = `${i + 1}.`;
			li.appendChild(optionNumber);

			const optionName = document.createElement("span");
			optionName.classList.add("choice-name");
			optionName.textContent = option.name;
			li.appendChild(optionName);

			const removeBtn = document.createElement("button");
			removeBtn.type = "button";
			removeBtn.classList.add("remove-choice");
			removeBtn.textContent = "Remove";
			const clickListener = () => {
				removeBtn.removeEventListener("click", clickListener);
				this.trigger(FORM_EVENTS.REMOVE_CHOICE, option);
				this.#removeOption(i);
			};
			removeBtn.addEventListener("click", clickListener);
			li.appendChild(removeBtn);

			ul.appendChild(li);
		}
	}

	#removeOption(index) {
		this.#options.splice(index, 1);
		this.#update();
	}

	#update() {
		this.#cleanup();
		this.#renderOptions();
	}

	#cleanup() {
		const ul = document.getElementById(OPTIONS_LIST_ID);

		while (ul.firstChild) {
			ul.removeChild(ul.firstChild);
		}
	}
}
