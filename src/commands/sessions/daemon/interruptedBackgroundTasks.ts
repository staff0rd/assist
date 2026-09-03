import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { readTranscriptTailSync } from "../shared/readTranscriptTail";
import { unfinishedBackgroundTasks } from "../shared/unfinishedBackgroundTasks";
import type { PersistedSession } from "./loadPersistedSessions";

export function interruptedBackgroundTasks(
	persisted: PersistedSession,
): string[] {
	if (!persisted.claudeSessionId) return [];
	const filePath = findTranscriptPathSync(
		persisted.cwd,
		persisted.claudeSessionId,
	);
	if (!filePath) return [];
	return unfinishedBackgroundTasks(readTranscriptTailSync(filePath));
}
