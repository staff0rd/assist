import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { logPrDecision } from "./logPrDecision";

type Msg = Record<string, unknown>;

export function decidePrPreview(
	sessions: Map<string, Session>,
	waiters: Map<string, SessionClient>,
	notify: () => void,
	d: Msg,
): void {
	const id = d.sessionId as string;
	const requestId = d.requestId as string;
	const session = sessions.get(id);
	if (session?.pendingShow?.requestId === requestId) {
		daemonLog(
			`pr-preview stacked show closed: id=${id} requestId=${requestId}`,
		);
		session.pendingShow = undefined;
		notify();
		return;
	}
	if (!session || session.pendingPrPreview?.requestId !== requestId) {
		daemonLog(
			`pr-decision for stale/unknown preview id=${id} requestId=${requestId} (ignoring)`,
		);
		return;
	}
	logPrDecision(id, requestId, d);
	const waiter = waiters.get(id);
	if (waiter)
		sendTo(waiter, {
			type: "pr-decision",
			requestId,
			decision: d.decision,
			reason: d.reason,
			comments: d.comments,
			screenshots: d.screenshots,
			body: d.body,
			reviewAfter: d.reviewAfter,
			announceAfter: d.announceAfter,
			draft: d.draft,
			autoMerge: d.autoMerge,
			autostart: d.autostart,
			checklist: d.checklist,
			reviewEvent: d.reviewEvent,
			reviewComments: d.reviewComments,
			dismissed: d.dismissed,
			answers: d.answers,
		});
	waiters.delete(id);
	session.pendingPrPreview = undefined;
	notify();
}
