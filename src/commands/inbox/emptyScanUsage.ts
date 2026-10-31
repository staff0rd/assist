import type { InboxScanUsage } from "./InboxScanEvent";

export function emptyScanUsage(): InboxScanUsage {
	return {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		costUsd: null,
		durationMs: null,
	};
}
