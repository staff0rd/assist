import type { Terminal } from "@xterm/xterm";
import type { MouseModes } from "./createMouseModes";
import { encodeWheelReport } from "./encodeWheelReport";
import { wheelCell } from "./wheelCell";

const DOM_DELTA_PIXEL = 0;

export type WheelTerminal = Pick<
	Terminal,
	"attachCustomWheelEventHandler" | "input" | "cols" | "rows" | "element"
>;

export function forwardWheel(term: WheelTerminal, modes: MouseModes): void {
	let pending = 0;
	term.attachCustomWheelEventHandler((event) => {
		if (!modes.reportsWheel() || event.deltaY === 0) return true;
		const { col, row, rowHeight } = wheelCell(term, event);
		pending +=
			event.deltaMode === DOM_DELTA_PIXEL
				? event.deltaY / rowHeight
				: event.deltaY;
		const lines = Math.trunc(pending);
		if (lines === 0) return false;
		pending -= lines;
		term.input(encodeWheelReport(lines < 0, col, row, modes.sgr()), false);
		return false;
	});
}
