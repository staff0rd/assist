import { daemonLog } from "./daemonLog";
import type { DeferredDeliveryHost } from "./DeferredDeliveryHost";
import type { Session } from "./types";

export function flushDeferredResults(
	session: Session,
	host: DeferredDeliveryHost,
): void {
	const pending = session.pendingDeferredResults;
	if (!pending?.length) return;
	if (session.status === "done" || session.status === "error") {
		session.pendingDeferredResults = undefined;
		daemonLog(
			`session ${session.id} ended (${session.status}); ${pending.length} deferred result(s) dropped`,
		);
		return;
	}
	if (session.status !== "waiting" || !session.pty) return;
	session.pendingDeferredResults = undefined;
	host.io.typePrompt(session.id, pending.join("\n\n"));
	daemonLog(
		`session ${session.id} typed ${pending.length} queued deferred result(s)`,
	);
}
