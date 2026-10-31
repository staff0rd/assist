import { eq } from "drizzle-orm";
import type { InboxScanRun } from "../../commands/inbox/InboxScanEvent";
import type { BacklogDatabase } from "./Db";
import { metadata } from "./schema";

export const INBOX_LAST_RUN_KEY = "inbox.lastRun";

export async function readInboxLastRun(
	orm: BacklogDatabase,
): Promise<InboxScanRun | undefined> {
	const [row] = await orm
		.select()
		.from(metadata)
		.where(eq(metadata.key, INBOX_LAST_RUN_KEY));
	return row ? (JSON.parse(row.value) as InboxScanRun) : undefined;
}
