import { bindConversation } from "./bindConversation";
import type { Session } from "./createSession";
import type { OnStatusChange } from "./types";
import { watchTranscript } from "./watchTranscript";

export function rebindAfterRespawn(
	session: Session,
	notify: () => void,
	onStatusChange: OnStatusChange,
): void {
	if (!session.pty) return;
	bindConversation(session, notify, session.startedAt, (s) =>
		watchTranscript(s, notify, onStatusChange),
	);
}
