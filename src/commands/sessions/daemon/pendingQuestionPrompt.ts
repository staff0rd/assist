export function pendingQuestionPrompt(backgroundTaskIds: string[]): string {
	const preamble =
		"A restart interrupted this conversation while your question was waiting for an answer. The user never saw it and it is no longer on screen.";
	if (backgroundTaskIds.length === 0)
		return `${preamble} Ask the same question again with AskUserQuestion.`;
	return `${preamble} It killed ${backgroundTaskIds.length} background task(s) that were still running (${backgroundTaskIds.join(", ")}). If you asked with assist ask-question, run the same assist ask-question again as a background task; otherwise ask again with AskUserQuestion. Restart any other killed task that should still be running.`;
}
