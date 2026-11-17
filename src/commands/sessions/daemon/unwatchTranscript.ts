import type { Session } from "./createSession";
import { forgetTranscriptPath } from "./forgetTranscriptPath";

export function unwatchTranscript(session: Session): void {
	session.transcriptWatcher?.close();
	session.transcriptWatcher = undefined;
	session.watchedTranscriptId = undefined;
	forgetTranscriptPath(session);
}
