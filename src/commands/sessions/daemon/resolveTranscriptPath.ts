import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { conversationOf } from "../shared/conversationOf";
import type { Session } from "./createSession";

export async function resolveTranscriptPath(
	session: Session,
): Promise<string | null> {
	if (session.transcriptPath) return session.transcriptPath;
	const conversation = conversationOf(session);
	if (!conversation) return null;
	const filePath =
		conversation.reader.locate(conversation.ref) ??
		(await harnessAdapter(session.harness).conversation.locate(
			conversation.id,
		));
	if (filePath) session.transcriptPath = filePath;
	return filePath;
}
