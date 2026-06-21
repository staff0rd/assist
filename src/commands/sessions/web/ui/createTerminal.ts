import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { WebLinksAddon } from "@xterm/addon-web-links";
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
	term.loadAddon(
		new WebLinksAddon((_event, uri) => {
			window.open(uri, "_blank", "noopener");
		}),
	);
	term.open(el);

	/* why: the DOM fallback renderer paints each selected run as one span carrying
	   the selection background plus a per-span letter-spacing; the trailing spacing
	   inflates the background box past the final glyph, so the last selected cell
	   reads blank (xterm #4881). The WebGL renderer draws selection as a separate
	   cell-aligned layer and avoids it. Fall back to DOM if WebGL is unavailable. */
	let webgl: WebglAddon | undefined;
	try {
		webgl = new WebglAddon();
		webgl.onContextLoss(() => {
			webgl?.dispose();
			webgl = undefined;
		});
		term.loadAddon(webgl);
	} catch {
		webgl = undefined;
	}

	fitAddon.fit();

	return {
		term,
		fitAddon,
		dispose: () => {
			webgl?.dispose();
			term.dispose();
		},
	};
}
