import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { decidePrPreview } from "./decidePrPreview";
import { yoloCheckAnswers } from "./yoloCheckAnswers";
import { recommendedAnswers } from "./recommendedAnswers";
import { yoloEnabled } from "./yoloEnabled";

const yoloRules: Record<
	string,
	(body: string, session: Session) => Record<string, string> | undefined
> = {
	question: recommendedAnswers,
	check: yoloCheckAnswers,
};

export function yoloAnswerPreview(
	sessions: Map<string, Session>,
	waiters: Map<string, SessionClient>,
	notify: () => void,
	session: Session,
): boolean {
	const preview = session.pendingPrPreview;
	const rule = preview?.kind ? yoloRules[preview.kind] : undefined;
	if (!preview || !rule) return false;
	const answers = rule(preview.body, session);
	if (!answers || !(session.yolo || yoloEnabled(session.cwd))) return false;
	daemonLog(
		`pr-preview yolo answer: id=${session.id} requestId=${preview.requestId} kind=${preview.kind}${session.reviewStarted ? " phase=review" : ""} answers=${JSON.stringify(answers)}`,
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
