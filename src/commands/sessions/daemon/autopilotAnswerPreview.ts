import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { autopilotDecision } from "./autopilotDecision";
import { daemonLog } from "./daemonLog";
import { decidePrPreview } from "./decidePrPreview";

export function autopilotAnswerPreview(
	sessions: Map<string, Session>,
	waiters: Map<string, SessionClient>,
	notify: () => void,
	session: Session,
): boolean {
	const preview = session.pendingPrPreview;
	if (!session.autopilot || !preview) return false;
	const decision = autopilotDecision(preview);
	if (!decision) return false;
	daemonLog(
		`pr-preview autopilot answer: id=${session.id} requestId=${preview.requestId} kind=${preview.kind} autostart=${decision.autostart === true} answers=${JSON.stringify(decision.answers ?? {})}`,
	);
	decidePrPreview(sessions, waiters, notify, {
		sessionId: session.id,
		requestId: preview.requestId,
		decision: "approve",
		...decision,
		autopilot: true,
	});
	return true;
}
