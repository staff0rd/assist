import type { KeyboardEvent, MouseEvent } from "react";

export function shiftSkipsConfirmHandlers(
	skip: () => void,
	openConfirm: () => void,
) {
	return {
		onClick: (e: MouseEvent<HTMLElement>) => {
			e.stopPropagation();
			if (e.shiftKey) skip();
			else openConfirm();
		},
		onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
			if (e.key !== "Enter" || !e.shiftKey) return;
			e.preventDefault();
			e.stopPropagation();
			skip();
		},
	};
}
