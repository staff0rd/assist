import { mapAsync } from "../../shared/mapAsync";
import type { InboxScanResult } from "./runInboxScanPass";
import type { InboxScanEvent } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";

const BATCH_SIZE = 25;
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 2;

type ScanThreads = (threadIds: string[]) => Promise<InboxScanResult>;

function chunk<T>(items: T[], size: number): T[][] {
	return Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
		items.slice(i * size, (i + 1) * size),
	);
}

function errorEvent(detail: string): InboxScanEvent {
	return {
		at: new Date().toISOString(),
		kind: "error",
		label: "Gmail",
		detail,
	};
}

export async function scanUnopenedThreads(
	threadIds: string[],
	scanThreads: ScanThreads,
	onEvent: (event: InboxScanEvent) => void = () => {},
): Promise<FlaggedMessage[]> {
	const messages: FlaggedMessage[] = [];
	let pending = threadIds;
	for (let attempt = 0; attempt < MAX_ATTEMPTS && pending.length; attempt++) {
		const results = await mapAsync(
			chunk(pending, BATCH_SIZE),
			CONCURRENCY,
			(batch) =>
				scanThreads(batch).catch((error: unknown) => {
					onEvent(
						errorEvent(error instanceof Error ? error.message : String(error)),
					);
					return undefined;
				}),
		);
		const opened = new Set(results.flatMap((r) => r?.threads.opened ?? []));
		messages.push(...results.flatMap((r) => r?.messages ?? []));
		pending = pending.filter((id) => !opened.has(id));
	}
	if (pending.length)
		onEvent(
			errorEvent(
				`${pending.length} unread thread(s) never opened: ${pending.join(" ")}`,
			),
		);
	return messages;
}
