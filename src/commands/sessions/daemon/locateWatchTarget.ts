import type { SessionConversation } from "../shared/conversationOf";
import type { Session } from "./createSession";
import { ensureProjectDirExists } from "./ensureProjectDirExists";
import {
	cancelTranscriptWatchRetry,
	retryTranscriptWatch,
} from "./retryTranscriptWatch";

export function locateWatchTarget(
	session: Session,
	conversation: SessionConversation,
	retry: () => void,
): { dir: string; file: string } | null {
	const target = conversation.reader.watchTarget(conversation.ref);
	if (!target) {
		retryTranscriptWatch(session, conversation.key, retry);
		return null;
	}
	cancelTranscriptWatchRetry(session);
	return ensureProjectDirExists(target.dir, session.id) ? target : null;
}
