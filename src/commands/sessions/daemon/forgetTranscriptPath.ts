import type { Session } from "./createSession";

export function forgetTranscriptPath(session: Session): void {
	session.transcriptPath = undefined;
	session.transcriptPathKey = undefined;
	session.transcriptFingerprint = undefined;
}
