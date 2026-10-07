import { type RefObject, useEffect, useRef } from "react";
import type { ResizeFn } from "../../../ResizeFn";
import { type SessionTerminal, setupTerminal } from "./setupTerminal";

type MountIo = {
	sendInput: (sessionId: string, data: string) => void;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendResize: ResizeFn;
	staleRef: RefObject<boolean>;
	mayResize: () => boolean;
};

export function useMountTerminal(
	containerRef: RefObject<HTMLDivElement | null>,
	sessionId: string,
	{ sendInput, onOutput, sendResize, staleRef, mayResize }: MountIo,
): RefObject<SessionTerminal | null> {
	const handleRef = useRef<SessionTerminal | null>(null);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const { handle, cleanup } = setupTerminal(el, sessionId, {
			sendInput,
			onOutput,
			sendResize,
			isStale: () => staleRef.current,
			mayResize,
		});
		handleRef.current = handle;
		return () => {
			cleanup();
			handleRef.current = null;
		};
	}, [
		containerRef,
		sessionId,
		onOutput,
		sendInput,
		sendResize,
		staleRef,
		mayResize,
	]);

	return handleRef;
}
