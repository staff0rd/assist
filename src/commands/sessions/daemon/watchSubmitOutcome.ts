import { readTranscriptTail } from "../shared/readTranscriptTail";
import { transcriptTailFingerprint } from "../shared/transcriptTailFingerprint";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { resolveTranscriptPath } from "./resolveTranscriptPath";
import type { OnStatusChange } from "./types";

export const SUBMIT_GRACE_MS = 5000;

async function turnStarted(session: Session, fingerprint?: string) {
	const filePath = await resolveTranscriptPath(session);
	if (!filePath) return true;
	const entries = await readTranscriptTail(filePath);
	return (transcriptTailFingerprint(entries) ?? undefined) !== fingerprint;
}

export function clearPendingSubmit(session: Session): void {
	session.pendingSubmit?.cancel();
	session.pendingSubmit = undefined;
}

export function watchSubmitOutcome(
	session: Session,
	onStatusChange: OnStatusChange,
): void {
	clearPendingSubmit(session);
	const fingerprint = session.transcriptFingerprint;
	const pending = { fingerprint, cancel: () => {} };
	const check = async () => {
		if (session.pendingSubmit !== pending) return;
		session.pendingSubmit = undefined;
		if (session.status !== "running") return;
		if (await turnStarted(session, fingerprint)) return;
		if (session.status !== "running" || session.pendingSubmit) return;
		daemonLog(
			`session ${session.id} resumed-prompt submit started no turn -> waiting`,
		);
		onStatusChange(session, "waiting");
	};
	const timer = setTimeout(() => void check(), SUBMIT_GRACE_MS);
	timer.unref?.();
	pending.cancel = () => clearTimeout(timer);
	session.pendingSubmit = pending;
}
