import { type RefObject, useEffect, useRef } from "react";
import type { Ownership } from "../Ownership";
import type { ResizeFn } from "../../ResizeFn";
import type { TerminalHandle } from "./useTerminal/createTerminal";
import { setupTerminal } from "./useTerminal/setupTerminal";
import { useFitWhenVisible } from "./useTerminal/useFitWhenVisible";
import { useTakeOver } from "./useTerminal/useTakeOver";

type TerminalOptions = {
	visible: boolean;
	ownership: Ownership;
	sendInput: (sessionId: string, data: string) => void;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendResize: ResizeFn;
};

export function useTerminal(
	containerRef: RefObject<HTMLDivElement | null>,
	sessionId: string,
	{ visible, ownership, sendInput, onOutput, sendResize }: TerminalOptions,
): () => void {
	const handleRef = useRef<TerminalHandle | null>(null);
	const staleRef = useRef(ownership === "other");

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const { handle, cleanup } = setupTerminal(el, sessionId, {
			sendInput,
			onOutput,
			sendResize,
			isInactive: () => staleRef.current,
		});
		handleRef.current = handle;
		return () => {
			cleanup();
			handleRef.current = null;
		};
	}, [containerRef, sessionId, onOutput, sendInput, sendResize]);

	const refs = { containerRef, handleRef, staleRef };
	const takeOver = useTakeOver(refs, sessionId, ownership, sendResize);
	useFitWhenVisible(refs, sessionId, visible, sendResize);
	return takeOver;
}
