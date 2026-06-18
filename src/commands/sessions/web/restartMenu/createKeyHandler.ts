import type { MenuState } from "./createMenuState";
import { parseMenuKey } from "./parseMenuKey";

type KeyHandlerDeps = {
	menu: MenuState;
	toggleKey: string;
	isBusy: () => boolean;
	activate: () => void;
	quit: () => void;
};

export function createKeyHandler(
	deps: KeyHandlerDeps,
): (chunk: string) => void {
	const { menu, toggleKey, isBusy, activate, quit } = deps;
	return (chunk) => {
		if (isBusy()) return;
		const { key, digit } = parseMenuKey(chunk, toggleKey);
		if (key === "quit") return quit();
		if (key === "toggle") {
			if (menu.isOpen()) menu.close();
			else menu.open();
			return;
		}
		if (!menu.isOpen()) return;
		if (key === "up") menu.move(-1);
		else if (key === "down") menu.move(1);
		else if (key === "dismiss") menu.close();
		else if (key === "select") activate();
		else if (key === "digit" && menu.jumpTo((digit ?? 0) - 1)) activate();
	};
}
