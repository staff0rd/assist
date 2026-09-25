import { type RefObject, useEffect, useState } from "react";

export function useDismissablePin(ref: RefObject<HTMLElement | null>) {
	const [pinned, setPinned] = useState(false);

	useEffect(() => {
		if (!pinned) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setPinned(false);
		};
		const onMouseDown = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setPinned(false);
		};
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("mousedown", onMouseDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("mousedown", onMouseDown);
		};
	}, [pinned, ref]);

	return { pinned, pin: () => setPinned(true) };
}
