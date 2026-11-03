import { existsSync } from "node:fs";
import { syncPendingPath } from "./syncPendingPath";

export function isSyncPending(): boolean {
	try {
		return existsSync(syncPendingPath());
	} catch {
		return false;
	}
}
