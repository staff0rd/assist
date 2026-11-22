import type { AskQuestion } from "../sessions/shared/askQuestionInputSchema";
import type { AutoAnsweredBy } from "../sessions/shared/autoAnsweredBy";

const AUTO_PREFIX: Record<AutoAnsweredBy, string> = {
	yolo: "Yolo mode answered your questions with their (Recommended) options",
	autopilot:
		"Autopilot answered your questions with their (Recommended) options, else the first option",
};

export function formatAskQuestionAnswers(
	questions: AskQuestion[],
	answers: Record<string, string>,
	answeredBy?: AutoAnsweredBy,
): string {
	const pairs = questions
		.map(({ question }) => `"${question}"="${answers[question] ?? ""}"`)
		.join(", ");
	if (answeredBy)
		return `${AUTO_PREFIX[answeredBy]}; the user did not see them: ${pairs}. You can now continue with these answers in mind.`;
	return `User has answered your questions: ${pairs}. You can now continue with the user's answers in mind.`;
}
