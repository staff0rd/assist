import type { InboxScanRun } from "../../commands/inbox/InboxScanEvent";
import type { BacklogDatabase } from "./Db";
import { INBOX_LAST_RUN_KEY } from "./readInboxLastRun";
import { metadata } from "./schema";

export async function writeInboxLastRun(
	orm: BacklogDatabase,
	run: InboxScanRun,
): Promise<void> {
	const value = JSON.stringify(run);
	await orm
		.insert(metadata)
		.values({ key: INBOX_LAST_RUN_KEY, value })
		.onConflictDoUpdate({ target: metadata.key, set: { value } });
}
