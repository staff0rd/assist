import type { MenuState } from "./createMenuState";
import { type RestartActions, runRestartItem } from "./runRestartItem";

export function createActivate(
	menu: MenuState,
	actions: RestartActions,
): { isBusy: () => boolean; activate: () => void } {
	let busy = false;
	const run = async () => {
		const item = menu.selectedItem();
		if (!item || item.disabled) return;
		menu.close();
		busy = true;
		try {
			await runRestartItem(item, actions);
		} finally {
			busy = false;
		}
	};
	return { isBusy: () => busy, activate: () => void run() };
}
