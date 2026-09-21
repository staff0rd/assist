import { type KeyboardEvent, useEffect, useState } from "react";

export function useListKeyboardNav<T>(
	filtered: T[],
	resetKey: string,
	onSelect: (item: T) => void,
	close: () => void,
) {
	const [highlight, setHighlight] = useState(0);

	useEffect(() => {
		setHighlight(0);
	}, [resetKey]);

	const onKeyDown = (e: KeyboardEvent) => {
		const len = filtered.length;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			if (len > 0) setHighlight((h) => (h + 1) % len);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (len > 0) setHighlight((h) => (h - 1 + len) % len);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const item = filtered[highlight];
			if (item !== undefined) {
				onSelect(item);
				close();
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	};

	return { highlight, setHighlight, onKeyDown };
}
