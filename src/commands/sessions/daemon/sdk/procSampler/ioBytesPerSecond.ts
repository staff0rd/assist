import type { LeafProcessSample } from "./sampleLeafProcess";

function delta(next?: number, prev?: number): number | undefined {
	return next === undefined || prev === undefined ? undefined : next - prev;
}

export function ioBytesPerSecond(
	next: LeafProcessSample,
	prev: LeafProcessSample | undefined,
	seconds: number,
): number | undefined {
	if (!prev || prev.pid !== next.pid || seconds <= 0) return undefined;
	const read = delta(next.readBytes, prev.readBytes);
	const write = delta(next.writeBytes, prev.writeBytes);
	if (read === undefined && write === undefined) return undefined;
	// why: socket recv() is not counted in rchar, so a download only shows up as the bytes it writes out
	return Math.round(Math.max(read ?? 0, write ?? 0) / seconds);
}
