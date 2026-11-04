import { useEffect, useRef } from "react";

type Handlers = {
	step: (by: number) => void;
	pickArea: (n: number) => void;
};

function typing(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLElement &&
		(target.isContentEditable ||
			["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
	);
}

export function useHighLevelReviewKeys(enabled: boolean, handlers: Handlers) {
	const latest = useRef(handlers);
	useEffect(() => {
		latest.current = handlers;
	});

	useEffect(() => {
		if (!enabled) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.ctrlKey || event.metaKey || event.altKey) return;
			if (typing(event.target)) return;
			if (event.key === "]") latest.current.step(1);
			else if (event.key === "[") latest.current.step(-1);
			else if (/^[1-9]$/.test(event.key))
				latest.current.pickArea(Number(event.key));
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [enabled]);
}
