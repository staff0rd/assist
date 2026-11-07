import { type KeyboardEvent, type MouseEvent, useState } from "react";

const shiftSkipHint = "(Shift skips confirmation)";

export function useShiftSkipConfirm(
	skip: () => void,
	{
		needsConfirm = true,
		onOpen,
	}: { needsConfirm?: boolean; onOpen?: () => void } = {},
) {
	const [confirming, setConfirming] = useState(false);
	const open = onOpen ?? (() => setConfirming(true));
	return {
		confirming,
		close: () => setConfirming(false),
		triggerHandlers: {
			onClick: (e: MouseEvent<HTMLElement>) => {
				e.stopPropagation();
				if (e.shiftKey || !needsConfirm) skip();
				else open();
			},
			onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
				if (e.key !== "Enter" || !e.shiftKey) return;
				e.preventDefault();
				e.stopPropagation();
				skip();
			},
		},
		withHint: (title: string) => `${title} ${shiftSkipHint}`,
	};
}
