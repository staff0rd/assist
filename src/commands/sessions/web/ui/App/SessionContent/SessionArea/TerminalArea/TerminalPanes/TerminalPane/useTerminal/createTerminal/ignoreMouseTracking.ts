import type { IDisposable, IParser } from "@xterm/xterm";

const MOUSE_TRACKING_MODES = new Set([9, 1000, 1001, 1002, 1003]);

export function ignoreMouseTracking(term: { parser: IParser }): IDisposable {
	return term.parser.registerCsiHandler({ prefix: "?", final: "h" }, (params) =>
		params.every(
			(param) => typeof param === "number" && MOUSE_TRACKING_MODES.has(param),
		),
	);
}
