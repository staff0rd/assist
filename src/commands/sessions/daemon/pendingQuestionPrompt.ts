import { wrapRestartNudge } from "../shared/wrapRestartNudge";

export function pendingQuestionPrompt(backgroundTaskIds: string[]): string {
	const preamble =
		"A restart interrupted this conversation while your question was waiting for an answer. The user never saw it and it is no longer on screen.";
	if (backgroundTaskIds.length === 0)
		return wrapRestartNudge(
			`${preamble} Ask the same question again with AskUserQuestion.`,
			0,
		);
	return wrapRestartNudge(
		`${preamble} It killed ${backgroundTaskIds.length} background task(s) that were still running (${backgroundTaskIds.join(", ")}). If you asked with assist ask-question or assist ask-check, run that same command again as a background task; otherwise ask again with AskUserQuestion. Restart any other killed task that should still be running.`,
		backgroundTaskIds.length,
	);
}
