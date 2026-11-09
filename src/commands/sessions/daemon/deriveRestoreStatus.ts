import { conversationOf } from "../shared/conversationOf";
import { readTranscriptTailSync } from "../shared/readTranscriptTail";
import type { PersistedSession } from "./loadPersistedSessions";

export type RestoreStatus = "running" | "waiting" | "asking";

export function deriveRestoreStatus(
	persisted: PersistedSession,
): RestoreStatus {
	const conversation = conversationOf(persisted);
	if (!conversation) return "waiting";
	const filePath = conversation.reader.locate(conversation.ref);
	if (!filePath) return "waiting";
	const lifecycle = conversation.reader.lifecycle(
		readTranscriptTailSync(filePath),
	);
	if (lifecycle.status === "running") return "running";
	return lifecycle.asking ? "asking" : "waiting";
}
