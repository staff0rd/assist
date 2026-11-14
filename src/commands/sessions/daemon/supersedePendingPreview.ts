import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function supersedePendingPreview(
	session: Session,
	waiters: Map<string, SessionClient>,
	newRequestId: unknown,
): string | undefined {
	const pending = session.pendingPrPreview;
	const waiter = waiters.get(session.id);
	if (!pending || pending.kind === "show" || !waiter) return undefined;
	const notifyWaiter = () =>
		sendTo(waiter, {
			type: "pr-superseded",
			requestId: pending.requestId,
			supersededBy: newRequestId,
		});
	const label = `pr-preview superseded: id=${session.id} old=${pending.requestId} new=${newRequestId}`;
	const taskId = session.pendingPreviewTaskId;
	const sdk = session.pty?.sdk;
	/* why: any exit of the superseded background task wakes the SDK agent with
	 * its completion, which it answers as if that preview were still open;
	 * stopping the task ends it without a notification. */
	if (taskId && sdk) {
		sdk.stopTask(taskId).then(
			() => daemonLog(`${label} task=${taskId} stopped`),
			(error: unknown) => {
				daemonLog(
					`${label} task=${taskId} stop failed (${error instanceof Error ? error.message : String(error)}); notifying waiter`,
				);
				notifyWaiter();
			},
		);
		return pending.requestId;
	}
	notifyWaiter();
	daemonLog(label);
	return pending.requestId;
}
