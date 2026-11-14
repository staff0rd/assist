import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { unseenPendingTexts } from "../shared/unseenPendingTexts";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function clearSeenSdkPending(
	session: Session,
	events: ConversationEvent[],
	notify?: () => void,
): void {
	if (!session.sdkPending) return;
	const rows = events.map((event) =>
		event.kind === "message" ? event : { role: event.kind },
	);
	const unseen = unseenPendingTexts(session.sdkPending, rows);
	if (unseen.length === session.sdkPending.length) return;
	session.sdkPending = unseen.length ? unseen : undefined;
	daemonLog(
		`session ${session.id} sdk pending seen in transcript: ${unseen.length} left`,
	);
	notify?.();
}
