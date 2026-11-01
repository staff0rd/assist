import type { Terminal } from "@xterm/xterm";
import { type RefObject, useRef } from "react";
import { useFollowOutput } from "./useFollowOutput";
import { useTouchScrollback } from "./useTouchScrollback";

export function usePhoneScroll(scrollRef: RefObject<HTMLElement | null>) {
	const termRef = useRef<Terminal | null>(null);
	const { follow, trackStick } = useFollowOutput(scrollRef, termRef);
	useTouchScrollback(scrollRef, termRef, trackStick);
	return { termRef, follow, trackStick };
}
