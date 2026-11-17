import type { Session } from "./createSession";
import { forgetTranscriptPath } from "./forgetTranscriptPath";

export function cachedTranscriptPath(
	session: Session,
	conversationKey: string | undefined,
): string | undefined {
	if (conversationKey && session.transcriptPathKey === conversationKey)
		return session.transcriptPath;
	if (session.transcriptPath || session.transcriptPathKey)
		forgetTranscriptPath(session);
	return undefined;
}
