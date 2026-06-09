import { type KeyboardEvent, useEffect, useState } from "react";

export function useRepoKeyboardNav(
	filtered: string[],
	resetKey: string,
	onSelect: (cwd: string) => void,
	close: () => void,
) {
	const [highlight, setHighlight] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset highlight whenever the result set changes
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
			const cwd = filtered[highlight];
			if (cwd) {
				onSelect(cwd);
				close();
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	};

	return { highlight, setHighlight, onKeyDown };
}
