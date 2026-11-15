import type { Terminal } from "@xterm/xterm";
import type { BufferLineInfo } from "./rowSegments";

type LineSource = Pick<Terminal, "cols" | "onResize"> & {
	buffer: { active: Pick<Terminal["buffer"]["active"], "getLine"> };
};

function isBlank(chars: string | undefined): boolean {
	return !chars || chars === " ";
}

export function createLineReader(
	term: LineSource,
): (index: number) => BufferLineInfo | undefined {
	const widths = new Set([term.cols]);
	term.onResize(({ cols }) => widths.add(cols));

	return (index) => {
		const line = term.buffer.active.getLine(index);
		if (!line) return undefined;
		const cols = term.cols;
		const text = line.translateToString(true, 0, cols);
		const reachesMargin = !isBlank(line.getCell(cols - 1)?.getChars());
		return {
			text,
			isWrapped: line.isWrapped,
			isFull: reachesMargin || (text.length < cols && widths.has(text.length)),
		};
	};
}
