import type { SdkSessionEvent } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function applySdkQueued(
	session: Session,
	event: Extract<SdkSessionEvent, { kind: "queued" }>,
): void {
	session.sdkQueued = event.texts.length ? event.texts : undefined;
	if (event.sent)
		session.sdkPending = [...(session.sdkPending ?? []), event.sent];
	daemonLog(
		`session ${session.id} sdk queued: ${event.texts.length}${event.sent ? " (flushed to pending)" : ""}`,
	);
}
