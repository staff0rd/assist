import { type WheelEvent, useState } from "react";

function withLatest(history: string[], latest: string): string[] {
	return history.at(-1) === latest ? history : [...history, latest];
}

export function useHistoryStep(
	message: string,
	history: string[],
	enabled: boolean,
) {
	const [offset, setOffset] = useState(0);
	const messages = withLatest(history, message);
	const clamped = Math.min(offset, messages.length - 1);

	const onWheel = (e: WheelEvent) => {
		if (!enabled || e.deltaY === 0) return;
		const next = clamped + (e.deltaY < 0 ? 1 : -1);
		setOffset(Math.max(0, Math.min(next, messages.length - 1)));
	};

	return { shown: messages[messages.length - 1 - clamped], onWheel };
}
