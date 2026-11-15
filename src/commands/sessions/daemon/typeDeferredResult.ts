import { daemonLog } from "./daemonLog";
import type { DeferredDeliveryHost } from "./DeferredDeliveryHost";
import type { Session } from "./types";

/* why: typing into a Codex turn that is still running would interleave with
 * it, so a decision that lands mid-turn waits until the session goes idle. */
export function typeDeferredResult(
	session: Session,
	text: string,
	host: DeferredDeliveryHost,
): "typed" | "queued" {
	if (session.status === "waiting" && !session.pendingDeferredResults?.length) {
		host.io.typePrompt(session.id, text);
		return "typed";
	}
	session.pendingDeferredResults = [
		...(session.pendingDeferredResults ?? []),
		text,
	];
	daemonLog(
		`session ${session.id} queued a deferred result until the session is idle`,
	);
	return "queued";
}
