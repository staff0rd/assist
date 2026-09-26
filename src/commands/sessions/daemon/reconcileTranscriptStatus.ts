import { deriveTranscriptStatus } from "../shared/deriveTranscriptStatus";
import { extractLastUserMessage } from "../shared/extractLastUserMessage";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { transcriptTailFingerprint } from "../shared/transcriptTailFingerprint";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";
import { resolveTranscriptPath } from "./resolveTranscriptPath";

function updateLastUserMessage(
	session: Session,
	entries: Record<string, unknown>[],
	notify?: () => void,
): void {
	const message = extractLastUserMessage(entries);
	if (message === session.lastUserMessage) return;
	session.lastUserMessage = message;
	daemonLog(
		`session ${session.id} last user message: ${JSON.stringify(message?.slice(0, 120) ?? null)}`,
	);
	notify?.();
}

function isFinished(session: Session): boolean {
	return (
		session.status === "done" ||
		session.status === "error" ||
		session.status === "stopped"
	);
}

export async function reconcileTranscriptStatus(
	session: Session,
	onStatusChange: OnStatusChange,
	notify?: () => void,
): Promise<void> {
	const filePath = await resolveTranscriptPath(session);
	if (!filePath) return;

	const entries = await readTranscriptTail(filePath);
	const fingerprint = transcriptTailFingerprint(entries);
	if (fingerprint !== null && fingerprint === session.transcriptFingerprint)
		return;
	session.transcriptFingerprint = fingerprint ?? undefined;

	updateLastUserMessage(session, entries, notify);

	if (isFinished(session)) return;

	const derived = deriveTranscriptStatus(entries, {
		permissionActive: session.permissionActive,
	});
	if (!derived) return;
	if (derived === session.status) return;

	daemonLog(
		`session ${session.id} transcript reconcile: ${session.status} -> ${derived}`,
	);
	onStatusChange(session, derived);
}
