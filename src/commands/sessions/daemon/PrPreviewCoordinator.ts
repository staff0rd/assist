import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { closeSessionPreviews } from "./closeSessionPreviews";
import { daemonLog } from "./daemonLog";
import { decidePrPreview } from "./decidePrPreview";
import { setPrPreview } from "./setPrPreview";

type Msg = Record<string, unknown>;

export class PrPreviewCoordinator {
	private readonly waiters = new Map<string, SessionClient>();

	constructor(
		private readonly sessions: Map<string, Session>,
		private readonly notify: () => void,
	) {}

	set(client: SessionClient, d: Msg): void {
		setPrPreview(this.sessions, this.waiters, this.notify, client, d);
	}

	decide(d: Msg): void {
		decidePrPreview(this.sessions, this.waiters, this.notify, d);
	}

	closeAll(id: string, reason: string): void {
		const session = this.sessions.get(id);
		if (session && closeSessionPreviews(session, this.waiters, reason))
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
