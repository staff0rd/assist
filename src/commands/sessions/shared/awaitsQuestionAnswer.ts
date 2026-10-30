import { hasPendingAskUserQuestion } from "./hasPendingAskUserQuestion";
import { lastDecisiveIndex } from "./lastDecisiveIndex";
import { normalizeTranscriptEvents } from "./normalizeTranscriptEvents";
import { pendingAskQuestionTasks } from "./pendingAskQuestionTasks";

export function awaitsQuestionAnswer(
	entries: Record<string, unknown>[],
): boolean {
	const events = normalizeTranscriptEvents(entries);
	return (
		hasPendingAskUserQuestion(events, lastDecisiveIndex(events)) ||
		pendingAskQuestionTasks(entries).length > 0
	);
}
