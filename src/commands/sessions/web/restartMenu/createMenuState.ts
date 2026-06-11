import type { createLogUpdate } from "log-update";
import type { MenuItem } from "./menuItems";
import { firstEnabledIndex, nextIndex } from "./nextIndex";
import { renderRestartMenu } from "./renderRestartMenu";

type LogUpdate = ReturnType<typeof createLogUpdate>;

export type MenuState = {
	isOpen(): boolean;
	open(): void;
	close(): void;
	move(direction: 1 | -1): void;
	selectedItem(): MenuItem | undefined;
	jumpTo(index: number): boolean;
};

export function createMenuState(items: MenuItem[], log: LogUpdate): MenuState {
	let open = false;
	let selected = firstEnabledIndex(items);
	const render = () => log(renderRestartMenu(items, selected));
	return {
		isOpen: () => open,
		open() {
			open = true;
			selected = firstEnabledIndex(items);
			render();
		},
		close() {
			if (!open) return;
			open = false;
			log.clear();
		},
		move(direction) {
			selected = nextIndex(items, selected, direction);
			render();
		},
		selectedItem: () => items[selected],
		jumpTo(index) {
			const item = items[index];
			if (!item) return false;
			selected = index;
			render();
			return !item.disabled;
		},
	};
}
