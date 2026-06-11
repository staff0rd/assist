import { createTerminal, type TerminalHandle } from "./createTerminal";
import { handleClipboardKey } from "./handleClipboardKey";

type ResizeFn = (sessionId: string, cols: number, rows: number) => void;

export function setupTerminal(
	el: HTMLElement,
	sessionId: string,
	sendInput: (sessionId: string, data: string) => void,
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void,
	sendResize: ResizeFn,
): { handle: TerminalHandle; cleanup: () => void } {
	const handle = createTerminal(el);

	handle.term.onData((data) => sendInput(sessionId, data));
	handle.term.attachCustomKeyEventHandler((event) =>
		handleClipboardKey(event, handle.term, navigator.clipboard, (text) =>
			handle.term.paste(text),
		),
	);
	const unsubOutput = onOutput(sessionId, (data) => handle.term.write(data));

	const observer = new ResizeObserver(() => {
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
