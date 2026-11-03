import { writeFileSync } from "node:fs";
import { changedPaths } from "./changedPaths";
import { isSyncPending } from "./isSyncPending";
import { syncAdvice } from "./syncAdvice";
import { syncPendingPath } from "./syncPendingPath";

function writePendingMarker(): void {
	try {
		writeFileSync(syncPendingPath(), "");
	} catch {}
}

export function markSyncPending(from: string): boolean {
	const owed = isSyncPending();
	if (syncAdvice(changedPaths(from)).length > 0) {
		writePendingMarker();
		return true;
	}
	if (owed) console.log("retrying a sync that failed on an earlier lap");
	return owed;
}
