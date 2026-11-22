import { autoApprovePreview } from "./autoApprovePreview";
import { autopilotAnswerPreview } from "./autopilotAnswerPreview";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { yoloAnswerPreview } from "./yoloAnswerPreview";

export function autoDecidePreview(
	sessions: Map<string, Session>,
	waiters: Map<string, SessionClient>,
	notify: () => void,
	session: Session,
): boolean {
	return (
		autopilotAnswerPreview(sessions, waiters, notify, session) ||
		yoloAnswerPreview(sessions, waiters, notify, session) ||
		autoApprovePreview(sessions, waiters, notify, session)
	);
}
