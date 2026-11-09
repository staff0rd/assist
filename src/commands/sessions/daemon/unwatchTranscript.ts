import type { Session } from "./createSession";

export function unwatchTranscript(session: Session): void {
	session.transcriptWatcher?.close();
	session.transcriptWatcher = undefined;
	session.watchedTranscriptId = undefined;
	session.transcriptPath = undefined;
	session.transcriptFingerprint = undefined;
}
