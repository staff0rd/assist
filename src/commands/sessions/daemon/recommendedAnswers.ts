import { parseQuestions } from "../shared/parseQuestions";
import { findRecommendedOption } from "./findRecommendedOption";

export function recommendedAnswers(
	body: string,
): Record<string, string> | undefined {
	const questions = parseQuestions(body);
	if (!questions) return undefined;
	const answers: Record<string, string> = {};
	for (const question of questions) {
		if (question.multiSelect) return undefined;
		const option = findRecommendedOption(question.options);
		if (!option) return undefined;
		answers[question.question] = option.label;
	}
	return answers;
}
