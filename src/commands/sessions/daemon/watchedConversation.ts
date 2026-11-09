import {
	lookupConversation,
	type SessionConversation,
} from "../shared/conversationOf";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { unwatchTranscript } from "./unwatchTranscript";

const reportedUnreadable = new WeakSet<Session>();

export function watchedConversation(
	session: Session,
): SessionConversation | undefined {
	const lookup = lookupConversation(session);
	if (!lookup.readable) {
		if (!reportedUnreadable.has(session))
			daemonLog(`session ${session.id} transcript not read: ${lookup.reason}`);
		reportedUnreadable.add(session);
		return undefined;
	}
	if (!lookup.conversation && session.watchedTranscriptId)
		unwatchTranscript(session);
	return lookup.conversation;
}
