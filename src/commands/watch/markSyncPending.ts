import { existsSync, writeFileSync } from "node:fs";
import { changedPaths } from "./changedPaths";
import { syncAdvice } from "./syncAdvice";
import { syncPendingPath } from "./syncPendingPath";

function pendingFromEarlierLap(): boolean {
	try {
		return existsSync(syncPendingPath());
	} catch {
		return false;
	}
}

function writePendingMarker(): void {
	try {
		writeFileSync(syncPendingPath(), "");
	} catch {}
}

export function markSyncPending(from: string): boolean {
	const owed = pendingFromEarlierLap();
	if (syncAdvice(changedPaths(from)).length > 0) {
		writePendingMarker();
		return true;
	}
	if (owed) console.log("retrying a sync that failed on an earlier lap");
	return owed;
}
