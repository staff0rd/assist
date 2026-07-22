import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

type Msg = Record<string, unknown>;

export class PrPreviewCoordinator {
	private readonly waiters = new Map<string, SessionClient>();

	constructor(
		private readonly sessions: Map<string, Session>,
		private readonly notify: () => void,
	) {}

	set(client: SessionClient, d: Msg): void {
		const id = d.sessionId as string;
		const session = this.sessions.get(id);
		if (!session) {
			daemonLog(`pr-preview for unknown session id=${id} (ignoring)`);
			sendTo(client, {
				type: "error",
				message: `No live session ${id} for pr-preview`,
			});
			return;
		}
		const prNumber = typeof d.prNumber === "number" ? d.prNumber : null;
		session.pendingPrPreview = {
			requestId: d.requestId as string,
			title: d.title as string,
			body: d.body as string,
			prNumber,
		};
		this.waiters.set(id, client);
		daemonLog(
			`pr-preview set: id=${id} requestId=${d.requestId} target=${prNumber === null ? "create" : `edit #${prNumber}`}`,
		);
		this.notify();
	}

	decide(d: Msg): void {
		const id = d.sessionId as string;
		const requestId = d.requestId as string;
		const session = this.sessions.get(id);
		if (!session || session.pendingPrPreview?.requestId !== requestId) {
			daemonLog(
				`pr-decision for stale/unknown preview id=${id} requestId=${requestId} (ignoring)`,
			);
			return;
		}
		daemonLog(
			`pr-decision received: id=${id} requestId=${requestId} decision=${d.decision}`,
		);
		const waiter = this.waiters.get(id);
		if (waiter)
			sendTo(waiter, {
				type: "pr-decision",
				requestId,
				decision: d.decision,
				reason: d.reason,
			});
		this.waiters.delete(id);
		session.pendingPrPreview = undefined;
		this.notify();
	}

	clearWaiter(client: SessionClient): void {
		for (const [id, waiter] of this.waiters) {
			if (waiter !== client) continue;
			this.waiters.delete(id);
			const session = this.sessions.get(id);
			if (session) session.pendingPrPreview = undefined;
			daemonLog(`pr-preview cleared: id=${id} (waiting client disconnected)`);
			this.notify();
		}
	}
}
