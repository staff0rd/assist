import { autoApprovePreview } from "./autoApprovePreview";
import { autopilotScheduler } from "./autopilot/autopilotScheduler";
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
	const decided =
		autopilotAnswerPreview(sessions, waiters, notify, session) ||
		yoloAnswerPreview(sessions, waiters, notify, session) ||
		autoApprovePreview(sessions, waiters, notify, session);
	const preview = session.pendingPrPreview;
	if (!decided && session.autopilot && preview && preview.kind !== "show")
		autopilotScheduler.reportFailure(session.id, {
			reason: `a ${preview.kind ?? "pr"} preview autopilot cannot answer is waiting for you`,
		});
	return decided;
}
