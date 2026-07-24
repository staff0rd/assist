import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

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
	if (!session || session.pendingPrPreview?.requestId !== requestId) {
		daemonLog(
			`pr-decision for stale/unknown preview id=${id} requestId=${requestId} (ignoring)`,
		);
		return;
	}
	const commentCount = Array.isArray(d.comments) ? d.comments.length : 0;
	const screenshotCount = Array.isArray(d.screenshots)
		? d.screenshots.length
		: 0;
	daemonLog(
		`pr-decision received: id=${id} requestId=${requestId} decision=${d.decision} comments=${commentCount} screenshots=${screenshotCount}`,
	);
	const waiter = waiters.get(id);
	if (waiter)
		sendTo(waiter, {
			type: "pr-decision",
			requestId,
			decision: d.decision,
			reason: d.reason,
			comments: d.comments,
			screenshots: d.screenshots,
		});
	waiters.delete(id);
	session.pendingPrPreview = undefined;
	notify();
}
