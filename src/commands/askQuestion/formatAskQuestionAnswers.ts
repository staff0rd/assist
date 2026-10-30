import type { AskQuestion } from "../sessions/shared/askQuestionInputSchema";

export function formatAskQuestionAnswers(
	questions: AskQuestion[],
	answers: Record<string, string>,
): string {
	const pairs = questions
		.map(({ question }) => `"${question}"="${answers[question] ?? ""}"`)
		.join(", ");
	return `User has answered your questions: ${pairs}. You can now continue with the user's answers in mind.`;
}
