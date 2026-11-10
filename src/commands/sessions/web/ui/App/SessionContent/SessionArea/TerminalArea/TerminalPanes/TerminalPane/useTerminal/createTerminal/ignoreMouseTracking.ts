import type { IDisposable, IParser } from "@xterm/xterm";
import { createMouseModes } from "./createMouseModes";
import { forwardWheel, type WheelTerminal } from "./forwardWheel";

const MOUSE_TRACKING_MODES = new Set([9, 1000, 1001, 1002, 1003]);

export function ignoreMouseTracking(
	term: WheelTerminal & { parser: IParser },
): IDisposable {
	const modes = createMouseModes();
	const set = term.parser.registerCsiHandler(
		{ prefix: "?", final: "h" },
		(params) => {
			modes.update(params, true);
			return params.every(
				(param) => typeof param === "number" && MOUSE_TRACKING_MODES.has(param),
			);
		},
	);
	const reset = term.parser.registerCsiHandler(
		{ prefix: "?", final: "l" },
		(params) => {
			modes.update(params, false);
			return false;
		},
	);
	const ris = term.parser.registerEscHandler({ final: "c" }, () => {
		modes.clear();
		return false;
	});
	forwardWheel(term, modes);
	return {
		dispose: () => {
			set.dispose();
			reset.dispose();
			ris.dispose();
		},
	};
}
