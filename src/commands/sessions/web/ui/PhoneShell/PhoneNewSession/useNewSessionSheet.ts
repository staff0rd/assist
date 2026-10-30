import { useCallback, useState } from "react";

export function useNewSessionSheet() {
	const [open, setOpen] = useState(false);
	const [opens, setOpens] = useState(0);
	const show = useCallback(() => {
		setOpen(true);
		setOpens((count) => count + 1);
	}, []);
	const close = useCallback(() => setOpen(false), []);
	return { open, opens, show, close };
}
