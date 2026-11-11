import { findTranscriptPathSync } from "../../commands/sessions/shared/findTranscriptPathSync";
import { readTranscriptTailSync } from "../../commands/sessions/shared/readTranscriptTail";
import { unfinishedBackgroundTasks } from "../../commands/sessions/shared/unfinishedBackgroundTasks";
import type { ConversationRef } from "./types";

export function claudeInterruptedTasks({
	cwd,
	claudeSessionId,
}: ConversationRef): string[] {
	if (!cwd || !claudeSessionId) return [];
	const filePath = findTranscriptPathSync(cwd, claudeSessionId);
	if (!filePath) return [];
	return unfinishedBackgroundTasks(readTranscriptTailSync(filePath));
}
