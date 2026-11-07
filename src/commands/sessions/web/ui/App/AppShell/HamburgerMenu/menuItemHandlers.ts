import type { MenuActions } from "./useMenuActions";
import type { MenuDialog } from "./useMenuDialog";

export function menuItemHandlers(
	close: () => void,
	showDialog: (dialog: MenuDialog) => void,
	toggleColorMode: () => void,
	actions: Pick<MenuActions, "restart" | "update">,
) {
	const closeAndShow = (next: MenuDialog) => () => {
		close();
		showDialog(next);
	};
	const closeAndRun = (run: () => void) => () => {
		close();
		run();
	};
	return {
		onToggleColorMode: () => {
			toggleColorMode();
			close();
		},
		onShowShortcuts: closeAndShow("shortcuts"),
		onConnectMobile: close,
		onFirefoxExtension: close,
		onTestflight: closeAndShow("testflight"),
		onRestart: {
			open: closeAndShow("restart"),
			skip: closeAndRun(actions.restart),
		},
		onUpdate: {
			open: closeAndShow("update"),
			skip: closeAndRun(actions.update),
		},
	};
}
