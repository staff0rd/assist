import { conversationOf } from "../shared/conversationOf";
import type { PrPreview } from "../shared/SessionInfoBase";
import { appendTranscriptEcho } from "./appendTranscriptEcho";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { paneEchoText } from "./paneEcho/paneEchoText";

const replyCommands: Partial<Record<NonNullable<PrPreview["kind"]>, string>> = {
	question: "ask-question",
};

export function recordPaneEcho(
	session: Session,
	d: Record<string, unknown>,
): void {
	const preview = session.pendingPrPreview;
	if (!session.pty?.sdk || !preview) return;
	const command = preview.kind && replyCommands[preview.kind];
	const text = command ? paneEchoText(preview, d) : "";
	const conversationId = conversationOf(session)?.id;
	if (!command || !text || !conversationId) return;
	const at = new Date().toISOString();
	appendTranscriptEcho(conversationId, { at, command, text });
	session.lastEchoAt = at;
	daemonLog(`session ${session.id} recorded ${preview.kind} reply text`);
}
