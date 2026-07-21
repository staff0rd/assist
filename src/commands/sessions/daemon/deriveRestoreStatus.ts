import { deriveTranscriptStatus } from "../shared/deriveTranscriptStatus";
import { readTranscriptTailSync } from "../shared/readTranscriptTail";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import type { PersistedSession } from "./loadPersistedSessions";

export function deriveRestoreStatus(
	persisted: PersistedSession,
): "running" | "waiting" {
	if (!persisted.claudeSessionId) return "waiting";
	const filePath = findTranscriptPathSync(
		persisted.cwd,
		persisted.claudeSessionId,
	);
	if (!filePath) return "waiting";
	const entries = readTranscriptTailSync(filePath);
	return deriveTranscriptStatus(entries) === "running" ? "running" : "waiting";
}
