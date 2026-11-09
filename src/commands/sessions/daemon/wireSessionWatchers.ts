import { bindConversation } from "./bindConversation";
import type { Session } from "./createSession";
import type { OnStatusChange } from "./types";
import { watchActivity } from "./watchActivity";
import { watchTranscript } from "./watchTranscript";

export function wireSessionWatchers(
	session: Session,
	notify: () => void,
	onStatusChange: OnStatusChange,
): void {
	const wireTranscript = (s: Session) =>
		watchTranscript(s, notify, onStatusChange);
	watchActivity(session, notify, wireTranscript);
	wireTranscript(session);
	bindConversation(session, notify, session.startedAt, wireTranscript);
}
