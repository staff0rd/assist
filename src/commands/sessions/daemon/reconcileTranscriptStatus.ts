import { lookupConversation } from "../shared/conversationOf";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";
import { resolveTranscriptPath } from "./resolveTranscriptPath";
import { updateLastMessages } from "./updateLastMessages";

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
	const lookup = lookupConversation(session);
	if (!lookup.readable) return;
	const { reader } = lookup;
	const filePath = await resolveTranscriptPath(session);
	if (!filePath) return;

	const entries = await readTranscriptTail(filePath);
	const fingerprint = reader.fingerprint(entries);
	if (fingerprint !== null && fingerprint === session.transcriptFingerprint)
		return;
	session.transcriptFingerprint = fingerprint ?? undefined;

	updateLastMessages(session, reader.events(entries), notify);

	if (isFinished(session)) return;

	const derived = reader.lifecycle(entries, {
		permissionActive: session.permissionActive,
	}).status;
	if (!derived) return;
	if (derived === session.status) return;

	daemonLog(
		`session ${session.id} transcript reconcile: ${session.status} -> ${derived}`,
	);
	onStatusChange(session, derived);
}
