import { lookupConversation } from "../shared/conversationOf";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { applyTranscriptChange } from "./applyTranscriptChange";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { isSdkSession } from "./isSdkSession";
import type { OnStatusChange } from "./types";
import { resolveTranscriptPath } from "./resolveTranscriptPath";

function isFinished(session: Session): boolean {
	return (
		session.status === "done" ||
		session.status === "error" ||
		session.status === "stopped" ||
		session.status === "parked"
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
	applyTranscriptChange(session, reader, entries, fingerprint, notify);

	if (isFinished(session)) return;

	const derived = reader.lifecycle(entries, {
		permissionActive: session.permissionActive,
	}).status;
	if (!derived) return;
	if (derived === session.status) return;
	/* why: an SDK session's turn status comes from its query stream; a resumed
	 * conversation's mid-turn tail would otherwise show Working with no turn to Stop. */
	if (isSdkSession(session)) {
		daemonLog(
			`session ${session.id} transcript reconcile ignored: ${session.status} -> ${derived} (sdk query owns status)`,
		);
		return;
	}

	daemonLog(
		`session ${session.id} transcript reconcile: ${session.status} -> ${derived}`,
	);
	onStatusChange(session, derived);
}
