import { useCallback, useRef, useState } from "react";

export function useEndedToast() {
	const [toast, setToast] = useState({ open: false, message: "" });
	const dismissed = useRef(new Set<string>());

	const markDismissed = useCallback((id: string) => {
		dismissed.current.add(id);
	}, []);
	const announceEnded = useCallback((id: string, title?: string) => {
		if (dismissed.current.has(id)) return;
		setToast({
			open: true,
			message: title ? `${title} ended` : "Session ended",
		});
	}, []);
	const hide = useCallback(() => setToast((t) => ({ ...t, open: false })), []);
	return { ...toast, markDismissed, announceEnded, hide };
}
