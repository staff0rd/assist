import { awaitsQuestionAnswer } from "../shared/awaitsQuestionAnswer";
import { deriveTranscriptStatus } from "../shared/deriveTranscriptStatus";
import { readTranscriptTailSync } from "../shared/readTranscriptTail";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import type { PersistedSession } from "./loadPersistedSessions";

export type RestoreStatus = "running" | "waiting" | "asking";

export function deriveRestoreStatus(
	persisted: PersistedSession,
): RestoreStatus {
	if (!persisted.claudeSessionId) return "waiting";
	const filePath = findTranscriptPathSync(
		persisted.cwd,
		persisted.claudeSessionId,
	);
	if (!filePath) return "waiting";
	const entries = readTranscriptTailSync(filePath);
	if (deriveTranscriptStatus(entries) === "running") return "running";
	return awaitsQuestionAnswer(entries) ? "asking" : "waiting";
}
