import type { KeyboardEvent } from "react";
import { handleEnterSubmit } from "../../../../../../handleEnterSubmit";

const STEP: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

function nextIndex(e: KeyboardEvent, index: number, count: number) {
	if (e.key === "Tab") {
		const next = index + (e.shiftKey ? -1 : 1);
		return next >= 0 && next < count ? next : undefined;
	}
	return (index + STEP[e.key] + count) % count;
}

export function segmentedRadioKeyHandler<T extends string>(
	options: readonly T[],
	value: T,
	onChange: (value: T) => void,
	onToggleRow?: () => void,
) {
	return (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			if (!onToggleRow) return;
			e.preventDefault();
			onToggleRow();
			return;
		}
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
