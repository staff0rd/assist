import type { MenuDialog } from "./useMenuDialog";

export function menuItemHandlers(
	close: () => void,
	showDialog: (dialog: MenuDialog) => void,
	toggleColorMode: () => void,
) {
	const closeAndShow = (next: MenuDialog) => () => {
		close();
		showDialog(next);
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
		onRestart: closeAndShow("restart"),
		onUpdate: closeAndShow("update"),
	};
}
