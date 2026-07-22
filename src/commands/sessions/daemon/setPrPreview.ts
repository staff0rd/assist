import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

type Msg = Record<string, unknown>;

export function setPrPreview(
	sessions: Map<string, Session>,
	waiters: Map<string, SessionClient>,
	notify: () => void,
	client: SessionClient,
	d: Msg,
): void {
	const id = d.sessionId as string;
	const session = sessions.get(id);
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
	waiters.set(id, client);
	daemonLog(
		`pr-preview set: id=${id} requestId=${d.requestId} target=${prNumber === null ? "create" : `edit #${prNumber}`}`,
	);
	notify();
}
