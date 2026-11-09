import type { BacklogDatabase } from "../../shared/db/Db";
import { failStaleJobRuns } from "../../shared/db/failStaleJobRuns";
import { INBOX_SCAN_TIMEOUT_MS } from "./inboxConnectorRun";

const GRACE_MS = 5 * 60_000;

export function failTimedOutInboxScans(
	db: BacklogDatabase,
	now = new Date(),
): Promise<number> {
	return failStaleJobRuns(db, {
		startedBefore: new Date(now.getTime() - INBOX_SCAN_TIMEOUT_MS - GRACE_MS),
		detail: `No result within ${INBOX_SCAN_TIMEOUT_MS / 60_000}m: the process running it likely exited`,
	});
}
