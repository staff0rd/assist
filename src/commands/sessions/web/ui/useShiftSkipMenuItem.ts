import { type KeyboardEvent, type MouseEvent, useRef } from "react";
import { useShiftSkipConfirm } from "./useShiftSkipConfirm";

export function useShiftSkipMenuItem(
	skip: () => void,
	open: () => void,
	label: string,
) {
	const swallowMenuItemEnterClick = useRef(false);
	const { triggerHandlers, withHint } = useShiftSkipConfirm(skip, {
		onOpen: open,
	});
	return {
		title: withHint(label),
		onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
			triggerHandlers.onKeyDown(event);
			if (event.defaultPrevented) swallowMenuItemEnterClick.current = true;
		},
		onClick: (event: MouseEvent<HTMLElement>) => {
			if (swallowMenuItemEnterClick.current) {
				swallowMenuItemEnterClick.current = false;
				event.stopPropagation();
				return;
			}
			triggerHandlers.onClick(event);
		},
	};
}
