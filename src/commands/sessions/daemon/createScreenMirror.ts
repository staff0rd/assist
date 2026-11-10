import serialize from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import { trackSgrMouseMode } from "./trackSgrMouseMode";

const { SerializeAddon } = serialize;
const { Terminal } = headless;

const SCROLLBACK_LINES = 5000;

export type ScreenMirror = {
	write: (data: string) => void;
	resize: (cols: number, rows: number) => void;
	snapshot: () => string;
};

export function createScreenMirror(cols: number, rows: number): ScreenMirror {
	const term = new Terminal({
		cols,
		rows,
		scrollback: SCROLLBACK_LINES,
		allowProposedApi: true,
	});
	const serializer = new SerializeAddon();
	term.loadAddon(serializer);
	const sgrMouse = trackSgrMouseMode(term);
	let notYetParsed = "";

	return {
		write: (data) => {
			notYetParsed += data;
			term.write(data, () => {
				notYetParsed = notYetParsed.slice(data.length);
			});
		},
		resize: (c, r) => {
			if (c > 0 && r > 0) term.resize(c, r);
		},
		/* why: the serializer restores the mouse tracking mode but not its encoding,
		   so a replayed terminal would report the wheel in X10 to an app expecting SGR. */
		snapshot: () =>
			serializer.serialize({ scrollback: SCROLLBACK_LINES }) +
			(sgrMouse() ? "\x1b[?1006h" : "") +
			notYetParsed,
	};
}
