import { findSessionJsonlPath } from "../shared/findSessionJsonlPath";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import type { Session } from "./createSession";

export async function resolveTranscriptPath(
	session: Session,
): Promise<string | null> {
	if (session.transcriptPath) return session.transcriptPath;
	if (!session.claudeSessionId) return null;
	const direct = session.cwd
		? findTranscriptPathSync(session.cwd, session.claudeSessionId)
		: null;
	const filePath =
		direct ?? (await findSessionJsonlPath(session.claudeSessionId));
	if (filePath) session.transcriptPath = filePath;
	return filePath;
}
