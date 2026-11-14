import { conversationOf } from "../shared/conversationOf";
import { CHECK_NOTE_KEY } from "../shared/askCheckInputSchema";
import { appendTranscriptEcho } from "./appendTranscriptEcho";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

function noteOf(d: Record<string, unknown>): string | undefined {
	const answers = d.answers as Record<string, unknown> | undefined;
	const note = answers?.[CHECK_NOTE_KEY];
	return typeof note === "string" && note.trim() ? note.trim() : undefined;
}

export function recordCheckNoteEcho(
	session: Session,
	d: Record<string, unknown>,
): void {
	if (!session.pty?.sdk || session.pendingPrPreview?.kind !== "check") return;
	const text = noteOf(d);
	const conversationId = conversationOf(session)?.id;
	if (!text || !conversationId) return;
	const at = new Date().toISOString();
	appendTranscriptEcho(conversationId, { at, text });
	session.lastEchoAt = at;
	daemonLog(`session ${session.id} echoed check note into transcript`);
}
