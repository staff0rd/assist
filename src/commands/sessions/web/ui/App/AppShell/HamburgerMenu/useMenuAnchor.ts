import { useCallback, useState } from "react";
import { useCloseOnShortcut } from "./useMenuAnchor/useCloseOnShortcut";

export function useMenuAnchor() {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [restoreFocus, setRestoreFocus] = useState(true);
	const open = Boolean(anchorEl);
	const close = useCallback(() => setAnchorEl(null), []);
	const openAt = useCallback((anchor: HTMLElement) => {
		setRestoreFocus(true);
		setAnchorEl(anchor);
	}, []);
	useCloseOnShortcut(
		open,
		useCallback(() => {
			setRestoreFocus(false);
			setAnchorEl(null);
		}, []),
	);
	return { anchorEl, open, close, openAt, restoreFocus };
}
