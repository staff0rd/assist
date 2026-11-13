import { useLayoutEffect, useRef } from "react";

export function usePendingCursor(value: string) {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const pendingCursor = useRef<number | null>(null);

	useLayoutEffect(() => {
		const input = inputRef.current;
		if (pendingCursor.current === null || !input) return;
		input.setSelectionRange(pendingCursor.current, pendingCursor.current);
		pendingCursor.current = null;
	}, [value]);

	return {
		inputRef,
		placeCursor: (cursor: number) => {
			pendingCursor.current = cursor;
		},
		isPlacing: () => pendingCursor.current !== null,
	};
}
