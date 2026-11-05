import type { InboxScanUsage } from "./InboxScanEvent";

function sumNullable(a: number | null, b: number | null): number | null {
	return a === null && b === null ? null : (a ?? 0) + (b ?? 0);
}

export function addScanUsage(
	a: InboxScanUsage,
	b: InboxScanUsage,
): InboxScanUsage {
	return {
		input: a.input + b.input,
		output: a.output + b.output,
		cacheRead: a.cacheRead + b.cacheRead,
		cacheWrite: a.cacheWrite + b.cacheWrite,
		costUsd: sumNullable(a.costUsd, b.costUsd),
		durationMs: sumNullable(a.durationMs, b.durationMs),
	};
}
