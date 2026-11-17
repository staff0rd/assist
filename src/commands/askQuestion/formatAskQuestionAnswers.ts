import type { AskQuestion } from "../sessions/shared/askQuestionInputSchema";

export function formatAskQuestionAnswers(
	questions: AskQuestion[],
	answers: Record<string, string>,
	yolo = false,
): string {
	const pairs = questions
		.map(({ question }) => `"${question}"="${answers[question] ?? ""}"`)
		.join(", ");
	if (yolo)
		return `Yolo mode answered your questions with their (Recommended) options; the user did not see them: ${pairs}. You can now continue with these answers in mind.`;
	return `User has answered your questions: ${pairs}. You can now continue with the user's answers in mind.`;
}
