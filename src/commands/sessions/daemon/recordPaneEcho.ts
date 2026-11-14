import { conversationOf } from "../shared/conversationOf";
import { appendTranscriptEcho } from "./appendTranscriptEcho";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { paneEchoText } from "./paneEcho/paneEchoText";

export function recordPaneEcho(
	session: Session,
	d: Record<string, unknown>,
): void {
	const preview = session.pendingPrPreview;
	if (!session.pty?.sdk || !preview) return;
	const text = paneEchoText(preview, d);
	const conversationId = conversationOf(session)?.id;
	if (!text || !conversationId) return;
	const at = new Date().toISOString();
	appendTranscriptEcho(conversationId, { at, text });
	session.lastEchoAt = at;
	daemonLog(
		`session ${session.id} echoed ${preview.kind} pane text into transcript`,
	);
}
