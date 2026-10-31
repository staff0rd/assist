import type { BacklogDatabase } from "../../shared/db/Db";
import { readInboxLastScan } from "../../shared/db/readInboxLastScan";
import { upsertInboxMessages } from "../../shared/db/upsertInboxMessages";
import { writeInboxLastScan } from "../../shared/db/writeInboxLastScan";
import type { InboxScanEvent } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { runInboxScanClaude } from "./runInboxScanClaude";

const FIRST_SCAN_LOOKBACK_MS = 24 * 60 * 60_000;

function toRow(message: FlaggedMessage) {
	const receivedAt = message.receivedAt
		? new Date(message.receivedAt)
		: undefined;
	return {
		source: message.source,
		messageId: message.messageId,
		sender: message.sender,
		summary: message.summary,
		link: message.link,
		receivedAt:
			receivedAt && !Number.isNaN(receivedAt.getTime()) ? receivedAt : null,
	};
}

type RunInboxScanOptions = {
	wrap?: (
		since: Date,
		run: () => Promise<FlaggedMessage[]>,
	) => Promise<FlaggedMessage[]>;
	onEvent?: (event: InboxScanEvent) => void;
};

export async function runInboxScan(
	orm: BacklogDatabase,
	{ wrap = (_since, run) => run(), onEvent }: RunInboxScanOptions = {},
): Promise<{ flagged: number; added: number }> {
	const startedAt = new Date();
	const since =
		(await readInboxLastScan(orm)) ??
		new Date(startedAt.getTime() - FIRST_SCAN_LOOKBACK_MS);
	const flagged = await wrap(since, () => runInboxScanClaude(since, onEvent));
	const added = await upsertInboxMessages(orm, flagged.map(toRow));
	await writeInboxLastScan(orm, startedAt);
	return { flagged: flagged.length, added };
}
