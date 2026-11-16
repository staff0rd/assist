import type { ConversationReader } from "../../../shared/harnessAdapters/types";
import { clearSeenSdkPending } from "./clearSeenSdkPending";
import type { Session } from "./createSession";
import { reportUnrecognisedShapes } from "./reportUnrecognisedShapes";
import { updateLastMessages } from "./updateLastMessages";

export function applyTranscriptChange(
	session: Session,
	reader: ConversationReader,
	entries: Parameters<ConversationReader["events"]>[0],
	fingerprint: string | null,
	notify?: () => void,
): void {
	session.transcriptFingerprint = fingerprint ?? undefined;
	let changed = fingerprint !== null;
	if (changed)
		session.transcriptRevision = (session.transcriptRevision ?? 0) + 1;
	const markChanged = () => {
		changed = true;
	};

	reportUnrecognisedShapes(session, reader, entries);
	const events = reader.events(entries);
	updateLastMessages(session, events, markChanged);
	clearSeenSdkPending(session, events, markChanged);
	if (changed) notify?.();
}
