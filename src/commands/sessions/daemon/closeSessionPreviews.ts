import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function closeSessionPreviews(
	session: Session,
	waiters: Map<string, SessionClient>,
	reason: string,
): boolean {
	const previews = [session.pendingPrPreview, session.pendingShow].filter(
		(p) => p !== undefined,
	);
	const waiter = waiters.get(session.id);
	const blocking = session.pendingPrPreview;
	if (waiter && blocking && blocking.kind !== "show")
		sendTo(waiter, {
			type: "pr-decision",
			requestId: blocking.requestId,
			decision: "reject",
			reason,
			dismissed: true,
		});
	waiters.delete(session.id);
	session.pendingPrPreview = undefined;
	session.pendingShow = undefined;
	for (const p of previews)
		daemonLog(
			`pr-preview closed: id=${session.id} requestId=${p.requestId} kind=${p.kind ?? "pr"} (${reason})`,
		);
	return previews.length > 0;
}
