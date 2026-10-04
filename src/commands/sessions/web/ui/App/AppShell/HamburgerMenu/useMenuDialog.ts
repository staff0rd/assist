import { useCallback, useState } from "react";
import { useShortcutsSheetHotkey } from "./useMenuDialog/useShortcutsSheetHotkey";

export type MenuDialog = "shortcuts" | "restart" | "update";

export function useMenuDialog() {
	const [dialog, setDialog] = useState<MenuDialog | null>(null);
	useShortcutsSheetHotkey(useCallback(() => setDialog("shortcuts"), []));
	const closeDialog = useCallback(() => setDialog(null), []);
	return { dialog, showDialog: setDialog, closeDialog };
}
