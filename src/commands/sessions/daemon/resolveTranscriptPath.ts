import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { conversationOf } from "../shared/conversationOf";
import { cachedTranscriptPath } from "./cachedTranscriptPath";
import type { Session } from "./createSession";

export async function resolveTranscriptPath(
	session: Session,
): Promise<string | null> {
	const conversation = conversationOf(session);
	const cached = cachedTranscriptPath(session, conversation?.key);
	if (cached) return cached;
	if (!conversation) return null;
	const filePath =
		conversation.reader.locate(conversation.ref) ??
		(await harnessAdapter(session.harness).conversation.locate(
			conversation.id,
		));
	if (filePath) {
		session.transcriptPath = filePath;
		session.transcriptPathKey = conversation.key;
	}
	return filePath;
}
