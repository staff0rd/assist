import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { decidePrPreview } from "./decidePrPreview";
import { recommendedAnswers } from "./recommendedAnswers";
import { yoloEnabled } from "./yoloEnabled";

export function yoloAnswerPreview(
	sessions: Map<string, Session>,
	waiters: Map<string, SessionClient>,
	notify: () => void,
	session: Session,
): boolean {
	const preview = session.pendingPrPreview;
	if (preview?.kind !== "question") return false;
	const answers = recommendedAnswers(preview.body);
	if (!answers || !yoloEnabled(session.cwd)) return false;
	daemonLog(
		`pr-preview yolo answer: id=${session.id} requestId=${preview.requestId} answers=${JSON.stringify(answers)}`,
	);
	decidePrPreview(sessions, waiters, notify, {
		sessionId: session.id,
		requestId: preview.requestId,
		decision: "approve",
		answers,
		yolo: true,
	});
	return true;
}
