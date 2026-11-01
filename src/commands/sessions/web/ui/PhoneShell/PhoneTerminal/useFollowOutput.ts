import type { Terminal } from "@xterm/xterm";
import { type RefObject, useCallback, useRef } from "react";

const STICK_THRESHOLD_PX = 24;

export function useFollowOutput(
	scrollRef: RefObject<HTMLElement | null>,
	termRef: RefObject<Terminal | null>,
) {
	const stickRef = useRef(true);

	const follow = useCallback(() => {
		const el = scrollRef.current;
		if (el && stickRef.current) el.scrollTop = el.scrollHeight;
	}, [scrollRef]);

	const trackStick = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		const buffer = termRef.current?.buffer.active;
		const termAtBottom = !buffer || buffer.viewportY >= buffer.baseY;
		stickRef.current =
			termAtBottom &&
			el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX;
	}, [scrollRef, termRef]);

	return { follow, trackStick };
}
