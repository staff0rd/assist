import type { KeyboardEvent } from "react";
import { handleEnterSubmit } from "../../../../../handleEnterSubmit";

const STEP: Record<string, number> = {
	ArrowRight: 1,
	ArrowDown: 1,
	ArrowLeft: -1,
	ArrowUp: -1,
};

function nextIndex(e: KeyboardEvent, index: number, count: number) {
	if (e.key === "Tab") {
		const next = index + (e.shiftKey ? -1 : 1);
		return next >= 0 && next < count ? next : undefined;
	}
	const step = STEP[e.key];
	return step ? (index + step + count) % count : undefined;
}

export function segmentedRadioKeyHandler<T extends string>(
	options: readonly T[],
	value: T,
	onChange: (value: T) => void,
) {
	return (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key !== "Tab" && !STEP[e.key]) {
			handleEnterSubmit(e);
			return;
		}
		const next = nextIndex(e, options.indexOf(value), options.length);
		if (next === undefined) return;
		e.preventDefault();
		onChange(options[next]);
		e.currentTarget
			.querySelector<HTMLElement>(`[data-value="${options[next]}"]`)
			?.focus();
	};
}
