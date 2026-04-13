import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";

export type TerminalHandle = {
	term: Terminal;
	fitAddon: FitAddon;
	dispose: () => void;
};

export function createTerminal(el: HTMLElement): TerminalHandle {
	const term = new Terminal({
		cursorBlink: true,
		fontSize: 14,
		fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
		theme: { background: "#1e1e1e", foreground: "#d4d4d4" },
	});

	const fitAddon = new FitAddon();
	term.loadAddon(fitAddon);
	term.open(el);
	fitAddon.fit();

	return { term, fitAddon, dispose: () => term.dispose() };
}
