import type { ResizeFn } from "../../../ResizeFn";
import { createTerminal, type TerminalHandle } from "./createTerminal";
import { handleClipboardKey } from "./setupTerminal/handleClipboardKey";
import { hasTerminalSize } from "./hasTerminalSize";
import { isAppHotkey } from "./setupTerminal/isAppHotkey";

type TerminalIo = {
	sendInput: (sessionId: string, data: string) => void;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendResize: ResizeFn;
	isInactive: () => boolean;
};

export function setupTerminal(
	el: HTMLElement,
	sessionId: string,
	{ sendInput, onOutput, sendResize, isInactive }: TerminalIo,
): { handle: TerminalHandle; cleanup: () => void } {
	const handle = createTerminal(el);

	handle.term.onData((data) => sendInput(sessionId, data));
	handle.term.attachCustomKeyEventHandler((event) => {
		if (isAppHotkey(event)) return false;
		return handleClipboardKey(event, handle.term, navigator.clipboard, (text) =>
			handle.term.paste(text),
		);
	});
	const unsubOutput = onOutput(sessionId, (data) => {
		if (!isInactive()) handle.term.write(data);
	});

	const observer = new ResizeObserver(() => {
		if (isInactive() || !hasTerminalSize(el)) return;
		handle.fitAddon.fit();
		sendResize(sessionId, handle.term.cols, handle.term.rows);
	});
	observer.observe(el);

	const cleanup = () => {
		observer.disconnect();
		unsubOutput();
		handle.dispose();
	};

	return { handle, cleanup };
}
