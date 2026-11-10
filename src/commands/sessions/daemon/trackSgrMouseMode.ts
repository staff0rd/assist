import type { Terminal } from "@xterm/headless";

const SGR_MOUSE_MODE = 1006;

export function trackSgrMouseMode(
	term: Pick<Terminal, "parser">,
): () => boolean {
	let sgr = false;
	const watch = (final: string, on: boolean) =>
		term.parser.registerCsiHandler({ prefix: "?", final }, (params) => {
			if (params.includes(SGR_MOUSE_MODE)) sgr = on;
			return false;
		});
	watch("h", true);
	watch("l", false);
	term.parser.registerEscHandler({ final: "c" }, () => {
		sgr = false;
		return false;
	});
	return () => sgr;
}
