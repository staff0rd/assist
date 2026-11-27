import type { ConversationReader } from "../../../shared/harnessAdapters/types";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import type { Session } from "./createSession";

const INITIAL_BYTES = 256 * 1024;
const MAX_BYTES = 4 * 1024 * 1024;

const hasUserRow = (
	reader: ConversationReader,
	entries: Record<string, unknown>[],
) =>
	reader
		.events(entries)
		.some((event) => event.kind === "message" && event.role === "user");

/* why: a new conversation's first prompt is followed by hundreds of KB of
 * attachment and api-request rows, pushing its user row out of the default
 * tail before the reconcile sees it; while a sent message is pending the
 * window widens until it holds a user row so the pending entry can clear. */
export async function readReconcileTail(
	session: Session,
	reader: ConversationReader,
	filePath: string,
): Promise<Record<string, unknown>[]> {
	let maxBytes = INITIAL_BYTES;
	let entries = await readTranscriptTail(filePath, maxBytes);
	while (
		session.sdkPending?.length &&
		maxBytes < MAX_BYTES &&
		!hasUserRow(reader, entries)
	) {
		maxBytes *= 4;
		const wider = await readTranscriptTail(filePath, maxBytes);
		if (wider.length === entries.length) break;
		entries = wider;
	}
	return entries;
}
