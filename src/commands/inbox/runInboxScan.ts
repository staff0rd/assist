import type { BacklogDatabase } from "../../shared/db/Db";
import type { JobTrigger } from "../../shared/db/jobRuns";
import { readInboxLastScan } from "../../shared/db/readInboxLastScan";
import { upsertInboxMessages } from "../../shared/db/upsertInboxMessages";
import { writeInboxLastScan } from "../../shared/db/writeInboxLastScan";
import type { InboxScanResult } from "./createInboxScanParser";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { runInboxScanClaude } from "./runInboxScanClaude";
import { withInboxScanJob } from "./withInboxScanJob";

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

type RunInboxScanOptions = InboxScanListener & {
	trigger: JobTrigger;
	wrap?: (
		since: Date,
		run: () => Promise<InboxScanResult>,
	) => Promise<InboxScanResult>;
};

export async function runInboxScan(
	orm: BacklogDatabase,
	{ trigger, wrap = (_since, run) => run(), ...listener }: RunInboxScanOptions,
): Promise<{ flagged: number; added: number; usage: InboxScanUsage }> {
	return withInboxScanJob(orm, trigger, listener, async (tracked) => {
		const startedAt = new Date();
		const since =
			(await readInboxLastScan(orm)) ??
			new Date(startedAt.getTime() - FIRST_SCAN_LOOKBACK_MS);
		const { messages, usage } = await wrap(since, () =>
			runInboxScanClaude(since, tracked),
		);
		const added = await upsertInboxMessages(orm, messages.map(toRow));
		await writeInboxLastScan(orm, startedAt);
		return { flagged: messages.length, added, usage };
	});
}
