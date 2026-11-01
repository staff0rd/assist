import type { Terminal } from "@xterm/xterm";

export type LineAccumulator = { px: number };

function cellHeight(el: HTMLElement, term: Terminal): number {
	const screen = el.querySelector<HTMLElement>(".xterm-screen");
	return screen && term.rows > 0 ? screen.clientHeight / term.rows : 0;
}

function scrollTerminal(
	term: Terminal,
	px: number,
	cell: number,
	acc: LineAccumulator,
) {
	acc.px += px;
	const lines = Math.trunc(acc.px / cell);
	if (lines === 0) return;
	acc.px -= lines * cell;
	term.scrollLines(lines);
}

export function scrollPhoneTerminal(
	el: HTMLElement,
	term: Terminal,
	dy: number,
	acc: LineAccumulator,
): void {
	const cell = cellHeight(el, term);
	if (cell <= 0) return;
	const { viewportY, baseY } = term.buffer.active;
	if (dy < 0) {
		const outer = Math.max(dy, -el.scrollTop);
		el.scrollTop += outer;
		if (dy - outer < 0 && viewportY > 0)
			scrollTerminal(term, dy - outer, cell, acc);
		return;
	}
	if (viewportY < baseY) {
		scrollTerminal(term, dy, cell, acc);
		return;
	}
	el.scrollTop += dy;
}
